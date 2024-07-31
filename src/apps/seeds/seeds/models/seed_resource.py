from tortoise import fields

from .base import BaseModel
from .mixins import CreatedUpdated
from .seed import Seed
from .resource import Resource


class SeedResource(CreatedUpdated, BaseModel):
    seed: fields.ForeignKeyRelation[Seed] = fields.ForeignKeyField(
        "models.Seed", related_name="seed_resources"
    )
    resource: fields.ForeignKeyRelation[Resource] = fields.ForeignKeyField(
        "models.Seed", related_name="seed_resources"
    )

    generation = fields.IntField(default=0)
