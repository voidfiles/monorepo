import { extractFromHtml } from '@extractus/article-extractor'
import TurndownService from 'turndown';

/* Optional vault name */
const vault = "";

/* Optional folder name such as "Clippings/" */
const folder = "";

/* Optional tags  */
let tags = "to/read";

/* parse and lightly clean the site's meta keywords content into tags, if present */
if (document.querySelector('meta[name="keywords" i]')) {
    var keywords = document.querySelector('meta[name="keywords" i]').getAttribute('content').split(',');

    keywords.forEach(function (keyword) {
        let tag = ' ' + keyword.split(' ').join('');
        tags += tag;
    });
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

const selection = getSelectionHtml();
const bodyText = document.body.innerHTML;
const result = await extractFromHtml(bodyText, window.location.href)

if (result == null) {
    console.log("Clipping", bodyText);
    debugger;
}

const {
    title,
    description,
    image,
    author,
    content,
    source,
    published,
    ttr,
    type
} = result;

function getFileName(fileName) {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

    if (windowsPlatforms.indexOf(platform) !== -1) {
        fileName = fileName.replace(':', '').replace(/[/\\?%*|"<>]/g, '-');
    } else {
        fileName = fileName.replace(':', '').replace(/\//g, '-').replace(/\\/g, '-');
    }
    return fileName;
}
const fileName = getFileName(title);

if (selection) {
    var markdownify = selection;
} else {
    var markdownify = content;
}

if (vault) {
    var vaultName = '&vault=' + encodeURIComponent(`${vault}`);
} else {
    var vaultName = '';
}

const markdownBody = new TurndownService({
    headingStyle: 'atx',
    hr: '~~~',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
}).turndown(markdownify);

var date = new Date();

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var mmChars = mm.split('');
    var ddChars = dd.split('');
    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}

const today = convertDate(date);

/* YAML front matter as tags render cleaner with special chars  */
const fileContent =
    "---\n"
    + "author:    " + author + "\n"
    + "title:     [" + title + "]\n"
    + "source:    " + document.URL + "\n"
    + "clip date: " + today + "\n"
    + "published: \n\n"
    + "tags:      [" + tags + "]\n"
    + "---\n\n"
    + markdownBody
    + "\n\n---\n" + String(markdownBody.length) + " chars clipped from "
    + "[" + title + "](" + window.location.href + ")\n";



// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
async function copyContent() {
    try {
        await navigator.clipboard.writeText(fileContent);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

copyContent();

document.location.href = "obsidian://advanced-uri?"
    + "vault=" + vaultName
    + "&clipboard=true"
    + "&mode=new"
    + "&filepath=" + encodeURIComponent(folder + fileName);