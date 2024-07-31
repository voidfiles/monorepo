from tortoise.models import Model
from tortoise import fields


class BaseModel(Model):
    id = fields.IntField(primary_key=True)

    class Meta:
        abstract = True
