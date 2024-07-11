"""
Module bundling all functions needed to scrape metadata from webpages.
"""

import json
import logging
import re

from copy import deepcopy
from html import unescape
from typing import Any, Dict, List, Optional, Set, Tuple

from courlan import (
    extract_domain,
    get_base_url,
    is_valid_url,
    normalize_url,
    validate_url,
)
from htmldate import find_date
from lxml.etree import XPath
from lxml.html import HtmlElement, tostring

from .htmlprocessing import prune_unwanted_nodes
from .json_metadata import (
    extract_json,
    extract_json_parse_error,
    normalize_authors,
    normalize_json,
)
from .utils import HTML_STRIP_TAGS, line_processing, trim
from .xpaths import (
    AUTHOR_DISCARD_XPATHS,
    AUTHOR_XPATHS,
    CATEGORIES_XPATHS,
    TAGS_XPATHS,
    TITLE_XPATHS,
)
from .models import Metadata
from datetime import datetime


def set_date_params(extensive=True):
    "Provide default parameters for date extraction."
    return {
        "original_date": True,
        "extensive_search": extensive,
        "max_date": datetime.now().strftime("%Y-%m-%d"),
    }


LOGGER = logging.getLogger(__name__)
logging.getLogger("htmldate").setLevel(logging.WARNING)

META_URL = re.compile(r"https?://(?:www\.|w[0-9]+\.)?([^/]+)")

JSON_MINIFY = re.compile(r'("(?:\\"|[^"])*")|\s')

HTMLTITLE_REGEX = re.compile(
    r"^(.+)?\s+[–•·—|⁄*⋆~‹«<›»>:-]\s+(.+)$"
)  # part without dots?

CLEAN_META_TAGS = re.compile(r'["\']')

LICENSE_REGEX = re.compile(
    r"/(by-nc-nd|by-nc-sa|by-nc|by-nd|by-sa|by|zero)/([1-9]\.[0-9])"
)
TEXT_LICENSE_REGEX = re.compile(
    r"(cc|creative commons) (by-nc-nd|by-nc-sa|by-nc|by-nd|by-sa|by|zero) ?([1-9]\.[0-9])?",
    re.I,
)

METANAME_AUTHOR = {
    "article:author",
    "atc-metaauthor",
    "author",
    "authors",
    "byl",
    "citation_author",
    "creator",
    "dc.creator",
    "dc.creator.aut",
    "dc:creator",
    "dcterms.creator",
    "dcterms.creator.aut",
    "dcsext.author",
    "parsely-author",
    "rbauthors",
    "sailthru.author",
    "shareaholic:article_author_name",
}  # questionable: twitter:creator
METANAME_DESCRIPTION = {
    "dc.description",
    "dc:description",
    "dcterms.abstract",
    "dcterms.description",
    "description",
    "sailthru.description",
    "twitter:description",
}
METANAME_PUBLISHER = {
    "article:publisher",
    "citation_journal_title",
    "copyright",
    "dc.publisher",
    "dc:publisher",
    "dcterms.publisher",
    "publisher",
    "sailthru.publisher",
    "rbpubname",
    "twitter:site",
}  # questionable: citation_publisher
METANAME_TAG = {
    "citation_keywords",
    "dcterms.subject",
    "keywords",
    "parsely-tags",
    "shareaholic:keywords",
    "tags",
}
METANAME_TITLE = {
    "citation_title",
    "dc.title",
    "dcterms.title",
    "fb_title",
    "headline",
    "parsely-title",
    "sailthru.title",
    "shareaholic:title",
    "rbtitle",
    "title",
    "twitter:title",
}
METANAME_URL = {"rbmainurl", "twitter:url"}
METANAME_IMAGE = {
    "image",
    "og:image",
    "og:image:url",
    "og:image:secure_url",
    "twitter:image",
    "twitter:image:src",
}
OG_AUTHOR = {"og:author", "og:article:author"}
PROPERTY_AUTHOR = {"author", "article:author"}
TWITTER_ATTRS = {"twitter:site", "application-name"}

# also interesting: article:section

EXTRA_META = {"charset", "http-equiv", "property"}


def normalize_tags(tags: str) -> str:
    """Remove special characters of tags"""
    tags = CLEAN_META_TAGS.sub(r"", trim(unescape(tags)))
    return ", ".join(filter(None, tags.split(", ")))


def check_authors(authors: str, author_blacklist: Set[str]) -> Optional[str]:
    "Check if the authors string correspond to expected values."
    author_blacklist = {a.lower() for a in author_blacklist}
    new_authors = [
        author.strip()
        for author in authors.split(";")
        if author.strip().lower() not in author_blacklist
    ]
    if new_authors:
        return "; ".join(new_authors).strip("; ")
    return None


