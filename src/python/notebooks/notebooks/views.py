from typing import List, TypeVar

from django.http import HttpRequest
from django.shortcuts import render
from .search import find_media_items
from .data import SearchRequest, MediaKind


T = TypeVar("T")


def from_query_to_enum(value: str, enum: T, default=None) -> T | None:
    try:
        return enum(value)
    except ValueError:
        return default


async def search(request: HttpRequest):
    search_query = SearchRequest(
        query=request.GET.get("query", "Jack Johnson"),
        kind=MediaKind.ALL,
    )

    media = from_query_to_enum(request.GET.get("mediatype", ""), MediaKind)
    if media:
        search_query.kind = media

    items = await find_media_items(search_query)

    return render(
        request,
        "search.html",
        context={
            "items": items or [],
            "search_query": search_query,
            "MediaKind": [
                MediaKind.ALL,
                MediaKind.BOOK,
                MediaKind.MOVIE,
                MediaKind.TV,
                MediaKind.ALBUM,
                MediaKind.SONG,
                MediaKind.PODCAST,
            ],
        },
        content_type="text/html",
        status=200,
    )
