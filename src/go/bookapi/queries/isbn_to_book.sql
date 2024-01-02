INSERT
  OR REPLACE INTO book (
    isbn13,
    title,
    title_long,
    language,
    authors,
    image,
    overview,
    synopsis
  )
SELECT
  isbn13,
  title,
  title_long,
  language,
  authors,
  image,
  overview,
  CASE
    WHEN synopsis is not NULL THEN synopsis
    ELSE synopsys
  END as synopsis
FROM
  isbndb_2022_09
WHERE true
