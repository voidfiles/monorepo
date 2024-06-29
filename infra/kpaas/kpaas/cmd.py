import typer
import logging
from pathlib import Path
from .app_config import load_path

app = typer.Typer()

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)


@app.command()
def apply(path: Path = Path(".")):
    logger.info("Running apply path: %s", path)
    app_config = load_path(path)
    app_config.config.apply()


@app.command()
def diff(path: Path = Path(".")):
    logger.info("Running diff path: %s", path)
    app_config = load_path(path)
    app_config.config.diff()


@app.command()
def metadata(path: Path = Path(".")):
    logger.info("Running metadata path: %s", path)
    config = load_path(path)
    print(config.to_json())


if __name__ == "__main__":

    app()
