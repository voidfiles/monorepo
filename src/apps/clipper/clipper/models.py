from typing import Any
from html import unescape
from .utils import line_processing


class Metadata(object):
    data: dict[str, any]

    def __init__(self):
        self.__dict__["data"] = {}

    def __setattr__(self, name: str, value: Any) -> None:
        self.data[name] = value

    def clean_and_trim(self) -> None:
        "Limit text length and trim the attributes."
        for key, value in self.data.items():
            if isinstance(value, str):
                # length
                if len(value) > 10000:
                    value = value[:9999] + "…"
                # HTML entities, remove spaces and control characters
                value = line_processing(unescape(value))
                self.data[key] = value

    def __getattr__(self, name: str) -> Any | None:
        return self.data.get(name, None)

    def set_attributes(self, **kwargs):
        for key, val in kwargs.items():
            self.data[key] = val

    def from_dict(self, data: dict[str, Any]):
        self.data.update(data)

        return self
