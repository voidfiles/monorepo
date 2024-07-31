import enum
from seeds.crawl.models import CrawlItem
from typing import Optional
import redis
import structlog
from dataclasses import dataclass
from typing import Generator
from redis.lock import Lock
from urllib.parse import urlparse, ParseResult

logger = structlog.get_logger(name=__name__)


class ResourceStatus(str, enum.Enum):
    EMPTY = "empty"
    WAITING = "crawling"
    READY = "ready"


r = redis.Redis.from_url("redis://localhost/3", decode_responses=True)


@dataclass
class URLResult:
    url: str
    parsed_url: ParseResult


class ResourceService:
    _cache = redis.Redis

    def __init__(self):
        self._cache = r

    def id_key(self, crawl_item: CrawlItem) -> str:
        return "id:%s" % (crawl_item.id())

    def lock_key(self, crawl_item: CrawlItem) -> str:
        return "lock:id:%s" % (crawl_item.id())

    def fingerprint_key(self, fingerprint: str) -> str:
        return "fingerprint:%s" % (fingerprint)

    def resolve_url(self, raw_url: str) -> Optional[str]:
        key = "raw_url:%s" % (raw_url)
        return self._cache.get(key)

    def put_resolve_url(self, raw_url: str, resolved_url: str):
        key = "raw_url:%s" % (raw_url)
        return self._cache.set(key, resolved_url)

    async def pull(self, crawl_item: CrawlItem) -> Optional[ResourceStatus]:
        key = self.id_key(crawl_item)
        value = self._cache.get(key)

        if value is None:
            return None
        
        return ResourceStatus(value)

    async def put_status(self, crawl_item: CrawlItem, status: ResourceStatus):
        self._cache.set(
            self.id_key(crawl_item),
            status.value,
        )

    async def get_or_crawl(self, crawl_item: CrawlItem) -> Optional[ResourceStatus]:
        with Lock(self._cache, self.lock_key(crawl_item)):
            val = await self.pull(crawl_item)
            if val:
                return val
      
            await self.put_status(crawl_item, ResourceStatus.WAITING)

    def scan_urls(self) -> Generator[any, any, ParseResult]:
        cursor = '0'
        while cursor != 0:
            cursor, keys = self._cache.scan(cursor=cursor, match="raw_url:*", count=100)
            values = self._cache.mget(*keys)
            for value in values:
                yield URLResult(value, urlparse(value))


resource_service = ResourceService()
