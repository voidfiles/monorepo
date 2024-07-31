from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from collections import defaultdict
from seeds.resource.service import resource_service

from seeds.logs import configure_logger, logging_middleware

configure_logger()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

app.add_middleware(BaseHTTPMiddleware, logging_middleware)


@app.get("/info", response_class=HTMLResponse)
async def read_item(request: Request):
    urls = list(resource_service.scan_urls())
    domain_counts = defaultdict(lambda: 0)
    for url in urls:
        domain_counts[url.parsed_url.netloc] += 1

    urls_by_domain = defaultdict(list)
    for url in urls:
        urls_by_domain[url.parsed_url.netloc].append(url)

    urls = sorted(
        urls_by_domain.items(), key=lambda x: domain_counts[x[0]], reverse=True
    )
    return templates.TemplateResponse(
        request=request, name="info.html", context={"urls": urls}
    )
