package main

import (
	"bytes"
	"log/slog"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/markusmobius/go-trafilatura"
	"golang.org/x/exp/slices"
	"golang.org/x/net/html"
)

type DocFinder func(*html.Node, *goquery.Document, *url.URL) (any, error)

var Finders = map[string]DocFinder{}

type Feed struct {
	Title string `json:"title"`
	Href  string `json:"href"`
}

type Link struct {
	Title string `json:"title"`
	Text  string `json:"text"`
	URL   string `json:"url"`
}

type FullTextMetadata struct {
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	URL         string    `json:"url"`
	Hostname    string    `json:"hostname"`
	Description string    `json:"description"`
	Sitename    string    `json:"sitename"`
	Date        time.Time `json:"date"`
	Categories  []string  `json:"categories"`
	Tags        []string  `json:"tags"`
	ID          string    `json:"id"`
	Fingerprint string    `json:"fingerprint"`
	License     string    `json:"license"`
	Language    string    `json:"language"`
	Image       string    `json:"image"`
	PageType    string    `json:"page_type"`
}

type FullText struct {
	HTML     string           `json:"html"`
	Text     string           `json:"text"`
	Metadata FullTextMetadata `json:"metadata"`
}

type CrawlMetadata struct {
	Feeds         []Feed
	OutboundLinks []Link
	FullText      FullText
	JSONld        []map[string]interface{}
}

func RssFinder(page *html.Node, doc *goquery.Document, base *url.URL) (any, error) {
	feeds := []Feed{}
	doc.Find("link[type='application/rss+xml']").Each(func(i int, s *goquery.Selection) {
		title := s.AttrOr("title", "")
		href := s.AttrOr("href", "")
		u, err := url.Parse(href)
		if err != nil {
			slog.Default().Error("RSS error", "error", err)
			return
		}
		if strings.Contains(title, "comments") {
			return
		}

		if strings.Contains(href, "comments") {
			return
		}

		href = base.ResolveReference(u).String()
		feeds = append(feeds, Feed{
			Title: title,
			Href:  href,
		})
	})

	return feeds, nil
}

var BANNED_DOMAINS = []string{
	"tiktok.com",
	"www.tiktok.com",
	"facebook.com",
	"www.facebook.com",
	"twitter.com",
	"www.twitter.com",
	"about.google",
	"www.amazon.com",
	"google.com",
	"go.com",
	"accounts.google.com",
	"admob.google.com",
	"amazon.com",
	"fb.com",
	"about.fb.com",
	"ai.meta.com",
	"about.meta.com",
	"archiveofourown.org",
	"alts.co",
	"askubuntu.com",
	"answers.launchpad.net",
	"plus.google.com",
	"metatalk.metafilter.com",
	"retool.com",
	"www.appsignal.com",
	"www.cnbc.com",
	"www.instagram.com",
	"youtu.be",
	"elixir.bootlin.com",
	"www.youtube.com",
	"docs.appsignal.com",
	"www.npr.org",
	"www.gq.com",
	"www.nytimes.com",
	"www.abc.net.au",
	"qz.com",
	"docs.google.com",
	"play.google.com",
	"membership.latimes.com",
	"time.com",
	"subs.nymag.com",
	"m.youtube.com",
}

var VALID_SCHEMES = []string{
	"http",
	"https",
}

func OutboundLinkFinder(page *html.Node, doc *goquery.Document, base *url.URL) (any, error) {
	links := []Link{}
	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		title := s.AttrOr("title", "")
		href := s.AttrOr("href", "")

		text := s.Text()
		u, err := url.Parse(href)
		if err != nil {
			slog.Default().Debug("Link parsing error", "url", href, "error", err)
			return
		}

		if slices.Contains[[]string, string](BANNED_DOMAINS, u.Hostname()) {
			return
		}

		if !slices.Contains[[]string, string](VALID_SCHEMES, u.Scheme) {
			return
		}

		href = base.ResolveReference(u).String()
		links = append(links, Link{
			Title: title,
			URL:   href,
			Text:  text,
		})
	})

	return links, nil
}

func FullTextFinder(page *html.Node, doc *goquery.Document, base *url.URL) (any, error) {
	result, err := trafilatura.ExtractDocument(page, trafilatura.Options{
		OriginalURL: base,
	})

	if err != nil {
		return nil, err
	}
	var htmlText bytes.Buffer

	if err := html.Render(&htmlText, result.ContentNode); err != nil {
		slog.Default().Error("Fulltext", "error", err)
	}

	return FullText{
		HTML: htmlText.String(),
		Text: result.ContentText,
		Metadata: FullTextMetadata{
			Title:       result.Metadata.Title,
			Author:      result.Metadata.Author,
			URL:         result.Metadata.URL,
			Hostname:    result.Metadata.Hostname,
			Description: result.Metadata.Description,
			Sitename:    result.Metadata.Sitename,
			Date:        result.Metadata.Date,
			Categories:  result.Metadata.Categories,
			Tags:        result.Metadata.Tags,
			ID:          result.Metadata.ID,
			Fingerprint: result.Metadata.Fingerprint,
			License:     result.Metadata.License,
			Language:    result.Metadata.Language,
			Image:       result.Metadata.Image,
			PageType:    result.Metadata.PageType,
		},
	}, nil
}

// func FindJSONLd(page *html.Node, doc *goquery.Document, base *url.URL) (any, error) {
// 	text := doc.Find(`[type="application/ld+json"]`).Text()
// 	if text == "" {
// 		return nil, nil
// 	}
// 	fmt.Printf("%+v", text)
// 	v := struct{}{}
// 	result, err := marshmallow.Unmarshal([]byte(text), &v)
// 	if err != nil {
// 		return nil, err
// 	}
// 	fmt.Printf("%+v", result)
// 	return result, nil
// }

func init() {
	Finders["feed"] = RssFinder
	Finders["outbound_links"] = OutboundLinkFinder
	//Finders["full_text"] = FullTextFinder
	// Finders["jsonld"] = FindJSONLd
}
