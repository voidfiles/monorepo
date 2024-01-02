import fileinput
import json
import sys
import csv

all = "".join([line for line in fileinput.input()])

bestsellers = json.loads(all)

book_by_isbn = {}
results = bestsellers.get('results', {})
bestsellers_date = results.get('bestsellers_date')
published_date = results.get('published_date')
lists = results.get('lists', [])

w = csv.DictWriter(
    sys.stdout,
    [
        "list_id",
        "list_name",
        "updated",
        "published_date",
        "primary_isbn10",
        "primary_isbn13",
        "publisher",
        "rank",
        "rank_last_week",
        "title",
        "book_image",
        "book_review_link",
    ])

w.writeheader()

for l in lists:

    list_id = l['list_id']
    list_name = l['list_name']
    updated = l['updated'] 
    dt = bestsellers_date if l['updated'] == 'WEEKLY' else published_date
    for book in l['books']:
        r = {
            "list_id": list_id,
            "list_name": list_name,
            "updated": updated,
            "primary_isbn10": book['primary_isbn10'],
            "primary_isbn13": book['primary_isbn13'],
            "publisher": book['publisher'],
            "rank": book['rank'],
            "title": book['title'],
            "book_image": book['book_image'],
            "book_review_link": book['book_review_link'],
        }
        w.writerow(r)