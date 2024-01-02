from datetime import date, timedelta
import time
from urllib.parse import urlencode, quote_plus

import httpx

from utils import cache_if_not_exists

BASE_URL = "https://api.nytimes.com/svc/books"

def query_string(data: dict) -> str:
    data['api-key'] = "KTA0bzfS1i5ECRYWs8uzcUEyFVTNSoaE"

    return urlencode(data, quote_via=quote_plus)


def full_overview(date: date | None):
    date = date if date else date.today()
    url = BASE_URL + "/v3/lists/full-overview.json?"

    qs = query_string({
        "published_date": "%s" % (date)
    })

    resp = httpx.get(url + qs)

    resp.raise_for_status()

    return resp.text


def fill_in_weeks(limit: int = 10):
    dt = date.today()
    idx = (dt.weekday() + 1) % 7
    dt = dt - timedelta(7+idx-6)

    while limit: 
        cached = cache_if_not_exists(
            lambda: full_overview(dt),
            'nyt_lists',
            'lists_%s.json' % (dt)
        )
        print("Querying data for dt: %s cached: %s" % (dt, cached))
        dt -= timedelta(days=7)
        limit -= 1
        if not cached:
            time.sleep(13)


if __name__ == "__main__":
    fill_in_weeks(400)