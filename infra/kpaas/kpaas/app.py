from dataclasses import dataclass
from dataclass_wizard import JSONWizard


@dataclass
class App(JSONWizard):
    """An app"""

    class Meta(JSONWizard.Meta):
        tag = "app"

    name: str
    namespace: str = "apps"

    def apply(self):
        return "nope"
