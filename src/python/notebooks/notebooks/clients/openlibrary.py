import math
from logging import Logger
from enum import Enum
from urllib.parse import urlencode

from notebooks.data import MediaItem, MediaList, SearchRequest, MediaKind, MediaSource

import httpx

logger = Logger(__name__)

BASE_URL = "https://openlibrary.org/search.json?"


def search_to_query(search: SearchRequest) -> str:
    data = {
        "q": search.query,
    }

    return urlencode(data)


def dict_to_media_item(response_data: dict) -> MediaItem | None:
    first_publish_year = response_data.get("first_publish_year", 0)
    published_years = response_data.get("publish_year", [])
    last_publish_year = max(published_years) if published_years else 0

    years_between = 0
    if first_publish_year and last_publish_year:
        years_between = last_publish_year - first_publish_year

    ratings_multiplier = 1
    ratings_average = response_data.get("ratings_average")
    if ratings_average:
        ratings_multiplier = float(ratings_average) / float(5)

    already_read_count = response_data.get("already_read_count", 0)
    want_to_read_count = response_data.get("want_to_read_count", 0)
    currently_reading_count = response_data.get("currently_reading_count", 0)

    activity = already_read_count + want_to_read_count + currently_reading_count
    try:
        score = math.log(int(activity + years_between))
    except ValueError:
        score = 1

    source_item_id = response_data.get("key", "").replace("/works/", "")
    cover_i = response_data.get("cover_i")
    image_medium = None
    image_small = None
    if cover_i:
        image_medium = "https://covers.openlibrary.org/b/id/%s-M.jpg" % (cover_i)
        image_small = "https://covers.openlibrary.org/b/id/%s-S.jpg" % (cover_i)

    return MediaItem(
        source=MediaSource.OPEN_LIBRARY,
        source_collection_id=None,
        source_item_id=source_item_id,
        source_author_id=response_data.get("author_key", []),
        title=[response_data.get("title", "Missing Title")],
        authors=response_data.get("author_name", []),
        score=int(score),
        kind=MediaKind.BOOK,
        image_medium=image_medium,
        image_small=image_small,
    )


async def search(search: SearchRequest) -> None | MediaList:
    search_url = BASE_URL + search_to_query(search)
    logger.info("Searching for " + search_url)

    # Make HTTP GET request asynchronously.
    async with httpx.AsyncClient() as client:
        response = await client.get(search_url)

    if response.status_code != httpx.codes.OK:
        return None

    response_data = response.json()

    if response_data.get("num_found", 0) == 0:
        return None

    data: MediaList = []

    for item in response_data.get("docs", []):
        media_item = dict_to_media_item(item)
        if not media_item:
            continue

        data += [media_item]

    return data
