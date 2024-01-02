from peewee import *

from models import BaseModel, database

class Book(BaseModel):
    isbn13 = TextField(null=False, primary_key=True)
    title = TextField(null=True)
    title_long = TextField(null=True)
    language = TextField(null=True)
    authors = TextField(null=True)
    image = TextField(null=True)
    overview = TextField(null=True)
    synopsis = TextField(null=True)

    class Meta:
        table_name = 'book'

def create_book():
   database.create_tables([Book])


if __name__ == "__main__":
    create_book()