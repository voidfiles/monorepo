from .seed import Seed, SeedSource
from .crawl import Crawl
from typing import Tuple
from seeds.crawl.utils import canonical_url


async def create_seed(
    uri: str,
    kind: SeedSource = SeedSource.webpage,
) -> Seed:
    uri = canonical_url(uri)
    seed, _created = await Seed.get_or_create({"kind": kind}, uri=uri)

    return seed


async def get_seeds() -> Seed:
    return await Seed.all()


async def create_crawl(
    seed: Seed | int, idempotency_key: str, crawl_key: str
) -> Tuple[Crawl, bool]:
    kwargs = {"idempotency_key": idempotency_key}
    if isinstance(seed, Seed):
        kwargs["seed"] = seed
    else:
        kwargs["seed_id"] = seed
    print("%s %s" % (kwargs, crawl_key))
    return await Crawl.get_or_create({"crawl_key": crawl_key}, **kwargs)
