from .clients import itunes, openlibrary
from .data import MediaList, SearchRequest, MediaKind


KIND_TO_CLIENTS = {
    MediaKind.ALL: [itunes, openlibrary],
    MediaKind.ALBUM: [itunes],
    MediaKind.BOOK: [itunes, openlibrary],
    MediaKind.TV: [itunes],
    MediaKind.MOVIE: [itunes],
    MediaKind.SONG: [itunes],
    MediaKind.PODCAST: [itunes],
    MediaKind.OTHER: [itunes, openlibrary],
}


async def find_media_items(search: SearchRequest) -> None | MediaList:
    clients = KIND_TO_CLIENTS[search.kind]
    requests = [x(search) for x in clients]

    responses = [await x for x in requests]
    responses = [x for x in responses if x]

    data: MediaList = []

    for response in responses:
        data += response

    data = sorted(data, key=lambda x: x.score, reverse=True)

    return data
