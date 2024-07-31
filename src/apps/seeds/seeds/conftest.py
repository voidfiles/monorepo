import os
import pytest
import pytest_asyncio
from tortoise import Tortoise
from tortoise.exceptions import DBConnectionError, OperationalError
from tortoise.contrib.test import MEMORY_SQLITE

# pytest_plugins = ("celery.contrib.pytest",)


@pytest.fixture(scope="module")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["TEST_MODE"] = "1"
    os.environ["TASKS_ALWAYS_EAGER"] = "1"


@pytest.fixture(scope="session", autouse=True)
def database_url():
    os.environ["TEST_DATABASE_URL"] = "1"


@pytest_asyncio.fixture(scope="function")
async def db_session():
    await Tortoise.init(
        db_url=MEMORY_SQLITE, modules={"models": ["seeds.models"]}, _create_db=True
    )
    await Tortoise.generate_schemas(safe=False)

    yield

    try:
        await Tortoise._drop_databases()
    except (DBConnectionError, OperationalError):  # pragma: nocoverage
        pass


@pytest.fixture(scope="session")
def celery_config():
    return {"broker_url": "redis://localhost/4"}


@pytest.fixture(scope="session")
def celery_includes():
    return ["seeds.crawl.tasks"]
