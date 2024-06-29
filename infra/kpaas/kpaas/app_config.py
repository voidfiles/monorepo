from pathlib import Path
from yaml import load, BaseLoader
from .app import App
from .helm import Helm
from dataclasses import dataclass
from dataclass_wizard import JSONWizard


@dataclass
class AppConfig(JSONWizard):
    """An app"""

    class Meta(JSONWizard.Meta):
        tag_key = "kind"
        auto_assign_tags = True

    config: App | Helm


def load_path(path: Path) -> AppConfig:
    abspath = path.absolute()
    app_path = abspath.joinpath("app.yaml")
    data = None
    with open(app_path, "r+") as fd:
        data = load(fd, BaseLoader)

    if data is None:
        raise Exception("Failed to open app.yaml")

    return AppConfig.from_dict(data)
