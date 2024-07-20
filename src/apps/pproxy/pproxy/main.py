import json
import os
from dataclasses import dataclass
from contextlib import asynccontextmanager

import aiocron
import httpx
import structlog
from fastapi import FastAPI, HTTPException, Response
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)
from user_agents import get_user_agent

from .proxy_pool import ProxyPool

logger = structlog.get_logger(name=__name__)

# 10 MB
MAX_BODY = 1024 * 1024 * 10

PORT = os.environ.get("PORT", "8000")

logger.info("Starting up API")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up")

    @aiocron.crontab("*/20 * * * *")
    async def attime():
        logger.info("Updating proxy pool")
        await proxy_pool.update()
        update_client_pool()

    yield

app = FastAPI(lifespan=lifespan)

logger.info("building proxy pool")
proxy_pool = ProxyPool()

HTTP_CLIENTS = {"clients": {}}

paid_proxy = httpx.AsyncClient(
    proxy="socks5://mcmadige-rotate:di3eeitpzi9m@p.webshare.io:80",
    headers={"User-Agent": get_user_agent()},
    timeout=15,
    follow_redirects=True,
    max_redirects=10
)


def build_http_clients(n: int):
    proxies = proxy_pool.proxies(n)

    for i in range(n):
        proxy = proxies[i]
        yield httpx.AsyncClient(
            mounts=proxy,
            headers={"User-Agent": get_user_agent()},
            verify=False,
            timeout=15,
            follow_redirects=True,
            max_redirects=10
        )


def update_client_pool():
    HTTP_CLIENTS["clients"] = {
        i: b for [i, b] in enumerate([x for x in build_http_clients(30)])
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
    request_response: httpx.Response
    fastapi_response: Response


async def _get_response(url: str, response: Response, client: httpx.AsyncClient, soft_get: bool = False) -> ProxyResponse:
    body = b""
    try:
        async with client.stream("GET", url, headers={"User-Agent": get_user_agent()}) as request_response:
            request_response.raise_for_status()
            if soft_get:
                body = b"{}"
                return ProxyResponse(
                    body=body,
                    request_response=request_response,
                    fastapi_response=response
                )

            if int(request_response.headers.get("Content-Length", 0)) > MAX_BODY:
                raise ResponseToBig()

            async for chunk in request_response.aiter_bytes():
                body += chunk

                if request_response.num_bytes_downloaded >= MAX_BODY:
                    raise ResponseToBig()

    except httpx.ProxyError as e:
        logger.error(
            "Failed because of a proxy issue, removing proxy from list", error=e
        )
        # del HTTP_CLIENTS["clients"][key]
        raise
    except httpx.HTTPStatusError as e:
        logger.error("failed to proxy url", url=url, error=e)
        response.status_code = e.response.status_code
        request_response = e.response
        try:
            body = request_response.read()
        except Exception:
            body = b"{}"

    return ProxyResponse(
        body=body,
        request_response=request_response,
        fastapi_response=response
    )


@retry(
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(HttpxError),
)
async def get_response(url: str, response: Response, client: httpx.AsyncClient, soft_get: bool = False) -> ProxyResponse:
    try:
        return await _get_response(url, response, client, soft_get)
    except Exception as e:
        logger.error("failed to proxy url", url=url, error=e)
        response.status_code = 504
        raise


async def proxy_request(url: str, response: Response, client: httpx.AsyncClient, soft_get: bool = False):
    try:
        resp = await get_response(url, response, client, soft_get)
        body = resp.body
        request_response = resp.request_response
    except Exception as e:
        logger.error("failed to proxy url", url=url, error=e)
        raise HTTPException(status_code=504, detail="Upstream failure")

    if request_response.headers.get("content-type") == "application/json":
        body = json.loads(body)

    return {
        "body": body,
        "start_url": url,
        "final_url": str(request_response.url),
        "headers": {item[0]: item[1] for item in request_response.headers.items()},
        "status_code": request_response.status_code,
    }

@app.get("/proxy")
async def _proxy_request(url: str, response: Response):
    client = paid_proxy
    return await proxy_request(url, response, client)

@app.get("/soft-get")
async def _soft_get(url: str, response: Response):
    client = paid_proxy
    return await proxy_request(url, response, client, soft_get=True)
