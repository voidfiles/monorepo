from typing import Tuple
import redis


r = redis.Redis.from_url("redis://localhost/3", decode_responses=True)


def get_or_set_tag_in(token: str, prefix: str, value: str) -> Tuple[bool, str]:
    tag_key = "%s:%s" % (prefix, token)
    with r.lock(token):
        val = r.get(tag_key)
        if val:
            return [False, val]

        r.set(tag_key, value)

        return [True, value]
