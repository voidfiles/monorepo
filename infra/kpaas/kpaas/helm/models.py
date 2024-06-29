import asyncio
from dataclasses import dataclass, field
from dataclass_wizard import JSONWizard
import logging
from enum import Enum
import kr8s
import kr8s.objects
from .apply import apply
from .diff import diff

logger = logging.getLogger(__name__)


class IngressAudienceEnum(Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"


@dataclass
class IngressBackend(JSONWizard):
    service: str
    port: int


# apiVersion: networking.k8s.io/v1
# kind: Ingress
# metadata:
#   name: nginx
# spec:
#   defaultBackend:
#     service:
#       name: nginx
#       port:
#         number: 80
#   ingressClassName: tailscale
#   tls:
#     - hosts:
#         - nginx


@dataclass
class Ingress(JSONWizard):
    class Meta(JSONWizard.Meta):
        tag = "ingress"

    name: str
    hostname: str
    backend: IngressBackend
    namespace: str
    audience: IngressAudienceEnum = IngressAudienceEnum.INTERNAL

    def to_k8s(self, api: kr8s.Api) -> kr8s.objects.APIObject:
        resource = {
            "metadata": {
                "name": self.name,
            }
        }
        spec = {
            "defaultBackend": {
                "service": {
                    "name": self.backend.service,
                    "port": {"number": self.backend.port},
                }
            },
            "tls": [{"hosts": [self.hostname]}],
        }

        if self.audience == IngressAudienceEnum.INTERNAL:
            spec["ingressClassName"] = "tailscale"

        resource["spec"] = spec

        return kr8s.objects.Ingress(
            resource,
            namespace=self.namespace,
        )


@dataclass
class Repository(JSONWizard):
    """A helm repository"""

    name: str
    url: str


@dataclass
class ChartRelease(JSONWizard):
    """A chart release"""

    name: str
    chart: str
    namespace: str = "system"
    version: str | None = None
    values: dict[str, str] = field(default_factory=dict)


Resource = Ingress


@dataclass
class Helm(JSONWizard):
    """An helm"""

    class Meta(JSONWizard.Meta):
        tag = "helm"
        tag_key = "kind"
        auto_assign_tags = True

    repository: Repository
    release: ChartRelease
    resources: list[Resource] = field(default_factory=list)

    def apply(self):

        loop = asyncio.get_event_loop()

        loop.run_until_complete(apply(self))

    def diff(self):

        loop = asyncio.get_event_loop()

        loop.run_until_complete(diff(self))
