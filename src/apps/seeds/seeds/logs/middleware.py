import structlog
from starlette.requests import Request
from starlette.responses import Response


async def logging_middleware(request: Request, call_next) -> Response:
    req_id = request.headers.get("request-id")

    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=req_id,
    )

    response: Response = await call_next(request)

    return response
