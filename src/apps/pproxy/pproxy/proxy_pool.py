import asyncio
import json
from itertools import chain, islice
from random import choice, shuffle

import diskcache as dc
import httpx
import structlog

from .providers import PotentialProxy, providers

logger = structlog.stdlib.get_logger(name=__name__)


def chunks(iterable, size=10):
    iterator = iter(iterable)
    for first in iterator:
        yield chain([first], islice(iterator, size - 1))


async def get_providers() -> list[PotentialProxy]:
    futs = [x() for x in providers]
    proxy_list_of_list = await asyncio.gather(*futs)

    proxies = []
    for proxy_list in proxy_list_of_list:
        for proxy in proxy_list:
            if proxy.uri.startswith("socks4"):
                continue

            proxies.append(proxy)

    return proxies


class ProxyPool:
    def __init__(
        self,
        countries: list = [],
        max_proxies: int = 30,
        use_cache: bool = True,
    ):
        """
        The one class for everything.

        Proxy class contains all necessary methods required to use swiftshadow.

        Args:
                countries: ISO 3166-2 Two letter country codes to filter proxies.
                protocol: HTTP/HTTPS protocol to filter proxies.
                maxProxies: Maximum number of proxies to store and rotate from.
                autoRotate: Rotates proxy when `Proxy.proxy()` function is called.

        Returns:
                proxyClass (swiftshadow.Proxy): `swiftshadow.Proxy` class instance

        Examples:
                Simplest way to get a proxy
                >>> from swiftshadow.swiftshadow import Proxy
                >>> swift = Proxy()
                >>> print(swift.proxy())
                {'http':'192.0.0.1:8080'}
        Note:
                Proxies are sourced from **Proxyscrape** and **Scrapingant** websites which are freely available and validated locally.
        """
        self.countries = [i.upper() for i in countries]
        self.max_proxies = max_proxies
        self.protocols = ["http", "https"]
        self.use_cache = use_cache
        if self.use_cache:
            self.cache = dc.Cache("tmp")
            self.proxy_for_raw = self.cache.get("proxy_pool", None)
        else:
            self.cache = None
            self.proxy_for_raw = None

        if self.proxy_for_raw:
            self.proxy_for: dict[str, list[str]] = json.loads(self.proxy_for_raw)
        else:
            self.proxy_for: dict[str, list[str]] = {
                proto: [] for proto in self.protocols
            }
        self.current = None

    async def update(self):
        self.proxy_for: dict[str, list[str]] = {proto: [] for proto in self.protocols}
        all_proxies = await get_providers()
        shuffle([x for x in all_proxies])

        for chunk in chunks(all_proxies):
            # waits = [proxy.check_proxy() for proxy in chunk]
            proxies = await asyncio.gather(*[proxy.check_proxy() for proxy in chunk])

            for proxy in proxies:
                logger.info(
                    "Better support", supported_protocols=proxy.supported_protocols
                )
                for proto in proxy.supported_protocols:
                    logger.info("Adding proxy to proto", uri=proxy.uri, proto=proto)
                    self.proxy_for[proto].append(proxy.uri)

            proxy_counts = {
                proto: len(self.proxy_for[proto]) for proto in self.protocols
            }
            logger.info("Proxy counts", **proxy_counts)

            if all([x >= self.max_proxies for x in proxy_counts.values()]):
                break

        if self.use_cache:
            self.cache["proxy_pool"] = json.dumps(self.proxy_for)

    def proxy(self):
        """
        Returns a proxy dict.

        Returns:
                proxyDict (dict):A proxy dict of format `{protocol:address}`
        """

        return {
            "http://": httpx.AsyncHTTPTransport(proxy=choice(self.proxy_for["http"])),
            "https://": httpx.AsyncHTTPTransport(proxy=choice(self.proxy_for["https"])),
        }

    def proxies(self, n: int):
        http_proxies = self.proxy_for["http"][0:n]
        https_proxies = self.proxy_for["http"][0:n]

        return [
            {
                "http://": httpx.AsyncHTTPTransport(proxy=group[0]),
                "https://": httpx.AsyncHTTPTransport(proxy=group[1]),
            }
            for group in zip(http_proxies, https_proxies)
        ]
