import os

import httpx
from markdownify import markdownify as md
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)
import hishel
from markdown2 import Markdown
from .metadata import extract_metadata
from .models import Metadata


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

storage = hishel.AsyncFileStorage()

MAX_BODY = 1024 * 10

PORT = os.environ.get("PORT", "8000")
app = FastAPI()

client = hishel.AsyncCacheClient(
    controller=controller,
    storage=storage,
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


@retry(
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(HttpxError),
)
async def get_body_text(url: str) -> str:
    resp = b""
    async with client.stream("GET", url) as response:
        response.raise_for_status()

        if int(response.headers.get("Content-Length", 0)) > MAX_BODY:
            raise ResponseToBig

        resp = ""
        async for chunk in response.aiter_text():
            resp += chunk

    return resp


class Document(ReadabilityDocument):
    def metadata(self) -> Metadata:
        return extract_metadata(self._html(), self.url)

    def images(self):
        doc = self._html()
        for img in doc.cssselect("img"):
            print("%s" % img.get("src"))


class Resource(object):
    metadata: dict[str, any]
    text: str
    html: str

    def __init__(self, metadata, text, html):
        self.metadata = metadata
        self.text = text
        self.html = html

    def render_markdown(self) -> str:
        return markdowner.convert(self.text)


async def get_document(url: str) -> Resource:
    body = await get_body_text(url)
    doc = Document(body, url=url)
    metadata = doc.metadata().data
    html = extractor.get_marked_html(body)
    text = md(html)
    return Resource(metadata=metadata, text=text, html=html)


templates = Jinja2Templates(directory="templates")


@app.get("/url/html", response_class=HTMLResponse)
async def read_html(request: Request, url: str):
    resource = await get_document(url)

    return templates.TemplateResponse(
        request=request,
        name="extract.html.jinja2",
        context={"id": id, "resource": resource},
    )


@app.get("/url/json")
async def read_json(url: str):
    resource = await get_document(url)

    return {
        "resource": {
            "text": resource.text,
            "html": resource.html,
            "metadata": resource.metadata,
        }
    }
