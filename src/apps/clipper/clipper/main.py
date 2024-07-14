from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from .resource import get_resource

app = FastAPI()

templates = Jinja2Templates(directory="templates")


@app.get("/url/html", response_class=HTMLResponse)
async def read_html(request: Request, url: str):
    resource = await get_resource(url)

    return templates.TemplateResponse(
        request=request,
        name="extract.html.jinja2",
        context={"id": id, "resource": resource},
    )


@app.get("/url/json")
async def read_json(url: str):
    resource = await get_resource(url)

    print("metadata %s" % (resource.metadata))
    print("outbound_links %s" % (resource.outbound_links))
    print("url %s" % (resource.url))
    print("final_url %s" % (resource.final_url))

    return {
        "resource": {
            "text": resource.text,
            "html": resource.html,
            "metadata": resource.metadata,
            "links": resource.outbound_links,
            "url": resource.url,
            "final_url": resource.final_url,
        }
    }
