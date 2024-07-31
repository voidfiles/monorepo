import enum

from tortoise import fields

from .base import BaseModel
from .mixins import CreatedUpdated


class SeedSource(str, enum.Enum):
    webpage = "webpage"
    feed = "feed"


class Seed(CreatedUpdated, BaseModel):
    Source = SeedSource
    uri = fields.CharField(5000, unique=True)
    kind = fields.CharEnumField(SeedSource, default=SeedSource.webpage)
