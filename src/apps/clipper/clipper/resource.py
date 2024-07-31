import os
import re
import json
from dataclasses import dataclass
import hishel
import httpx
from markdown2 import Markdown
from markdownify import markdownify as md
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)
import logging
from .metadata import extract_metadata
from .models import Metadata
from .putil import canonical_url
from .readability import Document as ReadabilityDocument
from .santize import process

logger = logging.getLogger(__name__)

markdowner = Markdown()


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

CACHE_PATH = os.environ.get("CACHE_PAHT", None)
storage = hishel.AsyncFileStorage(base_path=CACHE_PATH)

MAX_BODY = 1024 * 10 * 10 * 10

client = hishel.AsyncCacheClient(
    controller=controller,
    storage=storage,
    timeout=20,
    headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    },
)


class ResponseToBig(Exception):
    pass


HttpxError = (
    httpx.HTTPStatusError
    | httpx.RemoteProtocolError
    | httpx.RequestError
    | httpx.HTTPError
)

PPROXY_HOST = os.environ.get("PPROXY_HOST", "http://127.0.0.1:8000/proxy")


class StopRequest(Exception):
    pass


@retry(
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(HttpxError),
)
async def get_body_text(url: str) -> tuple[str, str, dict[str, any]]:

    final_url = ""
    resp = b""
    async with client.stream(
        "GET", PPROXY_HOST, params={"url": url}, follow_redirects=True
    ) as response:
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise StopRequest()

            raise

        if int(response.headers.get("Content-Length", 0)) > MAX_BODY:
            raise ResponseToBig

        byes = b""
        async for chunk in response.aiter_bytes():
            byes += chunk

        final_url = str(response.url)

        data = json.loads(byes)

        resp = data.get("body")
        headers = data.get("headers")
        final_url = data.get("final_url")

    return resp, final_url, headers


class Document(ReadabilityDocument):
    def metadata(self) -> Metadata:
        return extract_metadata(self._html(), self.url)

    def images(self):
        doc = self._html()
        for img in doc.cssselect("img"):
            print("%s" % img.get("src"))

    def links(self) -> list[str]:
        doc = self._html()
        return [a.attrib["href"] for a in doc.cssselect("a") if a.attrib.get("href")]


IMG_RE = re.compile(r"^.*.(jpg|jpeg|gif|png|webp)(?:\?.*)?$", re.IGNORECASE)


def filter_image_urls(url):
    return not IMG_RE.match(url)


@dataclass
class Resource(object):
    url: str
    final_url: str
    metadata: dict[str, any]
    text: str
    html: str
    outbound_links: list[str]
    headers: dict[str, any]

    def render_markdown(self) -> str:
        return markdowner.convert(self.text)


async def get_resource(url: str) -> Resource:
    body, final_url, headers = await get_body_text(url)
    final_url = canonical_url(final_url)
    # body = process(body)
    doc = Document(body, url=url)
    links = [canonical_url(x) for x in doc.links()]
    links = list(filter(filter_image_urls, links))
    metadata = doc.metadata().data
    html = ""
    try:
        html = doc.summary()
        html = process(html)
    except Exception:
        logger.info("Failed to parse html for %s" % (final_url))
        pass

    text = md(html).strip()
    return Resource(url, final_url, metadata, text, html, links, headers)
