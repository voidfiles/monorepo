import math
from logging import Logger
from enum import Enum
from urllib.parse import urlencode

from notebooks.data import MediaItem, MediaList, SearchRequest, MediaKind, MediaSource

import httpx

logger = Logger(__name__)

API_KEY = "51319_4f4740df23a19b42d2a54df9874382c0"

BASE_URL = "https://api2.isbndb.com/"


def search_to_query(search: SearchRequest) -> str:
    data = {
        "q": search.query,
    }

    return urlencode(data)
