from pyhelm3 import (
    Client,
    ReleaseNotFoundError,
    ChartNotFoundError,
    ChartMetadata,
    ReleaseRevision,
)
import logging
import kr8s
from .values import process_values
from .utils import run_and_stream

from . import models

logger = logging.getLogger(__name__)


async def get_current_chart(
    client: Client, helm: "models.Helm"
) -> ChartMetadata | None:
    try:
        revision = await client.get_current_revision(
            helm.release.name,
            namespace=helm.release.namespace,
        )

        chart_metadata = await revision.chart_metadata()
    except (ReleaseNotFoundError, ChartNotFoundError):
        return None

    return chart_metadata


async def get_chart_from_repo(client: Client, helm: "models.Helm"):
    try:
        await client.get_chart(
            helm.release.chart,
            repo=helm.repository.url,
            version=helm.release.version,
        )
    except ChartNotFoundError:
        print("Failed to find chart not found")
        return None


async def deploy_chart(
    client: Client, helm: "models.Helm", dry_run: bool = False
) -> ReleaseRevision | None:
    await get_chart_from_repo(client, helm)
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

    if dry_run:
        command.append("--dry-run")

    run_and_stream(command)


async def apply(helm: "models.Helm"):
    client = Client()

    chart_metadata = await get_current_chart(client, helm)
    if chart_metadata is None:
        logger.info("Chart has not been installed previously")
    else:
        logger.info("Chart has been deplyoed %s", chart_metadata.model_dump())

    await deploy_chart(client, helm)

    api = await kr8s.asyncio.api()
    for resource in helm.resources:
        api_object = resource.to_k8s(api)
        api_object.create()
