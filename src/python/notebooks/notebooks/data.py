from enum import Enum, StrEnum, auto
from dataclasses import dataclass, field
from django.core import signing


# kinds of data
class MediaKind(StrEnum):
    ALL = auto()
    BOOK = auto()
    ALBUM = auto()
    SONG = auto()
    MOVIE = auto()
    TV = auto()
    PODCAST = auto()
    OTHER = auto()


class MediaSource(Enum):
    ITUNES = 1
    OPEN_LIBRARY = 2


@dataclass
class SearchRequest:
    query: str
    kind: MediaKind = MediaKind.ALL


@dataclass
class MediaItem:
    source: MediaSource
    source_item_id: str | None
    title: list[str]
    kind: MediaKind
    source_author_id: list[str | None] = field(default_factory=list)
    source_collection_id: str | None = None
    collection_title: str | None = None
    authors: list[str] = field(default_factory=list)
    image_small: str | None = None
    image_medium: str | None = None
    score: int = 0

    def id(self):
        return "%s:%s" % (self.source.value, self.source_item_id)


MediaList = list[MediaItem]
