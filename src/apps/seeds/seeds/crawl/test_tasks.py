import pytest
from dataclasses import dataclass, field
from .tasks import should_crawl, CrawlItem, CrawlJob
from seeds.models import Seed
from seeds.models import service as model_service
import httpx
import respx


@pytest.mark.asyncio
async def test_read_main():
    crawl_item = CrawlItem(
        crawl_url="https://example.com", canonical_url="https://example.com"
    )

    await should_crawl(crawl_item)


@pytest.mark.asyncio
@respx.mock
async def test_crawl_job(db_session):

    seed = await model_service.create_seed("https://example.com/feed", Seed.Source.feed)
    seedb = await model_service.create_seed(
        "https://example.com/feed/2", Seed.Source.feed
    )

    @dataclass
    class TestCase:
        crawl_job: CrawlJob
        result: CrawlJob.States
        requests: list[respx.Route] = field(default_factory=list)

    test_cases = [
        TestCase(
            crawl_job=CrawlJob(
                seed_id=seed.id, url="https://example.com", generation=0
            ),
            result=CrawlJob.States.RESOLVE_URL,
        ),
        TestCase(
            crawl_job=CrawlJob(
                seed_id=seedb.id,
                url="https://example.com/index.html",
                generation=0,
                state=CrawlJob.States.RESOLVE_URL,
            ),
            result=CrawlJob.States.CRAWL,
            requests=[
                respx.route(
                    host="pproxy.brntgarlic.com",
                    method="GET",
                    path="/soft-get",
                ).mock(
                    return_value=httpx.Response(
                        200, json={"final_url": "https://example.com/2"}
                    )
                )
            ],
        ),
    ]

    for _i, tc in enumerate(test_cases):
        result = await tc.crawl_job.start()
        assert result == tc.result
        for resp in tc.requests:
            assert resp.call_count == 1
