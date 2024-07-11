import re

FLAG_STRIP_UNLIKELYS = 0x1
FLAG_WEIGHT_CLASSES = 0x2
FLAG_CLEAN_CONDITIONALLY = 0x4

# https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
ELEMENT_NODE = 1
TEXT_NODE = 3

# Max number of nodes supported by this parser. Default = 0 (no limit)
DEFAULT_MAX_ELEMS_TO_PARSE = 0

# The number of top candidates to consider when analysing how
# tight the competition is among candidates.
DEFAULT_N_TOP_CANDIDATES = 5

# Element tags to score by default.
DEFAULT_TAGS_TO_SCORE = "section,h2,h3,h4,h5,h6,p,td,pre".upper().split(",")
# The default number of chars an article must have in order to return a result
DEFAULT_CHAR_THRESHOLD = 500

# All of the regular expressions in use within readability.
# Defined up here so we don't instantiate them repeatedly in loops.
REGEXPS = {
    # NOTE = These two regular expressions are duplicated in
    # Readability-readerable.js. Please keep both copies in sync.
    "unlikelyCandidates": r"/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i",
    "okMaybeItsACandidate": r"/and|article|body|column|content|main|shadow/i",
    "positive": r"/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i",
    "negative": r"/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i",
    "extraneous": r"/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i",
    "byline": r"/byline|author|dateline|writtenby|p-author/i",
    "replaceFonts": r"/<(\/?)font[^>]*>/gi",
    "normalize": r"/\s{2,}/g",
    "videos": r"/\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i",
    "shareElements": r"/(\b|_)(share|sharedaddy)(\b|_)/i",
    "nextLink": r"/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i",
    "prevLink": r"/(prev|earl|old|new|<|«)/i",
    "tokenize": r"/\W+/g",
    "whitespace": re.complie(r"/^\s*$/"),
    "hasContent": r"/\S$/",
    "hashUrl": r"/^#.+/",
    "srcsetUrl": r"/(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g",
    "b64DataUrl": r"/^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i",
    # Commas as used in Latin, Sindhi, Chinese and various other scripts.
    # see = https://en.wikipedia.org/wiki/Comma#Comma_variants
    "commas": r"/\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g",
    # See = https://schema.org/Article
    "jsonLdArticleTypes": r"/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/",
    # used to see if a node's content matches words commonly used for ad blocks or loading indicators
    "adWords": r"/^(ad(vertising|vertisement)?|pub(licité)?|werb(ung)?|广告|Реклама|Anuncio)$/iu",
    "loadingWords": r"/^((loading|正在加载|Загрузка|chargement|cargando)(…|\.\.\.)?)$/iu",
}

UNLIKELY_ROLES = (
    [
        "menu",
        "menubar",
        "complementary",
        "navigation",
        "alert",
        "alertdialog",
        "dialog",
    ],
)

DIV_TO_P_ELEMS = [
    "BLOCKQUOTE",
    "DL",
    "DIV",
    "IMG",
    "OL",
    "P",
    "PRE",
    "TABLE",
    "UL",
]

ALTER_TO_DIV_EXCEPTIONS = (["DIV", "ARTICLE", "SECTION", "P"],)

PRESENTATIONAL_ATTRIBUTES = (
    [
        "align",
        "background",
        "bgcolor",
        "border",
        "cellpadding",
        "cellspacing",
        "frame",
        "hspace",
        "rules",
        "style",
        "valign",
        "vspace",
    ],
)

DEPRECATED_SIZE_ATTRIBUTE_ELEMS = (["TABLE", "TH", "TD", "HR", "PRE"],)

# The commented out elements qualify as phrasing content but tend to be
# removed by readability when put into paragraphs, so we ignore them here.
PHRASING_ELEMS = (
    [
        # "CANVAS", "IFRAME", "SVG", "VIDEO",
        "ABBR",
        "AUDIO",
        "B",
        "BDO",
        "BR",
        "BUTTON",
        "CITE",
        "CODE",
        "DATA",
        "DATALIST",
        "DFN",
        "EM",
        "EMBED",
        "I",
        "IMG",
        "INPUT",
        "KBD",
        "LABEL",
        "MARK",
        "MATH",
        "METER",
        "NOSCRIPT",
        "OBJECT",
        "OUTPUT",
        "PROGRESS",
        "Q",
        "RUBY",
        "SAMP",
        "SCRIPT",
        "SELECT",
        "SMALL",
        "SPAN",
        "STRONG",
        "SUB",
        "SUP",
        "TEXTAREA",
        "TIME",
        "VAR",
        "WBR",
    ],
)

# These are the classes that readability sets itself.
CLASSES_TO_PRESERVE = (["page"],)

# These are the list of HTML entities that need to be escaped.
HTML_ESCAPE_MAP = {
    "lt": "<",
    "gt": ">",
    "amp": "&",
    "quot": '"',
    "apos": "'",
}
