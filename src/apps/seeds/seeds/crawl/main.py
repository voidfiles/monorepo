import re
import asyncio

from .tasks import handle_seed

IGNORE_URLS_REGEX = [
    re.compile(r"^http(s?):\/\/www.facebook.com.*")
]

seeds = [
    {
        "kind": "feed",
        "url": "https://feeds.feedblitz.com/marginalrevolution",
    },
    # {
    #     "kind": "feed",
    #     "url": "http://feeds.pinboard.in/rss/secret:8bd696fcef71849c9d63/u:voidfiles/network/ ",
    # },
    # {
    #     "kind": "feed",
    #     "url": "http://feeds.pinboard.in/rss/secret:8bd696fcef71849c9d63/u:voidfiles/network/ ",
    # },
    # {
    #     "kind": "feed",
    #     "url": "http://feeds.pinboard.in/rss/secret:8bd696fcef71849c9d63/u:voidfiles/network/ ",
    # },
]


async def crawl_seeds():
    for seed in seeds:
        handle_seed.delay(**seed)


if __name__ == '__main__':
    asyncio.run(crawl_seeds())