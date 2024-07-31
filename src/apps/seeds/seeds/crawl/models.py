from contextlib import contextmanager
from dataclasses import dataclass, asdict
from dataclasses_json import DataClassJsonMixin
import hashlib
import enum
from typing import Optional, TypeVar

from .utils import canonical_url
MAX_GENERATIONS = 3


@dataclass
class CrawlItem:
    crawl_url: str
    canonical_url: str
    generation: int = 0

    def id(self) -> str:
        return self.canonical_url

    @classmethod
    def from_link(cls, link: str, last_generation: int = 0) -> Optional["CrawlItem"]:
        generation = last_generation + 1
        if generation >= MAX_GENERATIONS:
            return None
        
        curl = canonical_url(link)

        return cls(crawl_url=link, canonical_url=curl, generation=generation)