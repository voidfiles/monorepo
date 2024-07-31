from tortoise import fields


class CreatedUpdated:
    created = fields.DatetimeField(auto_now_add=True)
    updated = fields.DatetimeField(auto_now=True)
