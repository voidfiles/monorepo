select
    JSON_OBJECT(
        "ID", f.ID,
        "MD5", f.MD5,
        "Title", f.Title,
        "Author", f.Author,
        "Series", f.Series,
        "Edition", f.Edition,
        "Language", f.Language,
        "Year", f.Year,
        "Publisher", f.Publisher,
        "Pages", f.Pages,
        "Identifier", f.Identifier,
        "GooglebookID", f.GooglebookID,
        "ASIN", f.ASIN,
        "Coverurl", f.Coverurl,
        "Extension", f.Extension,
        "Filesize", f.Filesize,
        "Library", f.Library,
        "Issue", f.Issue,
        "Locator", f.Locator,
        "Commentary", f.Commentary,
        "Generic", f.Generic,
        "Visible", f.Visible,
        "TimeAdded", f.TimeAdded,
        "TimeLastModified", f.TimeLastModified,
        "descr", d.Descr
    )
INTO OUTFILE '/Users/alex/Documents/codes/monorepo/src/go/bookapi/_data/fiction.json'
FIELDS ESCAPED BY ''
LINES TERMINATED BY '\n'
from
    fiction f
    join fiction_description d on d.MD5 = f.MD5
where
    f.Identifier != '';