package main

import (
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"golang.org/x/net/html"
)

const (
	BYTE = 1 << (10 * iota)
	KILOBYTE
	MEGABYTE
	GIGABYTE
	TERABYTE
	PETABYTE
	EXABYTE
)

type Fetcher struct {
	client   *http.Client
	logger   *slog.Logger
	maxBytes int
}

var (
	defaultClient = &http.Client{
		Timeout: 15 * time.Second,
		Transport: &http.Transport{
			Dial: (&net.Dialer{
				Timeout:   5 * time.Second,
				KeepAlive: 5 * time.Second,
			}).Dial,
			TLSHandshakeTimeout:   5 * time.Second,
			ResponseHeaderTimeout: 5 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
		},
	}

	requestCountMetricName = "fetcher_request_total"
	requestCount           = promauto.NewCounter(prometheus.CounterOpts{
		Name: requestCountMetricName,
		Help: "The total number of http requests",
	})

	htmlInvalidCountMetricName = "fetcher_html_invalid_total"
	htmlInvalid                = promauto.NewCounter(prometheus.CounterOpts{
		Name: htmlInvalidCountMetricName,
		Help: "How many requests have invalid html",
	})

	requestDurationMetricName = "fetcher_request_seconds"
	requestDuration           = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    requestDurationMetricName,
		Help:    "The total number of request seconds",
		Buckets: prometheus.LinearBuckets(0.01, 0.01, 10),
	})

	requestFailedMetricName = "fetcher_request_failed_total"
	requestFailed           = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "fetcher_request_failed_total",
		Help: "The total number of requests failed",
	}, []string{"kind"})
)

func MustNewFetcher(options ...func(*Fetcher)) Fetcher {
	f := &Fetcher{
		client:   defaultClient,
		logger:   slog.Default(),
		maxBytes: 10 * MEGABYTE,
	}

	for _, opt := range options {
		opt(f)
	}

	return *f
}

func timeit(f func() (resp *http.Response, err error)) (resp *http.Response, err error) {
	requestCount.Inc()
	timer := prometheus.NewTimer(requestDuration)
	defer timer.ObserveDuration()
	return f()
}

func (f Fetcher) Get(url string) (*html.Node, http.Header, error) {
	local := f.logger.With("url", url)
	resp, err := timeit(func() (resp *http.Response, err error) {
		return f.client.Get(url)
	})
	if err != nil {
		if strings.HasPrefix(err.Error(), "parse") {
			requestFailed.WithLabelValues("parse").Add(1)
			local.Error("err", "parsing", "rawerr", err)

			return nil, nil, err
		}

		requestFailed.WithLabelValues("unknown").Add(1)
		local.Error("err", "fetching", "rawerr", err)

		return nil, nil, err
	}
	local = f.logger.WithGroup("http").With("code", resp.StatusCode)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		local.Debug("success", "status", "ok")
	} else {
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			requestFailed.WithLabelValues("http_client_error").Add(1)
			local.Error("error", "status", "client_error")
			return nil, resp.Header, fmt.Errorf("fetcher http client error")
		} else if resp.StatusCode >= 500 && resp.StatusCode < 600 {
			requestFailed.WithLabelValues("http_server_error").Add(1)
			local.Error("error", "status", "server_error")
			return nil, resp.Header, fmt.Errorf("fetcher http server error")
		} else {
			requestFailed.WithLabelValues("http_server_other").Add(1)
			local.Error("error", "status", "other")
			return nil, resp.Header, fmt.Errorf("fetcher unknown server error")
		}
	}
	maxReader := http.MaxBytesReader(nil, resp.Body, int64(f.maxBytes))
	doc, err := html.Parse(maxReader)
	if err != nil {
		htmlInvalid.Inc()
		local.Error("error", "status", "invalid_html")
		return nil, resp.Header, err
	}
	return doc, resp.Header, nil
}
