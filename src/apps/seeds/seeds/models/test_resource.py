import pytest
from .resource import Resource
from .seed import Seed, SeedSource


@pytest.mark.asyncio
async def test_resource(db_session):
    r = Resource(
        domain="google.come",
        uri="https://google.com",
        text="yo yo yo",
        html="bbbbb",
        addl_metadata={"go": "bb", "blah": {"go": "bo"}},
    )
    await r.save()

    s = Seed(name="MR", uri="https://google.com/feed", kind=SeedSource.feed.value)
    await s.save()
