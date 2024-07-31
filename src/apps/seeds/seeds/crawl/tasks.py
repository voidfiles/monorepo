import re
import validators
from seeds.tasks.main import app
import structlog
from .models import CrawlItem, MAX_GENERATIONS
from seeds.comms.main import get_feed, get_resource, fully_resolve_url, BlockedRequest
from seeds.resource.service import resource_service
from asgiref.sync import async_to_sync
from seeds.resource.models import CrawledResource
from seeds.comms.cf import client as cf_client
from dataclasses import dataclass, field
from dataclasses_json import DataClassJsonMixin
from seeds.models.resource import Resource
import hashlib
import enum
from .utils import canonical_url
from .locks import get_or_set_tag_in
from ulid import ULID
from seeds.models import service as model_service
from celery.utils.log import get_task_logger

logger = structlog.wrap_logger(get_task_logger(__name__))

IGNORE_URLS_REGEX = [
    re.compile(r"^http(s?):\/\/www.facebook.com.*"),
    re.compile(r"^http(s?):\/\/app.feedblitz.com.*"),
    re.compile(r"^http(s?):\/\/www.feedblitz.com.*"),
    re.compile(r"^http(s?):\/\/x.com/intent.*"),
    re.compile(r"^http(s?):\/\/www.pinterest.com"),
]


def filter_url(url: str):
    if not validators.url(url):
        return False

    for reg in IGNORE_URLS_REGEX:
        if reg.match(url):
            return False

    return True


async def should_crawl(crawl_item: CrawlItem) -> bool:
    return await resource_service.get_or_crawl(crawl_item) is not None


async def async_filter(async_pred, iterable):
    for item in iterable:
        should_yield = await async_pred(item)
        if should_yield:
            yield item


async def crawl_feed(seed_id: int, url: str):
    logger.info("handle_feed: start", url=url)
    entries = await get_feed(url)

    items = []
    for e in entries:
        # items.append(e.url)
        items.extend([x for x in e.outbound_links])

    for i in items:
        await CrawlJob(seed_id=seed_id, url=i, generation=-1).start()

    logger.info("handle_feed: end", url=url, num_items=len(items))


class StopRequest(Exception):
    pass


class QuietStopProgress(StopRequest):
    pass


async def store_resource(resource: CrawledResource):
    cf_client.upload_unless(resource.path(), resource.to_json())


@app.task
def handle_feed(seed_id: int, url: str):
    async_to_sync(crawl_feed)(seed_id, url)


class States(enum.Enum):
    START = "start"
    END = "end"
    RESOLVE_URL = "resolve_url"
    CRAWL = "crawl"


@dataclass
class CrawlJob(DataClassJsonMixin):
    States = States
    NEXT = "next"
    seed_id: int
    url: str
    generation: int = 0
    state: States = States.START
    id: str = field(default_factory=lambda: str(ULID()))

    def filter(self):
        if not filter_url(self.url):
            raise QuietStopProgress("Filtering out the url")

    async def tag_in(self):
        crawl, created = await model_service.create_crawl(
            seed=self.seed_id, idempotency_key=self.idempotency_key(), crawl_key=self.id
        )

        if not created and self.id != crawl.crawl_key:
            assert False, (self.id, crawl.crawl_key)
            raise QuietStopProgress("Another CrawlJob is happening for url")

    def idempotency_key(self) -> str:
        return self.url
        # return hashlib.sha1(bytes(self.url, "utf-8")).hexdigest()

    async def start(self) -> States:
        try:
            await self.next()
        except StopRequest as e:
            logger.debug("CrawlJob: stop request", url=self.url, error=e)

        return self.state

    async def next(self) -> States:
        next_func = "on_%s" % (self.state.value)
        logger.debug(
            "CrawlJob: next", next_func=next_func, state=self.state, url=self.url
        )
        next = await self.__getattribute__(next_func)()
        if next == States.END:
            return next

        self.state = next
        logger.debug(
            "CrawlJob: next -> done",
            next_func=next_func,
            next_state=self.state,
            url=self.url,
        )
        crawl.delay(**self.to_dict(encode_json=True))

        return next

    async def on_start(self) -> States:
        if self.generation >= MAX_GENERATIONS:
            raise StopRequest()

        self.filter()
        await self.tag_in()
        self.url = canonical_url(self.url)

        self.filter()
        await self.tag_in()

        return States.RESOLVE_URL

    async def on_resolve_url(self) -> States:
        self.url = await fully_resolve_url(self.url)

        self.filter()

        await self.tag_in()

        return States.CRAWL

    async def on_crawl(self) -> States:
        resource = await get_resource(self.url)

        await store_resource(resource)

        r = Resource(
            domain=resource.domain,
            uri=resource.final_url,
            html=resource.html,
            text=resource.text,
            addl_metadata=resource.metadata,
        )

        await r.save()

        logger.info("resource stored", url=resource.url, metadata=resource.metadata)

        for url in resource.links:
            generation = self.generation + 1
            await CrawlJob(url=url, generation=generation).start()

        return States.END


@app.task(bind=True, max_retries=5)
def crawl(self, **kwargs):
    logger.debug("crawl: start", **kwargs)
    j = CrawlJob.from_dict(kwargs)
    try:
        async_to_sync(j.next)()
    except (StopRequest, BlockedRequest) as e:
        log_func = logger.error
        if isinstance(e, QuietStopProgress):
            log_func = logger.debug

        log_func(
            "handle_crawl: ending request because job called stop", **kwargs, error=e
        )
        return None
    except Exception as e:
        raise self.retry(exc=e)

    logger.debug("handle_crawl: end", **kwargs)
