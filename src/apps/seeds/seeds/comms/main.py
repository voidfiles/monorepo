import os
import json
from dataclasses import dataclass
from structlog import get_logger
import feedparser
from lxml.html import fromstring
import httpx
import hishel
from typing import Optional
from seeds.resource.models import CrawledResource
from seeds.resource.service import resource_service

controller = hishel.Controller(
    # Cache only GET and POST methods
    cacheable_methods=["GET"],
    # Cache only 200 status codes
    cacheable_status_codes=[200],
    # Use the stale response if there is a connection issue and the new response cannot be obtained.
    allow_stale=True,
    # First, revalidate the response and then utilize it.
    # If the response has not changed, do not download the
    # entire response data from the server; instead,
    # use the one you have because you know it has not been modified.
    always_revalidate=False,
)

CACHE_PATH = os.environ.get("CACHE_PATH", None)
storage = hishel.AsyncFileStorage(base_path=CACHE_PATH)

MAX_BODY = 1024 * 10 * 10 * 10

logger = get_logger(name=__name__)


class ResponseToBig(Exception):
    pass


HttpxError = (
    httpx.HTTPStatusError
    | httpx.RemoteProtocolError
    | httpx.RequestError
    | httpx.HTTPError
)


CLIPPER_HOST = os.environ.get("CLIPPER_HOST", "https://clipper.brntgarlic.com/url/json")


class BlockedRequest(Exception):
    pass


async def get_resource(url: str) -> CrawledResource:
    client = hishel.AsyncCacheClient(timeout=20)
    async with client.stream("GET", CLIPPER_HOST, params={"url": url}) as response:
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise BlockedRequest()
            raise

        if int(response.headers.get("Content-Length", 0)) > MAX_BODY:
            raise ResponseToBig

        resp = b""
        async for chunk in response.aiter_bytes():
            resp += chunk

        data = json.loads(resp)

        return CrawledResource(**data["resource"])


@dataclass
class FeedItem:
    id: str
    url: str
    source: str
    outbound_links: list[str]

    @classmethod
    def from_entry(cls, entry, source) -> "FeedItem":
        desc = fromstring(entry["description"])
        desc.make_links_absolute(entry.link)
        outbound_links = filter(
            None, [a.attrib.get("href") for a in desc.cssselect("a")]
        )

        return cls(
            id=entry.id, url=entry.link, source=source, outbound_links=outbound_links
        )


async def fully_resolve_url(url: str) -> Optional[str]:
    resolved_url = resource_service.resolve_url(url)
    if resolved_url:
        return resolved_url

    client = hishel.AsyncCacheClient(timeout=20)
    resp = None
    try:
        resp = await client.get(
            "https://pproxy.brntgarlic.com/soft-get", params={"url": url}
        )
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
            raise BlockedRequest()
        raise

    data = resp.json()

    resolved_url = data.get("final_url")
    resource_service.put_resolve_url(url, resolved_url)

    return resolved_url


async def get_feed(
    url: str, client: Optional[httpx.AsyncClient] = None
) -> list[FeedItem]:
    feed = None
    client = client or hishel.AsyncCacheClient(timeout=20)
    async with client.stream("GET", url) as response:
        response.raise_for_status()

        if int(response.headers.get("Content-Length", 0)) > MAX_BODY:
            raise ResponseToBig

        resp = ""
        async for chunk in response.aiter_text():
            resp += chunk

        feed = feedparser.parse(resp)

    if not feed:
        raise Exception("Failed to get feed")

    return [FeedItem.from_entry(x, source=url) for x in feed.entries]
