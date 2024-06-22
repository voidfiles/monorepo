from peewee import *

database_proxy = DatabaseProxy()  # Create a proxy for our db.

class Quote(Model):
    author = CharField()
    source = CharField()
    text = CharField()
    found = CharField()
    archive = CharField()

    class Meta:
        database = database_proxy