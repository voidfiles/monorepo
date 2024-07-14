from url_normalize import url_normalize
from w3lib.url import url_query_cleaner

PARAMS_TO_REMOVE = [
    "mkt_tok",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "sc_country",
    "sc_category",
    "sc_channel",
    "sc_campaign",
    "sc_publisher",
    "sc_content",
    "sc_funnel",
    "sc_medium",
    "sc_segment",
]


def canonical_url(url: str) -> str:
    url = url_normalize(url)
    return url_query_cleaner(url, PARAMS_TO_REMOVE, remove=True)
