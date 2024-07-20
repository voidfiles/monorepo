import pytest
from dataclasses import dataclass, field
from typing import Optional, AsyncIterator
from .main import _get_response, ResponseToBig
from fastapi import Response
import httpx


async def identity(x): return x


async def chunked(size, source) -> AsyncIterator[bytes]:
    for i in range(0, len(source), size):
        yield await identity(source[i:i+size])


class AsyncResponseStream(httpx.AsyncByteStream):
    def __init__(self, aiterator: AsyncIterator[bytes]):
        self._aiterator = aiterator

    async def __aiter__(self) -> AsyncIterator[bytes]:
        async for part in self._aiterator:
            yield part


@dataclass
class GetResponseTestItem:
    name: str
    url: str = "https://example.com"
    status_code: int = 200
    body: bytes = None
    headers: dict[str, str] = field(default_factory=dict)
    raise_error: Optional[Exception] = None
    expected_body: bytes = None
    expected_error: Optional[Exception] = None


get_response_tests = [
    # Content-Length
    GetResponseTestItem("Good", body=b"yo", expected_body=b"yo"),
    GetResponseTestItem(
        "Content Size headers to big",
        body=b"yo",
        expected_body=b"yo",
        headers={
            "Content-Length": "10000000000000000000000",
        },
        expected_error=ResponseToBig
    ),
    GetResponseTestItem(
        "Content too big",
        body=b"*" * (1024 * 1024 * 11),
        expected_body=b"yo",
        headers={},
        expected_error=ResponseToBig
    ),
    GetResponseTestItem(
        "failed",
        status_code=500,
        body=b"yo",
        expected_body=b"{}",
        expected_error=httpx.HTTPStatusError
    ),
    GetResponseTestItem(
        "failed",
        status_code=500,
        body=b"yo",
        expected_body=b"{}",
        raise_error=httpx.ProxyError("test"),
        expected_error=httpx.ProxyError
    ),
    GetResponseTestItem(
        "other kind of exception",
        status_code=504,
        body=b"yo",
        expected_body=b"{}",
        expected_error=Exception,
        raise_error=Exception('yo'),
    ),
]


@pytest.mark.timeout(10)
@pytest.mark.asyncio
async def test__get_response():

    for t in get_response_tests:
        b = None

        async def handler(request: httpx.Request):
            if t.raise_error:
                raise t.raise_error

            return httpx.Response(
                t.status_code,
                stream=AsyncResponseStream(
                    chunked(1024 * 512, t.body)
                ),
                headers=t.headers,
            )

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)

        try:
            b = await _get_response("https://example.com", Response("", 200), client)
        except Exception as e:
            assert t.expected_error is not None, e
            assert isinstance(e, t.expected_error)

        if b:
            assert b.body == t.expected_body
