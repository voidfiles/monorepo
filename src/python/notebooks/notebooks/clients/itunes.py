from logging import Logger
from enum import Enum
from urllib.parse import urlencode

from notebooks.data import MediaItem, MediaList, SearchRequest, MediaKind, MediaSource

import httpx

logger = Logger(__name__)


class AppleKind(Enum):
    ALL = "all"
    MOVIE = "movie"
    PODCAST = "podcast"
    MUSIC = "music"
    TV = "tvShow"
    BOOK = "ebook"


DEFAULT = AppleKind.ALL

APPLE_RESULT_KIND_TO_MEDIA_KIND_MAP = {
    "book": MediaKind.BOOK,
    "song": MediaKind.SONG,
    "album": MediaKind.ALBUM,
    "feature-movie": MediaKind.MOVIE,
    "tv-episode": MediaKind.TV,
    "tv": MediaKind.TV,
}


MEDIA_KIND_TO_APPLE_REQUEST_KIND_MAP = {
    MediaKind.ALL: AppleKind.ALL,
    MediaKind.BOOK: AppleKind.BOOK,
    MediaKind.ALBUM: AppleKind.MUSIC,
    MediaKind.SONG: AppleKind.MUSIC,
    MediaKind.MOVIE: AppleKind.MOVIE,
    MediaKind.TV: AppleKind.TV,
    MediaKind.PODCAST: AppleKind.PODCAST,
}


def itunes_search_to_query(search: SearchRequest) -> str:
    data = {
        "term": search.query,
    }

    if (
        search.kind != MediaKind.ALL
        and search.kind in MEDIA_KIND_TO_APPLE_REQUEST_KIND_MAP
    ):
        data["media"] = MEDIA_KIND_TO_APPLE_REQUEST_KIND_MAP[search.kind].value

    return urlencode(data)


def str_or_none(input) -> str | None:
    if input:
        return "%s" % (input)

    return None


def dict_to_media_item(item: dict) -> None | MediaItem:
    return MediaItem(
        source=MediaSource.ITUNES,
        source_item_id=str_or_none(item.get("trackId")),
        source_author_id=[str_or_none(item.get("artistId"))],
        source_collection_id=str_or_none(item.get("collectionId")),
        title=[item.get("trackName", "Missing Track Name")],
        collection_title=item.get("collectionName"),
        authors=[item.get("artistName", "Missing author name")],
        kind=APPLE_RESULT_KIND_TO_MEDIA_KIND_MAP.get(
            item.get("kind", None), MediaKind.OTHER
        ),
        image_medium=item.get("artworkUrl100"),
        image_small=item.get("artworkUrl60"),
    )


async def search(search: SearchRequest) -> None | MediaList:
    search_url = "https://itunes.apple.com/search?" + itunes_search_to_query(search)
    logger.info("Searching for " + search_url)
    # Make HTTP GET request asynchronously.
    async with httpx.AsyncClient() as client:
        response = await client.get(search_url)

    if response.status_code != httpx.codes.OK:
        return None

    response_data = response.json()

    if response_data.get("resultCount", 0) == 0:
        return None

    data: MediaList = []

    for item in response_data.get("results", []):
        media_item = dict_to_media_item(item)
        if not media_item:
            continue

        data += [media_item]

    return data
