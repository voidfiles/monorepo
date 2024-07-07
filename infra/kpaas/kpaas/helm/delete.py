import logging

import kr8s
from pyhelm3 import (
    ChartMetadata,
    ChartNotFoundError,
    Client,
    ReleaseNotFoundError,
    ReleaseRevision,
)

from . import models
from .utils import run_and_stream
from .values import process_values

logger = logging.getLogger(__name__)


async def delete_chart(
    client: Client, helm: "models.Helm", dry_run: bool = False
) -> ReleaseRevision | None:
    command = [
        "helm",
        "upgrade",
        "--install",
        helm.release.name,
        helm.release.chart,
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
        try:
            api_object = resource.to_k8s(api)
            if api_object.exists():
                api_object.delete()
                api_object.wait(["delete"])

            api_object.create()
        except kr8s.ServerError as e:
            logger.info("Error %s", e.response)
            raise Exception("Resource failed to be created")
