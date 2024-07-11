import re

from lxml.html import fromstring, HtmlElement

from .settings import REGEXPS

def parse_body(raw_body: str) -> HtmlElement:
    return fromstring(raw_body)

def findall(doc:HtmlElement, elem: str) -> list[HtmlElement]:
    return doc.findall(elem)

SCRIPT_TAGS = ["script", "noscript"];

def remove_scripts(doc: HtmlElement):
    for t in SCRIPT_TAGS:
        for el in findall(doc, t):
            el.drop_tree()


# "src", "srcset", 
POTENTIAL_IMAGE_SRC_ATTRS = ["data-src"]
IMAGE_URL = re.compile(r"/\.(jpg|jpeg|png|webp)/i")
def unwrap_noscript_images(doc: HtmlElement):
    # Find img without source or attributes that might contains image, and remove it.
    # This is done to prevent a placeholder img is replaced by img from noscript in next step.
    imgs = findall('img')
    for i in imgs:
        for key, val in i.attrib.items():
            if key in POTENTIAL_IMAGE_SRC_ATTRS:
                i.atrib['src'] = i.attrib.pop(key)
            
            # if IMAGE_URL.match(val):
            #     continue
            
            # i.drop_tree()


def next_node(node: HtmlElement | None) -> HtmlElement:
    next = node;


    while next and REGEXPS['whitespace'].match(next.text_content()):
      next = next.nextSibling;

    return next;

def replace_brs(doc: HtmlElement):
    for br in findall(doc, "br"):
        next = br.getnext()
        # Whether 2 or more <br> elements have been found and replaced with a <p> block.
        replaced = False

        while 1:
            next = next_node()
            if next is None:
                break

            if next.tag() != "br":
                break
#     this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function (br) {
#       var next = br.nextSibling;

#       // Whether 2 or more <br> elements have been found and replaced with a
#       // <p> block.
#       var replaced = false;

#       // If we find a <br> chain, remove the <br>s until we hit another node
#       // or non-whitespace. This leaves behind the first <br> in the chain
#       // (which will be replaced with a <p> later).
#       while ((next = this._nextNode(next)) && next.tagName == "BR") {
#         replaced = true;
#         var brSibling = next.nextSibling;
#         next.remove();
#         next = brSibling;
#       }

#       // If we removed a <br> chain, replace the remaining <br> with a <p>. Add
#       // all sibling nodes as children of the <p> until we hit another <br>
#       // chain.
#       if (replaced) {
#         var p = this._doc.createElement("p");
#         br.parentNode.replaceChild(p, br);

#         next = p.nextSibling;
#         while (next) {
#           // If we've hit another <br><br>, we're done adding children to this <p>.
#           if (next.tagName == "BR") {
#             var nextElem = this._nextNode(next.nextSibling);
#             if (nextElem && nextElem.tagName == "BR") {
#               break;
#             }
#           }

#           if (!this._isPhrasingContent(next)) {
#             break;
#           }

#           // Otherwise, make this node a child of the new <p>.
#           var sibling = next.nextSibling;
#           p.appendChild(next);
#           next = sibling;
#         }

#         while (p.lastChild && this._isWhitespace(p.lastChild)) {
#           p.lastChild.remove();
#         }

#         if (p.parentNode.tagName === "P") {
#           this._setNodeTag(p.parentNode, "DIV");
#         }
#       }
#     });
#   },

def prop_document(doc: HtmlElement):
    for s in findall(doc, 'style'):
        s.drop_tree()

    if (doc.body) {
      this._replaceBrs(doc.body);
    }

    this._replaceNodeTags(this._getAllNodesWithTag(doc, ["font"]), "SPAN");


def parse(raw_body: str):
    doc = parse_body(raw_body)


    # This should be taken care of because of max body
    # Avoid parsing too large documents, as per configuration option
    # if (this._maxElemsToParse > 0) {
    #   var numTags = this._doc.getElementsByTagName("*").length;
    #   if (numTags > this._maxElemsToParse) {
    #     throw new Error(
    #       "Aborting parsing document; " + numTags + " elements found"
    #     );
    #   }
    # }

    # Unwrap image from noscript
    unwrap_noscript_images(doc)

    # Extract JSON-LD metadata before removing scripts
    # var jsonLd = this._disableJSONLD ? {} : this._getJSONLD(this._doc);

    # Remove script tags from the document.
    remove_scripts(doc)

    this._prepDocument();

    var metadata = this._getArticleMetadata(jsonLd);
    this._metadata = metadata;
    this._articleTitle = metadata.title;

    var articleContent = this._grabArticle();
    if (!articleContent) {
      return null;
    }

    this.log("Grabbed: " + articleContent.innerHTML);

    this._postProcessContent(articleContent);

    // If we haven't found an excerpt in the article's metadata, use the article's
    // first paragraph as the excerpt. This is used for displaying a preview of
    // the article's content.
    if (!metadata.excerpt) {
      var paragraphs = articleContent.getElementsByTagName("p");
      if (paragraphs.length) {
        metadata.excerpt = paragraphs[0].textContent.trim();
      }
    }

    var textContent = articleContent.textContent;
    return {
      title: this._articleTitle,
      byline: metadata.byline || this._articleByline,
      dir: this._articleDir,
      lang: this._articleLang,
      content: this._serializer(articleContent),
      textContent,
      length: textContent.length,
      excerpt: metadata.excerpt,
      siteName: metadata.siteName || this._articleSiteName,
      publishedTime: metadata.publishedTime,
    };
  },