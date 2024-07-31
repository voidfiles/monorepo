import pytest
from seeds.models.seed import SeedSource
from seeds.models import service as models_service

from .service import crawl_seed
from unittest.mock import patch


@pytest.mark.asyncio
async def test_crawl_seed(db_session):

    feed = await models_service.create_seed(
        "https://google.com/feed", kind=SeedSource.feed
    )
    webpage = await models_service.create_seed("https://google.com/")

    with patch("seeds.crawl.tasks.handle_feed.delay") as handle_feed_delay:
        await crawl_seed(feed)
        handle_feed_delay.assert_called()

    with patch("seeds.crawl.tasks.crawl.delay") as handle_feed_delay:
        await crawl_seed(webpage)
