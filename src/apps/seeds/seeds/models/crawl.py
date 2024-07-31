from tortoise import fields

from .base import BaseModel
from .mixins import CreatedUpdated
from .seed import Seed


class Crawl(CreatedUpdated, BaseModel):
    seed: fields.ForeignKeyRelation[Seed] = fields.ForeignKeyField(
        "models.Seed", related_name="crawls"
    )
    idempotency_key = fields.CharField(5000)
    crawl_key = fields.CharField(5000, null=True)

    class Meta:
        unique_together = ("seed", "idempotency_key")
