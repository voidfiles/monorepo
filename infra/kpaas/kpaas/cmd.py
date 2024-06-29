import typer
from pathlib import Path
from .app_config import load_path

app = typer.Typer()


@app.command()
def apply(path: Path = Path(".")):
    app_config = load_path(path)
    app_config.config.apply()


@app.command()
def metadata(path: Path = Path(".")):
    print("yo 1")
    config = load_path(path)
    print("yo 2")
    print(config.to_json())


if __name__ == "__main__":
    app()
