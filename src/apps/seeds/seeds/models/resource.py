from tortoise import fields

from .base import BaseModel
from .mixins import CreatedUpdated


class Resource(CreatedUpdated, BaseModel):
    domain = fields.CharField(5000)
    uri = fields.CharField(5000, unique=True)
    text = fields.TextField()
    html = fields.TextField()
    addl_metadata = fields.JSONField()
