from peewee import *
import os

database = SqliteDatabase(os.environ['DB_PATH'])

class UnknownField(object):
    def __init__(self, *_, **__): pass

class BaseModel(Model):
    class Meta:
        database = database

class Isbndb202209(BaseModel):
    authors = TextField(null=True)
    binding = TextField(null=True)
    date_published = TextField(null=True)
    dewey_decimal = TextField(null=True)
    dimensions = TextField(null=True)
    edition = TextField(null=True)
    format = TextField(null=True)
    image = TextField(null=True)
    isbn = TextField(null=True)
    isbn10 = TextField(null=True)
    isbn13 = TextField(null=True, primary_key=True)
    language = TextField(null=True)
    msrp = TextField(null=True)
    overview = TextField(null=True)
    pages = IntegerField(null=True)
    publisher = TextField(null=True)
    related = TextField(null=True)
    subjects = TextField(null=True)
    synopsis = TextField(null=True)
    synopsys = TextField(null=True)
    title = TextField(null=True)
    title_long = TextField(null=True)

    class Meta:
        table_name = 'isbndb_2022_09'

class LibgenFiction(BaseModel):
    asin = TextField(column_name='ASIN', null=True)
    author = TextField(column_name='Author', null=True)
    commentary = TextField(column_name='Commentary', null=True)
    coverurl = TextField(column_name='Coverurl', null=True)
    edition = TextField(column_name='Edition', null=True)
    extension = TextField(column_name='Extension', null=True)
    filesize = IntegerField(column_name='Filesize', null=True)
    generic = TextField(column_name='Generic', null=True)
    googlebook_id = TextField(column_name='GooglebookID', null=True)
    id = AutoField(column_name='ID', null=True)
    identifier = TextField(column_name='Identifier', null=True)
    issue = TextField(column_name='Issue', null=True)
    language = TextField(column_name='Language', null=True)
    library = TextField(column_name='Library', null=True)
    locator = TextField(column_name='Locator', null=True)
    md5 = TextField(column_name='MD5', null=True)
    pages = TextField(column_name='Pages', null=True)
    publisher = TextField(column_name='Publisher', null=True)
    series = TextField(column_name='Series', null=True)
    time_added = TextField(column_name='TimeAdded', null=True)
    time_last_modified = TextField(column_name='TimeLastModified', null=True)
    title = TextField(column_name='Title', null=True)
    visible = TextField(column_name='Visible', null=True)
    year = TextField(column_name='Year', null=True)
    descr = TextField(null=True)
    toc = TextField(null=True)

    class Meta:
        table_name = 'libgen_fiction'

class LibgenLibgen(BaseModel):
    asin = TextField(column_name='ASIN', null=True)
    author = TextField(column_name='Author', null=True)
    bookmarked = TextField(column_name='Bookmarked', null=True)
    city = TextField(column_name='City', null=True)
    cleaned = TextField(column_name='Cleaned', null=True)
    color = TextField(column_name='Color', null=True)
    commentary = TextField(column_name='Commentary', null=True)
    coverurl = TextField(column_name='Coverurl', null=True)
    ddc = TextField(column_name='DDC', null=True)
    dpi = IntegerField(column_name='DPI', null=True)
    doi = TextField(column_name='Doi', null=True)
    edition = TextField(column_name='Edition', null=True)
    extension = TextField(column_name='Extension', null=True)
    filesize = IntegerField(column_name='Filesize', null=True)
    generic = TextField(column_name='Generic', null=True)
    googlebookid = TextField(column_name='Googlebookid', null=True)
    id = AutoField(column_name='ID', null=True)
    issn = TextField(column_name='ISSN', null=True)
    identifier = TextField(column_name='Identifier', null=True)
    identifier_wo_dash = TextField(column_name='IdentifierWODash', null=True)
    issue = TextField(column_name='Issue', null=True)
    lbc = TextField(column_name='LBC', null=True)
    lcc = TextField(column_name='LCC', null=True)
    language = TextField(column_name='Language', null=True)
    library = TextField(column_name='Library', null=True)
    local = IntegerField(column_name='Local', null=True)
    locator = TextField(column_name='Locator', null=True)
    md5 = TextField(column_name='MD5', null=True)
    open_library_id = TextField(column_name='OpenLibraryID', null=True)
    orientation = TextField(column_name='Orientation', null=True)
    pages = TextField(column_name='Pages', null=True)
    pages_in_file = IntegerField(column_name='PagesInFile', null=True)
    paginated = TextField(column_name='Paginated', null=True)
    periodical = TextField(column_name='Periodical', null=True)
    publisher = TextField(column_name='Publisher', null=True)
    scanned = TextField(column_name='Scanned', null=True)
    searchable = TextField(column_name='Searchable', null=True)
    series = TextField(column_name='Series', null=True)
    tags = TextField(column_name='Tags', null=True)
    time_added = TextField(column_name='TimeAdded', null=True)
    time_last_modified = TextField(column_name='TimeLastModified', null=True)
    title = TextField(column_name='Title', null=True)
    topic = TextField(column_name='Topic', null=True)
    udc = TextField(column_name='UDC', null=True)
    visible = TextField(column_name='Visible', null=True)
    volume_info = TextField(column_name='VolumeInfo', null=True)
    year = TextField(column_name='Year', null=True)
    descr = TextField(null=True)
    toc = TextField(null=True)

    class Meta:
        table_name = 'libgen_libgen'
