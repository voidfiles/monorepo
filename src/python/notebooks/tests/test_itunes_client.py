import pytest

from notebooks.clients import itunes
from notebooks.data import SearchRequest, MediaItem, MediaKind, MediaSource


@pytest.mark.asyncio
async def test_itunes_client(httpx_mock):
    httpx_mock.add_response(
        json={
            "resultCount": 50,
            "results": [
                {
                    "wrapperType": "track",
                    "kind": "song",
                    "artistId": 41742672,
                    "collectionId": 263301268,
                    "trackId": 263301273,
                    "artistName": "This Bike Is a Pipe Bomb",
                    "collectionName": "Three Way Tie for a Fifth",
                    "trackName": "Jack Johnson",
                    "collectionCensoredName": "Three Way Tie for a Fifth",
                    "trackCensoredName": "Jack Johnson",
                    "artistViewUrl": "https://music.apple.com/us/artist/this-bike-is-a-pipe-bomb/41742672?uo=4",
                    "collectionViewUrl": "https://music.apple.com/us/album/jack-johnson/263301268?i=263301273&uo=4",
                    "trackViewUrl": "https://music.apple.com/us/album/jack-johnson/263301268?i=263301273&uo=4",
                    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/fd/bb/38/fdbb38d2-073d-4bc7-68c4-348a0be6d560/mzaf_4150435585996894188.plus.aac.p.m4a",
                    "artworkUrl30": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/ee/b3/f3eeb3ff-ca32-273a-15aa-709bdfa64367/mzi.izwiyqez.jpg/30x30bb.jpg",
                    "artworkUrl60": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/ee/b3/f3eeb3ff-ca32-273a-15aa-709bdfa64367/mzi.izwiyqez.jpg/60x60bb.jpg",
                    "artworkUrl100": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/ee/b3/f3eeb3ff-ca32-273a-15aa-709bdfa64367/mzi.izwiyqez.jpg/100x100bb.jpg",
                    "collectionPrice": 9.99,
                    "trackPrice": 0.99,
                    "releaseDate": "2004-06-15T12:00:00Z",
                    "collectionExplicitness": "notExplicit",
                    "trackExplicitness": "notExplicit",
                    "discCount": 1,
                    "discNumber": 1,
                    "trackCount": 11,
                    "trackNumber": 1,
                    "trackTimeMillis": 117573,
                    "country": "USA",
                    "currency": "USD",
                    "primaryGenreName": "Alternative",
                    "isStreamable": True,
                }
            ],
        }
    )

    resp = await itunes(search=SearchRequest(query="Jack Johnson"))

    assert len(resp) == 1
    assert resp[0] == MediaItem(
        source=MediaSource.ITUNES,
        source_author_id=["41742672"],
        source_collection_id="263301268",
        source_item_id="263301273",
        title=["Jack Johnson"],
        authors=["This Bike Is a Pipe Bomb"],
        collection_title="Three Way Tie for a Fifth",
        kind=MediaKind.SONG,
        image_medium="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/ee/b3/f3eeb3ff-ca32-273a-15aa-709bdfa64367/mzi.izwiyqez.jpg/100x100bb.jpg",
        image_small="https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f3/ee/b3/f3eeb3ff-ca32-273a-15aa-709bdfa64367/mzi.izwiyqez.jpg/60x60bb.jpg",
    )
