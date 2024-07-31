import os
import structlog
from celery import Celery

from seeds.logs import configure_logger

from celery.signals import setup_logging, task_prerun


@setup_logging.connect
def task_sent_handler(loglevel, logfile, format, colorize, **kwargs):
    configure_logger()


@task_prerun.connect
def on_task_prerun(sender, task_id, task, args, kwargs, **_):
    structlog.contextvars.bind_contextvars(task_id=task_id, task_name=task.name)


BROKER_URL = os.environ.get("BROKER_URL", "redis://localhost/2")
TASKS_ALWAYS_EAGER = os.environ.get("TASKS_ALWAYS_EAGER", "0") == "1"


class Settings:
    task_always_eager = False


app = Celery(
    "tasks",
    broker=BROKER_URL,
    backend=None,
    include=["seeds.crawl.tasks"],
)

app.config_from_object(Settings)
# app.conf.task_always_eager = TASKS_ALWAYS_EAGER
