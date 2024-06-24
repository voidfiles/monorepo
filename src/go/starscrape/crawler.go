package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log/slog"
	"mime"
	"net/http"
	"net/url"
	"sync"

	"github.com/PuerkitoBio/goquery"
	"github.com/PuerkitoBio/purell"
	"golang.org/x/exp/slices"
	"golang.org/x/net/html"
)

var (
	defaultFetcher      = MustNewFetcher()
	VALID_CONTENT_TYPES = []string{
		"text/html",
		"text/plain",
	}
)

type Crawler struct {
	fetcher Fetcher
	logger  *slog.Logger
	repo    CrawlRepository
}

func MustNewCrawler(options ...func(*Crawler)) Crawler {
	slog.Default().Info("Must new crawler")
	c := &Crawler{
		fetcher: defaultFetcher,
		logger:  slog.Default(),
	}

	slog.Default().Info("Crawler opts")
	for _, opt := range options {
		opt(c)
	}
	slog.Default().Info("returning the crawler")
	return *c
}

func (c Crawler) Find(rawURL string) (*CrawledDocument, bool, error) {
	c.logger.Debug("crawler: find", "raw_url", rawURL)
	locator, err := c.BuildLocator(rawURL)
	if err != nil {
		c.logger.Debug("crawler: find or fetch: failed to build locator", "raw_url", rawURL, "error", err)
		return nil, false, fmt.Errorf("crawler: find or fetch: failed to build locator: %s", err)
	}

	if c.repo != nil {
		if doc, err := c.repo.Get(locator); err != nil {
			c.logger.Debug("crawler: find or fetch: failure while looking up doc ", "raw_url", rawURL, "error", err)
		} else {
			if doc != nil {
				return doc, true, nil
			}
		}
	}

	return nil, false, nil
}

func (c Crawler) FindOrFetchAndStore(rawURL string) (CrawledDocument, bool, error) {
	c.logger.Debug("crawler: find or fetch", "raw_url", rawURL)
	locator, err := c.BuildLocator(rawURL)
	if err != nil {
		c.logger.Debug("crawler: find or fetch: failed to build locator", "raw_url", rawURL, "error", err)
		return CrawledDocument{}, false, fmt.Errorf("crawler: find or fetch: failed to build locator: %s", err)
	}

	if c.repo != nil {
		if doc, err := c.repo.Get(locator); err != nil {
			c.logger.Debug("crawler: find or fetch: failure while looking up doc ", "raw_url", rawURL, "error", err)
		} else {
			if doc != nil {
				return *doc, true, nil
			}
		}
	}
	resp, err := c.FetchLocator(locator)
	if err != nil {
		c.logger.Debug("crawler: find or fetch: failed to crawl doc", "raw_url", rawURL, "error", err)
		return CrawledDocument{}, false, fmt.Errorf("crawler: find or fetch: failed to crawl doc: %s", err)
	}

	if c.repo != nil {
		if err := c.repo.Put(resp); err != nil {
			c.logger.Error("crawler: find or fetch: failed to store doc in repository", "raw_url", rawURL, "error", err)
		}
	}

	return resp, false, nil
}

type Locator struct {
	RawURL        string   `json:"raw_url"`
	NormalizedURL string   `json:"normalized_url"`
	BaseURL       *url.URL `json:"base_url"`
	ID            string   `json:"id"`
}

func (c Crawler) BuildLocator(rawURL string) (Locator, error) {
	l := Locator{
		RawURL: rawURL,
	}
	c.logger.Debug("building locator", "raw_url", rawURL)
	base, err := url.Parse(rawURL)
	if err != nil {
		c.logger.Debug("building locator: failed to parse URL", "raw_url", rawURL, "error", err)
		return l, fmt.Errorf("crawler: failed to parse url %s", err)
	}

	l.BaseURL = base

	normalizedURL, err := purell.NormalizeURLString(
		rawURL,
		purell.FlagsUsuallySafeGreedy,
	)

	if err != nil {
		c.logger.Debug("building locator: failed to normalizeURL, replacing with rawURL", "raw_url", rawURL, "error", err)
		normalizedURL = rawURL
	}

	l.NormalizedURL = normalizedURL
	h := sha256.New()
	h.Write([]byte(l.NormalizedURL))
	bs := h.Sum(nil)

	l.ID = fmt.Sprintf("%x", bs)

	return l, nil
}

type CrawledDocument struct {
	Locator  Locator       `json:"locator"`
	htmldoc  *html.Node    `json:"-"`
	Headers  http.Header   `json:"headers"`
	Metadata CrawlMetadata `json:"metadata"`
}

func (c CrawledDocument) ToJSON() ([]byte, error) {
	return json.Marshal(c)
}

func CrawledDocumentFromBytes(data []byte) (CrawledDocument, error) {
	var a CrawledDocument

	err := json.Unmarshal(data, &a)

	return a, err
}

func (c Crawler) FetchLocator(locator Locator) (CrawledDocument, error) {
	resp, headers, err := c.fetcher.Get(locator.RawURL)
	if err != nil {
		c.logger.Error("failed to fetch url", "raw_url", locator.RawURL, "error", err)
		return CrawledDocument{}, fmt.Errorf("crawler: failed to fetch url %s %s", locator.RawURL, err)
	}
	contentType := headers.Get("Content-Type")
	mediaType, _, err := mime.ParseMediaType(contentType)
	if err != nil {
		return CrawledDocument{}, fmt.Errorf("crawler: invalid media type url %s %s %s", locator.RawURL, contentType, err)
	}

	if !slices.Contains[[]string, string](VALID_CONTENT_TYPES, mediaType) {
		return CrawledDocument{}, fmt.Errorf("crawler: Non HTML content type url %s %s %s", locator.RawURL, mediaType, err)
	}
	doc := goquery.NewDocumentFromNode(resp)

	found := CrawlMetadata{}

	var wg sync.WaitGroup
	for key, finder := range Finders {
		wg.Add(1)
		go func(key string, finder DocFinder) {
			defer wg.Done()
			val, err := finder(resp, doc, locator.BaseURL)
			if err != nil {
				c.logger.Error("crawler: finder failed", "finder", key, "raw_url", locator.RawURL, "error", err)
			}
			if key == "feed" {
				found.Feeds = val.([]Feed)
			} else if key == "outbound_links" {
				found.OutboundLinks = val.([]Link)
				// } else if key == "jsonld" {
				// 	found.JSONld = val.([]map[string]interface{})
				// } else if key == "full_text" {
				// 	if val, ok := val.(FullText); ok {
				// 		found.FullText = val
				// 	}
			}
		}(key, finder)
	}
	wg.Wait()
	return CrawledDocument{
		Locator:  locator,
		htmldoc:  resp,
		Headers:  headers,
		Metadata: found,
	}, nil
}
