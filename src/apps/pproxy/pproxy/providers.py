import httpx
from dataclasses import dataclass, field
from async_timeout import timeout as atimeout
import structlog

timeout = httpx.Timeout(4.9)

logger = structlog.stdlib.get_logger(name=__name__)


@dataclass
class PotentialProxy:
    uri: str
    supported_protocols: list[str] = field(default_factory=list)

    async def check_proxy(self) -> "PotentialProxy":
        self.supported_protocols = []

        for protocol in ["https", "http"]:
            check_url = f"{protocol}://checkip.amazonaws.com"
            proxy_url = self.uri
            logger.info("check proxy", proxy_url=proxy_url, check_url=check_url)
            try:
                async with atimeout(5):
                    resp = await httpx.AsyncClient(proxy=proxy_url, verify=False).get(
                        check_url, timeout=timeout
                    )

                    if resp.text.count(".") == 3:
                        self.supported_protocols += [protocol]
                        continue

            except Exception as e:
                logger.error("proxy failed", error=e)
                continue

        logger.info(
            "proxy scrape result",
            proxy_url=proxy_url,
            check_url=check_url,
            supported_protocols=self.supported_protocols,
        )

        return self


async def monosans() -> list[PotentialProxy]:
    raw = (
        await httpx.AsyncClient()
        .get(
            "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies.json",
            timeout=10,
        )
    ).json()

    return [
        PotentialProxy(
            uri="%s://%s:%s" % (proxy["protocol"], proxy["host"], proxy["port"])
        )
        for proxy in raw
    ]


async def thespeedx_http() -> list[PotentialProxy]:
    raw = (
        await httpx.AsyncClient()
        .get(
            "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
            timeout=10,
        )
    ).text

    return [PotentialProxy(uri="http://%s" % (line)) for line in raw.splitlines()]


async def thespeedx_socks() -> list[PotentialProxy]:
    raw = (
        await httpx.AsyncClient()
        .get(
            "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
            timeout=10,
        )
    ).text

    return [PotentialProxy(uri="socks5://%s" % (line)) for line in raw.splitlines()]


async def proxy_scrape() -> list[PotentialProxy]:
    baseUrl = "https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&proxy_format=ipport&format=jsonhttps://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=ipport&format=json"

    raw = (await httpx.AsyncClient().get(baseUrl, timeout=10)).json()

    return [
        PotentialProxy(uri="%s://%s" % (ipRaw["protocol"], ipRaw["proxy"]))
        for ipRaw in raw["proxies"]
    ]


async def jetkai_proxy_list() -> list[PotentialProxy]:
    baseUrl = "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/json/proxies.json"

    raw = (await httpx.AsyncClient().get(baseUrl, timeout=10)).json()

    proxies = [PotentialProxy(uri="http://%s" % (line)) for line in raw["http"]]
    proxies += [PotentialProxy(uri="https://%s" % (line)) for line in raw["https"]]
    proxies += [PotentialProxy(uri="socks5://%s" % (line)) for line in raw["socks5"]]

    return proxies


async def hookzof_proxy_list() -> list[PotentialProxy]:
    baseUrl = "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt"

    raw = (await httpx.AsyncClient().get(baseUrl, timeout=10)).text

    return [PotentialProxy(uri="socks5://%s" % (line)) for line in raw.splitlines()]


providers = [
    monosans,
    thespeedx_http,
    thespeedx_socks,
    proxy_scrape,
    hookzof_proxy_list,
    jetkai_proxy_list,
]