def extract_meta_json(tree: HtmlElement, metadata: Metadata) -> Metadata:
    """Parse and extract metadata from JSON-LD data"""
    for elem in tree.xpath(
        './/script[@type="application/ld+json" or @type="application/settings+json"]'
    ):
        if not elem.text:
            continue
        element_text = normalize_json(JSON_MINIFY.sub(r"\1", elem.text))
        try:
            schema = json.loads(element_text)
            metadata = extract_json(schema, metadata)
        except json.JSONDecodeError:
            metadata = extract_json_parse_error(element_text, metadata)
    return metadata


def extract_opengraph(tree: HtmlElement) -> Dict[str, Optional[str]]:
    """Search meta tags following the OpenGraph guidelines (https://ogp.me/)"""
    og_properties = {
        "og:title": "title",
        "og:description": "description",
        "og:site_name": "sitename",
        "og:image": "image",
        "og:image:url": "image",
        "og:image:secure_url": "image",
        "og:type": "pagetype",
    }
    result = dict.fromkeys(
        ("title", "author", "url", "description", "sitename", "image", "pagetype")
    )

    # detect OpenGraph schema
    for elem in tree.xpath('.//head/meta[starts-with(@property, "og:")]'):
        property_name, content = elem.get("property"), elem.get("content")
        # safeguard
        if content and not content.isspace():
            if property_name in og_properties:
                result[og_properties[property_name]] = content
            elif property_name == "og:url" and is_valid_url(content):
                result["url"] = content
            elif property_name in OG_AUTHOR:
                result["author"] = normalize_authors(None, content)
        # og:locale
        # elif elem.get('property') == 'og:locale':
        #    pagelocale = elem.get('content')
    return result


def examine_meta(tree: HtmlElement) -> Metadata:
    """Search meta tags for relevant information"""
    metadata = Metadata()  # alt: Metadata()
    # bootstrap from potential OpenGraph tags
    metadata = Metadata().from_dict(extract_opengraph(tree))
    # test if all values not assigned in the following have already been assigned
    if all(
        (
            metadata.title,
            metadata.author,
            metadata.url,
            metadata.description,
            metadata.sitename,
            metadata.image,
        )
    ):  # tags
        return metadata
    tags, backup_sitename = [], None
    # skim through meta tags
    for elem in tree.iterfind(".//head/meta[@content]"):
        # content
        content_attr = HTML_STRIP_TAGS.sub("", elem.get("content", ""))
        if not content_attr or content_attr.isspace():
            continue
        # image info
        # ...
        # property
        if "property" in elem.attrib:
            property_attr = elem.get("property", "").lower()
            # no opengraph a second time
            if property_attr.startswith("og:"):
                continue
            if property_attr == "article:tag":
                tags.append(normalize_tags(content_attr))
            elif property_attr in PROPERTY_AUTHOR:
                metadata.author = normalize_authors(metadata.author, content_attr)
            elif property_attr == "article:publisher":
                metadata.sitename = metadata.sitename or content_attr
            elif property_attr in METANAME_IMAGE:
                metadata.image = metadata.image or content_attr
        # name attribute
        elif "name" in elem.attrib:
            name_attr = elem.get("name", "").lower()
            # author
            if name_attr in METANAME_AUTHOR:
                metadata.author = normalize_authors(metadata.author, content_attr)
            # title
            elif name_attr in METANAME_TITLE:
                metadata.title = metadata.title or content_attr
            # description
            elif name_attr in METANAME_DESCRIPTION:
                metadata.description = metadata.description or content_attr
            # site name
            elif name_attr in METANAME_PUBLISHER:
                metadata.sitename = metadata.sitename or content_attr
            # twitter
            elif name_attr in TWITTER_ATTRS or "twitter:app:name" in name_attr:
                backup_sitename = content_attr
            # url
            elif name_attr == "twitter:url":
                if metadata.url is None and is_valid_url(content_attr):
                    metadata.url = content_attr
            # keywords
            elif name_attr in METANAME_TAG:  # 'page-topic'
                tags.append(normalize_tags(content_attr))
        elif "itemprop" in elem.attrib:
            if elem.get("itemprop") == "author":
                metadata.author = normalize_authors(metadata.author, content_attr)
            elif elem.get("itemprop") == "description":
                metadata.description = metadata.description or content_attr
            elif elem.get("itemprop") == "headline":
                metadata.title = metadata.title or content_attr
            # to verify:
            # elif elem.get('itemprop') == 'name':
            #    if title is None:
            #        title = elem.get('content')
        # other types
        elif all(key not in elem.attrib for key in EXTRA_META):
            LOGGER.debug(
                "unknown attribute: %s",
                tostring(elem, pretty_print=False, encoding="unicode").strip(),
            )
    # backups
    metadata.sitename = metadata.sitename or backup_sitename
    # copy
    metadata.set_attributes(tags=tags)
    return metadata


