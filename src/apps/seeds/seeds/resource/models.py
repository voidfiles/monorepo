import hashlib
from dataclasses import dataclass
from dataclasses_json import DataClassJsonMixin


@dataclass
class CrawledResource(DataClassJsonMixin):
    url: str
    final_url: str
    text: str
    html: str
    headers: dict[str, any]
    metadata: dict[str, any]
    links: list[str]

    def key(self) -> str:
        h = hashlib.sha1()
        h.update(bytes(self.final_url, "utf-8"))
        return h.hexdigest()

    def path(self) -> str:
        return "resource/%s" % (self.key())
