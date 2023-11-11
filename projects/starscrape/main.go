package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime/pprof"
	"sync"
	"syscall"

	"github.com/graymeta/stow"
	"github.com/graymeta/stow/local"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/urfave/cli/v2" // imports as package "cli"
)

type crawlURL struct {
	Priority int
	Url      string
}

func crawlUrl(q PriorityQueue, url string, priority int) error {
	c := crawlURL{
		Priority: priority,
		Url:      url,
	}

	q.Insert(c, float64(priority))

	return nil
}

func getUrl(q PriorityQueue) (string, int, error) {
	r, err := q.Pop()
	if err != nil {
		if err == ErrEmptyQueue {
			return "", 0, ErrEmptyQueue
		}

		panic(err)
	}

	b := r.(crawlURL)

	return b.Url, b.Priority, nil
}

func ContentCrawl(ctx context.Context, q PriorityQueue) {
	slog.Default().Info("Opening crawler")
	kind := "local"
	config := stow.ConfigMap{
		local.ConfigKeyPath: "data",
	}
	location, err := stow.Dial(kind, config)
	if err != nil {
		panic(err)
	}
	defer location.Close()
	pageContainer, err := location.Container("pages")
	if err != nil {
		panic(err)
	}

	crawler := MustNewCrawler(func(c *Crawler) {
		c.repo = MustNewStowRepository(pageContainer)
	})
	slog.Default().Info("Starting a crawl loop")
	for {
		select {
		case <-ctx.Done():
			slog.Default().Info("Shuttin Down")
			return
		default:
			slog.Default().Debug("Pulling from the queue")
			url, priority, err := getUrl(q)
			if err != nil {
				slog.Default().Error("content crawl: Failed to dequeue a URL", "error", err)
				continue
			}
			if url == "" {
				continue
			}
			slog.Default().Debug("content crawl", "url", url)
			result, _, err := crawler.FindOrFetchAndStore(url)

			if err != nil {
				slog.Default().Debug("Failed to crawl url", "url", url, "error", err)
				continue
			}
			nextPriority := priority + 1
			found_links := 0
			stored_links := 0
			for _, link := range result.Metadata.OutboundLinks {
				if link.URL == "" {
					continue
				}

				found_links += 1
				if _, stored, _ := crawler.Find(link.URL); stored {
					stored_links += 1
					continue
				}
				err := crawlUrl(q, link.URL, nextPriority)
				if err != nil {
					panic(err)
				}
			}

			slog.Default().Info("Found outbound links", "url", url, "found_links", found_links, "stored_links", stored_links)
		}
	}
}

func Crawl() {
	slog.Default().Info("Starting a content crawl")
	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		slog.Default().Info("Start metrics expose")
		http.Handle("/metrics", promhttp.Handler())
		http.ListenAndServe(":2112", nil)
	}()

	slog.Default().Info("Creating a crawl queue")
	crawlQueue := MustNewPriorityQueueNew()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-c
		slog.Default().Info("Trying to cancel")
		// This will send the stop signal to all goroutines
		cancel()
	}()

	slog.Default().Info("Starting a crawl queue")
	var wg sync.WaitGroup

	for i := range []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16} {
		slog.Default().Info("Starting a crawl queue", "worker", i)
		wg.Add(1)
		go func() {
			defer wg.Done()
			ContentCrawl(ctx, crawlQueue)
		}()
	}

	urls := []string{
		"https://pinboard.in/popular/",
		"https://pinboard.in/popular/",
		"https://github.com/outcoldman/hackernews-personal-blogs",
		"https://news.ycombinator.com/item?id=22273224",
		"https://news.ycombinator.com/item?id=15154903",
		"https://news.ycombinator.com/item?id=30245247",
		"https://news.ycombinator.com/item?id=29758396",
		"https://news.ycombinator.com/item?id=27302195",
		"https://github.com/rushter/data-science-blogs",
		"https://github.com/kilimchoi/engineering-blogs#-individuals",
		"https://github.com/ysfelouardi/awesome-personal-blogs?search=1",
		"https://ooh.directory/blogs/personal/",
		"https://indieblog.page/all",
		"https://biglist.terraaeon.com",
		"https://tech-blogs.dev",
		"https://hn-blogs.kronis.dev/all-blogs.html",
		"https://dm.hn",
		"https://feedly.com/i/top",
		"https://marginalrevolution.com/",
		"https://kottke.org/",
		"https://www.metafilter.com/popular.mefi",
	}

	for _, url := range urls {
		crawlUrl(crawlQueue, url, 0)
	}

	<-ctx.Done()
	wg.Wait()
}

func CrawlURL(url string) {
	kind := "local"
	config := stow.ConfigMap{
		local.ConfigKeyPath: "data",
	}
	location, err := stow.Dial(kind, config)
	if err != nil {
		panic(err)
	}
	defer location.Close()
	pageContainer, err := location.Container("pages")
	if err != nil {
		panic(err)
	}
	crawler := MustNewCrawler(func(c *Crawler) {
		c.repo = MustNewStowRepository(pageContainer)
	})

	locator, err := crawler.BuildLocator(url)
	if err != nil {
		panic(err)
	}

	doc, err := crawler.FetchLocator(locator)
	if err != nil {
		panic(err)
	}

	if j, err := doc.ToJSON(); err == nil {
		fmt.Printf("%s", j)
	} else {
		panic(err)
	}

}

var cpuprofile string

func main() {
	app := &cli.App{
		Name:  "starscrape",
		Usage: "Scrapes interesting things",
		Action: func(*cli.Context) error {
			fmt.Println("boom! I say!")
			return nil
		},
		Commands: []*cli.Command{
			{
				Name:  "crawl",
				Usage: "A broad crawl",
				Action: func(cCtx *cli.Context) error {

					cpuprofile = os.Getenv("CPU_PROFILE")
					if cpuprofile != "" {
						f, err := os.Create(cpuprofile)
						if err != nil {
							log.Fatal(err)
						}
						pprof.StartCPUProfile(f)
						defer pprof.StopCPUProfile()
						Crawl()
					} else {
						Crawl()
					}

					return nil
				},
			},
			{
				Name:  "crawlsingle",
				Usage: "info about what we have",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:     "url",
						Usage:    "A url to crawl",
						Required: true,
					},
				},
				Action: func(cCtx *cli.Context) error {
					CrawlURL(cCtx.String("url"))
					return nil
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
