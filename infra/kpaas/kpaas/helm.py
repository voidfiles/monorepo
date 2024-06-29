import asyncio
from dataclasses import dataclass, field
from dataclass_wizard import JSONWizard
from pyhelm3 import (
    Client,
    ReleaseNotFoundError,
    ChartNotFoundError,
    ChartMetadata,
    ReleaseRevision,
)
import logging
import pprint
from .values import process_values
import subprocess

logger = logging.getLogger(__name__)


def run_and_stream(cmd: list[str]) -> str:

    logger.info("Running %s", " ".join(cmd))
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output = []
    while process.poll() is None:
        line = process.stdout.readline()
        logger.info(line)
        output.append(str(line, "utf-8"))

    return_code = process.poll()
    if return_code != 0:
        raise Exception(process.stderr.readlines())

    return "\n".join(output)


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


@dataclass
class Helm(JSONWizard):
    """An helm"""

    class Meta(JSONWizard.Meta):
        tag = "helm"

    repository: Repository
    release: ChartRelease

    def apply(self):

        loop = asyncio.get_event_loop()

        loop.run_until_complete(apply(self))


async def get_current_chart(client: Client, helm: Helm) -> ChartMetadata | None:
    try:
        revision = await client.get_current_revision(
            helm.release.name,
            namespace=helm.release.namespace,
        )

        chart_metadata = await revision.chart_metadata()
    except (ReleaseNotFoundError, ChartNotFoundError):
        return None

    return chart_metadata


async def deploy_chart(client: Client, helm: Helm) -> ReleaseRevision | None:
    logging.basicConfig(level=logging.DEBUG)
    try:
        await client.get_chart(
            helm.release.chart,
            repo=helm.repository.url,
            version=helm.release.version,
        )
    except ChartNotFoundError:
        print("Failed to find chart not found")
        return None

    command = [
        "helm",
        "upgrade",
        "--install",
        helm.release.name,
        helm.release.chart,
        "--output",
        "json",
        "--timeout",
        "5m",
        "--atomic",
        "--create-namespace",
        "--namespace",
        helm.release.namespace,
        "--repo",
        helm.repository.url,
        "--version",
        helm.release.version,
        "--wait",
        "--wait-for-jobs",
    ]

    for key, value in process_values(helm.release.values).items():
        command.append("--set-string")
        command.append(f"{key}={value}")

    run_and_stream(command)


async def apply(helm: Helm):
    client = Client()

    chart_metadata = await get_current_chart(client, helm)
    if chart_metadata is None:
        print("Chart has not been installed previously")
        await deploy_chart(client, helm)
        return None

    pprint.pprint(chart_metadata.model_dump())
