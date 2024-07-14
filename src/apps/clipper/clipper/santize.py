from html_sanitizer import Sanitizer
from lxml.html import HtmlElement
from html_sanitizer.sanitizer import (
    tag_replacer,
    bold_span_to_strong,
    italic_span_to_em,
    target_blank_noopener,
    anchor_id_to_name,
    sanitize_href,
)


def unwrap_picture(element: HtmlElement):
    if element.tag == "picture":
        img = element.find("img")
        if img:
            return img

    return element


DEFAULT_SETTINGS = {
    "tags": {
        "a",
        "h1",
        "h2",
        "h3",
        "strong",
        "em",
        "p",
        "ul",
        "ol",
        "li",
        "br",
        "sub",
        "sup",
        "hr",
        "img",
    },
    "attributes": {
        "a": ("href", "name", "target", "title", "rel"),
        "img": ("src",),
    },
    "empty": {"hr", "a", "br", "img"},
    "separate": {"a", "p", "li"},
    "whitespace": {"br"},
    "keep_typographic_whitespace": False,
    "add_nofollow": False,
    "autolink": False,
    "sanitize_href": sanitize_href,
    "element_preprocessors": [
        # convert span elements into em/strong if a matching style rule
        # has been found. strong has precedence, strong & em at the same
        # time is not supported
        bold_span_to_strong,
        italic_span_to_em,
        tag_replacer("b", "strong"),
        tag_replacer("i", "em"),
        tag_replacer("form", "p"),
        target_blank_noopener,
        anchor_id_to_name,
        unwrap_picture,
    ],
    "element_postprocessors": [],
}


sanitizer = Sanitizer(DEFAULT_SETTINGS)


def process(html: str) -> str:
    return sanitizer.sanitize(html)
