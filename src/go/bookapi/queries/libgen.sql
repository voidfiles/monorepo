SELECT
    JSON_OBJECT(
        "ID", u.ID,
        "Title", u.Title,
        "VolumeInfo", u.VolumeInfo,
        "Series", u.Series,
        "Periodical", u.Periodical,
        "Author", u.Author,
        "Year", u.Year,
        "Edition", u.Edition,
        "Publisher", u.Publisher,
        "City", u.City,
        "Pages", u.Pages,
        "PagesInFile", u.PagesInFile,
        "Language", u.Language,
        "Topic", u.Topic,
        "Library", u.Library,
        "Issue", u.Issue,
        "Identifier", u.Identifier,
        "ISSN", u.ISSN,
        "ASIN", u.ASIN,
        "UDC", u.UDC,
        "LBC", u.LBC,
        "DDC", u.DDC,
        "LCC", u.LCC,
        "Doi", u.Doi,
        "Googlebookid", u.Googlebookid,
        "OpenLibraryID", u.OpenLibraryID,
        "Commentary", u.Commentary,
        "DPI", u.DPI,
        "Color", u.Color,
        "Cleaned", u.Cleaned,
        "Orientation", u.Orientation,
        "Paginated", u.Paginated,
        "Scanned", u.Scanned,
        "Bookmarked", u.Bookmarked,
        "Searchable", u.Searchable,
        "Filesize", u.Filesize,
        "Extension", u.Extension,
        "MD5", u.MD5,
        "Generic", u.Generic,
        "Visible", u.Visible,
        "Locator", u.Locator,
        "Local", u.Local,
        "TimeAdded", u.TimeAdded,
        "TimeLastModified", u.TimeLastModified,
        "Coverurl", u.Coverurl,
        "Tags", u.Tags,
        "IdentifierWODash", u.IdentifierWODash,
        "descr", d.descr,
        "toc", d.toc
    )
INTO OUTFILE '/Users/alex/Documents/codes/monorepo/src/go/bookapi/_data/libgen.json'
FIELDS ESCAPED BY ''
LINES TERMINATED BY '\n'
from
    updated u
    join description d on d.id = u.ID
where u.Identifier != '';