from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from .resource import get_resource, StopRequest

app = FastAPI()

templates = Jinja2Templates(directory="templates")


@app.get("/url/html", response_class=HTMLResponse)
async def read_html(request: Request, url: str):
    try:
        resource = await get_resource(url)
    except StopRequest:
        raise HTTPException(status_code=403, detail="stop requesting URL")

    return templates.TemplateResponse(
        request=request,
        name="extract.html.jinja2",
        context={"id": id, "resource": resource},
    )


@app.get("/url/json")
async def read_json(url: str):
    try:
        resource = await get_resource(url)
    except StopRequest:
        raise HTTPException(status_code=403, detail="stop requesting URL")

    return {
        "resource": {
            "text": resource.text,
            "html": resource.html,
            "metadata": resource.metadata,
            "links": resource.outbound_links,
            "url": resource.url,
            "headers": resource.headers,
            "final_url": resource.final_url,
        }
    }