def extract_metainfo(
    tree: HtmlElement, expressions: List[XPath], len_limit: int = 200
) -> Optional[str]:
    """Extract meta information"""
    # try all XPath expressions
    for expression in expressions:
        # examine all results
        i = 0
        for elem in expression(tree):
            content = trim(" ".join(elem.itertext()))
            if content and 2 < len(content) < len_limit:
                return content
            i += 1
        if i > 1 and LOGGER.isEnabledFor(logging.DEBUG):
            LOGGER.debug("more than one invalid result: %s %s", expression, i)
    return None


def examine_title_element(
    tree: HtmlElement,
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract text segments out of main <title> element."""
    title = None
    title_element = tree.find(".//head//title")
    if title_element is not None:
        title = trim(title_element.text_content())
        match = HTMLTITLE_REGEX.match(title)
        if match:
            return title, match[1], match[2]
    LOGGER.debug("no main title found")
    return title, None, None


def extract_title(tree: HtmlElement) -> Optional[str]:
    """Extract the document title"""
    # only one h1-element: take it
    h1_results = tree.findall(".//h1")
    if len(h1_results) == 1:
        title = trim(h1_results[0].text_content())
        if title:
            return title
    # extract using x-paths
    title = extract_metainfo(tree, TITLE_XPATHS)
    if title is not None:
        return title
    # extract using title tag
    title, first, second = examine_title_element(tree)
    for t in (first, second):
        if t and "." not in t:
            return t
    # take first h1-title
    if h1_results:
        return h1_results[0].text_content()
    # take first h2-title
    try:
        title = tree.xpath(".//h2")[0].text_content()
    except IndexError:
        LOGGER.debug("no h2 title found")
    return title


def extract_author(tree: HtmlElement) -> Optional[str]:
    """Extract the document author(s)"""
    subtree = prune_unwanted_nodes(deepcopy(tree), AUTHOR_DISCARD_XPATHS)
    author = extract_metainfo(subtree, AUTHOR_XPATHS, len_limit=120)
    if author:
        author = normalize_authors(None, author)
    # copyright?
    return author


def extract_url(tree: HtmlElement, default_url: Optional[str] = None) -> Optional[str]:
    """Extract the URL from the canonical link"""
    url = None
    # https://www.tutorialrepublic.com/html-reference/html-base-tag.php
    # try canonical link first
    element = tree.find('.//head//link[@rel="canonical"][@href]')
    if element is not None:
        url = element.attrib["href"]
    # try default language link
    else:
        element = tree.find('.//head//link[@rel="alternate"][@hreflang="x-default"]')
        if element is not None:
            LOGGER.debug(
                tostring(element, pretty_print=False, encoding="unicode").strip()
            )
            url = element.attrib["href"]
    # add domain name if it's missing
    if url is not None and url.startswith("/"):
        for element in tree.iterfind(".//head//meta[@content]"):
            attrtype = element.get("name") or element.get("property") or ""
            if attrtype.startswith("og:") or attrtype.startswith("twitter:"):
                base_url = get_base_url(element.attrib["content"])
                if base_url:
                    # prepend URL
                    url = base_url + url
                    break
    # sanity check: don't return invalid URLs
    if url is not None:
        validation_result, parsed_url = validate_url(url)
        url = None if validation_result is False else normalize_url(parsed_url)
    return url or default_url


def extract_sitename(tree: HtmlElement) -> Optional[str]:
    """Extract the name of a site from the main title (if it exists)"""
    _, *parts = examine_title_element(tree)
    return next((part for part in parts if part and "." in part), None)


def extract_catstags(metatype: str, tree: HtmlElement) -> List[str]:
    """Find category and tag information"""
    results: List[str] = []
    regexpr = "/" + metatype + "[s|ies]?/"
    xpath_expression = CATEGORIES_XPATHS if metatype == "category" else TAGS_XPATHS
    # search using custom expressions
    for catexpr in xpath_expression:
        results.extend(
            elem.text_content()
            for elem in catexpr(tree)
            if re.search(regexpr, elem.attrib["href"])
        )
        if results:
            break
    # category fallback
    if metatype == "category" and not results:
        for element in tree.xpath(
            './/head//meta[@property="article:section" or contains(@name, "subject")][@content]'
        ):
            results.append(element.attrib["content"])
        # optional: search through links
        # if not results:
        #    for elem in tree.xpath('.//a[@href]'):
        #        search for 'category'
    return [r for r in dict.fromkeys(line_processing(x) for x in results if x) if r]


def parse_license_element(element: HtmlElement, strict: bool = False) -> Optional[str]:
    """Probe a link for identifiable free license cues.
    Parse the href attribute first and then the link text."""
    # look for Creative Commons elements
    match = LICENSE_REGEX.search(element.get("href", ""))
    if match:
        return f"CC {match[1].upper()} {match[2]}"
    if element.text:
        # check if it could be a CC license
        if strict:
            match = TEXT_LICENSE_REGEX.search(element.text)
            return match[0] if match else None
        return trim(element.text)
    return None


def extract_license(tree: HtmlElement) -> Optional[str]:
    """Search the HTML code for license information and parse it."""
    # look for links labeled as license
    for element in tree.findall('.//a[@rel="license"][@href]'):
        result = parse_license_element(element, strict=False)
        if result is not None:
            return result
    # probe footer elements for CC links
    for element in tree.xpath(
        './/footer//a[@href]|.//div[contains(@class, "footer") or contains(@id, "footer")]//a[@href]'
    ):
        result = parse_license_element(element, strict=True)
        if result is not None:
            return result
    return None


def extract_image(tree: HtmlElement) -> Optional[str]:
    """Search meta tags following the OpenGraph guidelines (https://ogp.me/)
    and search meta tags with Twitter Image"""

    for elem in tree.xpath(
        './/head/meta[@property="og:image" or @property="og:image:url"][@content]'
    ):
        return elem.get("content")

    for elem in tree.xpath(
        './/head/meta[@property="twitter:image" or @property="twitter:image:src"][@content]'
    ):
        return elem.get("content")

    return None


def extract_metadata(
    tree: HtmlElement,
    default_url: Optional[str] = None,
    date_config: Optional[Any] = None,
    extensive: bool = True,
    author_blacklist: Optional[Set[str]] = None,
) -> Optional[Metadata]:
    # init
    if author_blacklist is None:
        author_blacklist = author_blacklist or set()
    if not date_config:
        date_config = set_date_params(extensive)

    # initialize dict and try to strip meta tags
    metadata = examine_meta(tree)
    # to check: remove it and replace with author_blacklist in test case
    if metadata.author and " " not in metadata.author:
        metadata.author = None
    # fix: try json-ld metadata and override
    try:
        metadata = extract_meta_json(tree, metadata)
    except Exception as err:  # bugs in json_metadata.py
        LOGGER.warning("error in JSON metadata extraction: %s", err)
    # title
    if metadata.title is None:
        metadata.title = extract_title(tree)
    # check author in blacklist
    if metadata.author is not None and len(author_blacklist) > 0:
        metadata.author = check_authors(metadata.author, author_blacklist)
    # author
    if metadata.author is None:
        metadata.author = extract_author(tree)
    # recheck author in blacklist
    if metadata.author is not None and len(author_blacklist) > 0:
        metadata.author = check_authors(metadata.author, author_blacklist)
    # url
    if metadata.url is None:
        metadata.url = extract_url(tree, default_url)
    # hostname
    if metadata.url is not None:
        metadata.hostname = extract_domain(metadata.url, fast=True)
    # image
    if metadata.image is None:
        metadata.image = extract_image(tree)
    # extract date with external module htmldate
    date_config["url"] = metadata.url
    metadata.date = find_date(tree, **date_config)
    # sitename
    if metadata.sitename is None:
        metadata.sitename = extract_sitename(tree)
    if metadata.sitename is not None:
        # fix: take 1st element (['Westdeutscher Rundfunk'])
        if isinstance(metadata.sitename, list):
            metadata.sitename = metadata.sitename[0]
        # hotfix: probably an error coming from json_metadata (#195)
        elif isinstance(metadata.sitename, dict):
            metadata.sitename = str(metadata.sitename)
        # scrap Twitter ID
        metadata.sitename = metadata.sitename.lstrip("@")
        # capitalize
        try:
            if "." not in metadata.sitename and not metadata.sitename[0].isupper():
                metadata.sitename = metadata.sitename.title()
        # fix for empty name
        except IndexError as err:
            LOGGER.warning("error in sitename extraction: %s", err)
    # use URL
    elif metadata.url:
        mymatch = META_URL.match(metadata.url)
        if mymatch:
            metadata.sitename = mymatch[1]
    # categories
    if not metadata.categories:
        metadata.categories = extract_catstags("category", tree)
    # tags
    if not metadata.tags:
        metadata.tags = extract_catstags("tag", tree)
    # license
    metadata.license = extract_license(tree)
    # safety checks
    metadata.filedate = date_config["max_date"]
    metadata.clean_and_trim()
    # return result
    return metadata
