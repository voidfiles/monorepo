import pytest
from .seed import SeedSource
from .service import create_seed, get_seeds, create_crawl


@pytest.mark.asyncio
async def test_create_seed(db_session):
    s1 = await create_seed(uri="https://google.com/feed", kind=SeedSource.feed)

    s2 = await create_seed(uri="https://google.com/feed", kind=SeedSource.feed)

    assert s1.id == s2.id


@pytest.mark.asyncio
async def test_get_seeds(db_session):
    await create_seed(uri="https://google.com/feed/1", kind=SeedSource.feed)
    await create_seed(uri="https://google.com/bob", kind=SeedSource.feed)
    seeds = await get_seeds()

    assert len(seeds) == 2


@pytest.mark.asyncio
async def test_create_crawl(db_session):
    seed = await create_seed(uri="https://google.com/feed/1", kind=SeedSource.feed)
    crawl, created = await create_crawl(seed, "a", "b")
    assert created
    assert crawl.seed_id == seed.id
    assert crawl.crawl_key == "b"

    crawl, created = await create_crawl(seed, "a", "b")
    assert created is False
    assert crawl.seed_id == seed.id
    assert crawl.crawl_key == "b"

    seed = await create_seed(uri="https://google.com/feed/2", kind=SeedSource.feed)
    crawl, created = await create_crawl(seed.id, "a", "b")
    assert created
    assert crawl.seed_id == seed.id

    crawl, created = await create_crawl(seed.id, "a", "b")
    assert created is False
    assert crawl.seed_id == seed.id
