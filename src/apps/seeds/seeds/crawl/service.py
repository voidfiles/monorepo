from seeds.models import Seed
from seeds.models.seed import SeedSource

from .tasks import CrawlJob, handle_feed


async def crawl_seed(seed: Seed):
    if seed.kind == SeedSource.feed:
        handle_feed.delay(seed_id=seed.id, url=seed.uri)
    else:
        await CrawlJob(seed_id=seed.id, url=seed.uri, generation=-1).start()
