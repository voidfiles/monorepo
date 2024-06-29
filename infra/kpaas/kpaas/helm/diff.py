import logging
from pyhelm3 import Client
from .apply import get_current_chart, deploy_chart

from . import models

logger = logging.getLogger(__name__)


async def diff(helm: "models.Helm"):
    client = Client()

    chart_metadata = await get_current_chart(client, helm)
    if not chart_metadata:
        logger.info("Chart has not been deployed yet")
        return
    else:
        logger.info("Chart version=%s", chart_metadata.version)

    await deploy_chart(client, helm, dry_run=True)

    return None
