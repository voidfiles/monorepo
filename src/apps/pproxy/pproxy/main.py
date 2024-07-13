import json
import os
from dataclasses import dataclass
from random import choice

import aiocron
import httpx
import structlog
from fastapi import FastAPI, HTTPException
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)
from user_agents import get_user_agent

from .proxy_pool import ProxyPool

logger = structlog.get_logger(name=__name__)

MAX_BODY = 1024 * 10

PORT = os.environ.get("PORT", "8000")

logger.info("Starting up API")

app = FastAPI()

logger.info("building proxy pool")
proxy_pool = ProxyPool()

HTTP_CLIENTS = {"clients": {}}


def build_http_clients(n: int):
    proxies = proxy_pool.proxies(n)

    for i in range(n):
        proxy = proxies[i]
        yield httpx.AsyncClient(
            mounts=proxy,
            headers={"User-Agent": get_user_agent()},
            verify=False,
        )


def update_client_pool():
    HTTP_CLIENTS["clients"] = {
        i: b for [i, b] in enumerate([x for x in build_http_clients(10)])
    }


update_client_pool()


class ResponseToBig(Exception):
    pass


HttpxError = (
    httpx.NetworkError
    | httpx.TimeoutException
    | httpx.NetworkError
    | httpx.StreamError
    | httpx.ProtocolError
    | httpx.ProxyError
)


@dataclass
class ProxyResponse:
    body: str
    response: httpx.Response


@retry(
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(HttpxError),
)
async def get_response(url: str) -> ProxyResponse:

    key, client = choice(list(HTTP_CLIENTS["clients"].items()))
    resp = b""
    try:
        async with client.stream("GET", url) as response:
            # try:
            #     response.raise_for_status()
            # except httpx.ProxyError as e:
            #     print(e)
            #     raise

            if int(response.headers.get("Content-Length", 0)) > MAX_BODY:
                raise ResponseToBig

            resp = ""
            async for chunk in response.aiter_text():
                resp += chunk
    except httpx.ProxyError as e:
        logger.error(
            "Failed because of a proxy issue, removing proxy from list", error=e
        )
        del HTTP_CLIENTS["clients"][key]
        raise

    return ProxyResponse(body=resp, response=response)


@app.get("/proxy")
async def proxy_request(url: str):
    try:
        resp = await get_response(url)
    except Exception as e:
        logger.error("failed to proxy url", url=url, error=e)
        raise HTTPException(status_code=504, detail="Upstream failure")

    body = resp.body
    if resp.response.headers.get("content-type") == "application/json":
        body = json.loads(body)

    return {
        "body": body,
        "headers": {item[0]: item[1] for item in resp.response.headers.items()},
    }


@app.on_event("startup")
async def startup():
    logger.info("Starting up")

    @aiocron.crontab("*/20 * * * *")
    async def attime():
        logger.info("Updating proxy pool")
        await proxy_pool.update()
        update_client_pool()
