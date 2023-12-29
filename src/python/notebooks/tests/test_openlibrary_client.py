import pytest

from notebooks.clients import openlibrary
from notebooks.data import SearchRequest, MediaItem, MediaKind, MediaSource

from openlibrary import RESPONSE


@pytest.mark.asyncio
async def test_openlibrary_client(httpx_mock):
    httpx_mock.add_response(json=RESPONSE)

    resp = await openlibrary(search=SearchRequest(query="Jack Johnson"))

    assert len(resp) == 100
    print(resp[0])
    assert resp[0] == MediaItem(
        source=MediaSource.OPEN_LIBRARY,
        source_item_id="OL2629977W",
        title=["The 7 Habits of Highly Effective People"],
        kind=MediaKind.BOOK,
        source_author_id=["OL383159A", "OL30179A"],
        source_collection_id=None,
        collection_title=None,
        authors=["Stephen R. Covey", "Sean Covey"],
        image_small="https://covers.openlibrary.org/a/olid/OL2629977W-S.jpg",
        image_medium="https://covers.openlibrary.org/a/olid/OL2629977W-M.jpg",
        score=8,
    )
