from itertools import islice, chain

from tqdm import tqdm
from peewee import *

from models import database, Isbndb202209

from book import Book

def ichunks(model:Model, chunk_size=1000):
    after = None

    while True:
        c = model.select().order_by(model._meta.primary_key)
        if after:
            c = c.where(model._meta.primary_key > after)

        page = c.limit(chunk_size)

        if page.count() == 0:
            break

        after = page[-1].get_id()

        yield page.namedtuples()

def create_book_from_isbn(i):
    op = Book(
        isbn13=i.isbn13,
        title=i.title,
        title_long=i.title_long,
        language=i.language,
        authors=i.authors,
        image=i.image,
        overview=i.overview,
        synopsis=i.synopsis if i.synopsis else i.synopsys,
    )

def isbndb():
    total = Isbndb202209.select().count()
    i = 0
    with tqdm(total=total) as pbar:
        for isbns in ichunks(Isbndb202209, 1000):
            ops = [create_book_from_isbn(i) for i in isbns]
            with database.atomic():
                Isbndb202209.insert_many(ops)

            pbar.update(1000)


if __name__ == "__main__":
    isbndb()