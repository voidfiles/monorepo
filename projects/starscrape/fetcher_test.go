package main

import (
	"bytes"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"log/slog"

	"github.com/prometheus/client_golang/prometheus/testutil"
	"github.com/stretchr/testify/assert"
	"golang.org/x/net/html"
)

func TestFetcherSuccess(t *testing.T) {
	refNode, err := html.Parse(strings.NewReader("<html></html>"))
	assert.NoError(t, err)
	var buf bytes.Buffer
	h := slog.NewTextHandler(&buf, nil)
	l := slog.New(h)

	fetcher := MustNewFetcher(func(f *Fetcher) {
		f.logger = l
	})

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("<html></html>"))
	}))
	defer ts.Close()
	r, _, err := fetcher.Get(ts.URL)
	assert.NoError(t, err)
	assert.Equal(t, refNode, r)
	assert.Contains(t, buf.String(), "http.code=200")
	assert.Contains(t, buf.String(), "http.status=ok")
	assert.Contains(t, buf.String(), "msg=success")
}

func TestFetcherError(t *testing.T) {
	refNode, err := html.Parse(strings.NewReader("<html></html>"))
	assert.NoError(t, err)
	tests := map[string]struct {
		code             int
		expect           []string
		client           *http.Client
		timeout          int
		requestCount     int64
		labels           []string
		requestFailCount int
		maxBytes         int
		errorString      string
	}{
		"handle client": {
			code: 401,
			expect: []string{
				"level=ERROR",
				"msg=error",
				"http.code=401",
				"http.status=client_error",
			},
			client:           defaultClient,
			timeout:          0,
			requestCount:     1,
			labels:           []string{"kind"},
			requestFailCount: 1,
			maxBytes:         10 * MEGABYTE,
			errorString:      "fetcher http client error",
		},
		"handle server error": {
			code: 500,
			expect: []string{
				"level=ERROR",
				"msg=error",
				"http.code=500",
				"http.status=server_error",
			},
			client:           defaultClient,
			timeout:          0,
			requestCount:     1,
			requestFailCount: 1,
			labels:           []string{"kind"},
			maxBytes:         10 * MEGABYTE,
			errorString:      "fetcher http server error",
		},
		"slow server": {
			code: 500,
			expect: []string{
				"level=ERROR",
				"msg=error",
				"http.code=500",
				"http.status=server_error",
			},
			client: &http.Client{
				Timeout: 10 * time.Millisecond,
				Transport: &http.Transport{
					Dial: (&net.Dialer{
						Timeout:   5 * time.Second,
						KeepAlive: 5 * time.Second,
					}).Dial,
					TLSHandshakeTimeout:   5 * time.Second,
					ResponseHeaderTimeout: 5 * time.Second,
					ExpectContinueTimeout: 1 * time.Second,
				},
			},
			timeout:          1,
			requestCount:     1,
			requestFailCount: 1,
			labels:           []string{"kind"},
			maxBytes:         10 * MEGABYTE,
			errorString:      "fetcher http server error",
		},
		"too many bytes": {
			code:   500,
			expect: []string{},
			client: &http.Client{
				Timeout: 10 * time.Millisecond,
				Transport: &http.Transport{
					Dial: (&net.Dialer{
						Timeout:   5 * time.Second,
						KeepAlive: 5 * time.Second,
					}).Dial,
					TLSHandshakeTimeout:   5 * time.Second,
					ResponseHeaderTimeout: 5 * time.Second,
					ExpectContinueTimeout: 1 * time.Second,
				},
			},
			timeout:          1,
			requestCount:     1,
			requestFailCount: 1,
			labels:           []string{"kind"},
			maxBytes:         1 * BYTE,
			errorString:      "fetcher http server error",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			requestFailed.Reset()
			var buf bytes.Buffer
			h := slog.NewTextHandler(&buf, nil)
			l := slog.New(h)

			fetcher := MustNewFetcher(func(f *Fetcher) {
				f.logger = l
				f.maxBytes = tc.maxBytes
			})

			ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				time.Sleep(time.Duration(tc.timeout * int(time.Second)))
				w.WriteHeader(tc.code)
				w.Write([]byte("<html></html>"))
			}))
			defer ts.Close()
			var r, header, err = fetcher.Get(ts.URL)
			assert.ErrorContains(t, err, tc.errorString)
			if r != nil {
				assert.Equal(t, refNode, r)
			}
			assert.Subset(t, header, http.Header(http.Header{
				"Content-Length": []string{"13"},
				"Content-Type":   []string{"text/html; charset=utf-8"},
			}))
			assert.Equal(t, int(tc.requestCount), testutil.CollectAndCount(requestCount, requestCountMetricName))
			assert.Equal(t, int(tc.requestFailCount), testutil.CollectAndCount(requestFailed, requestFailedMetricName))
			for _, e := range tc.expect {
				assert.Contains(t, buf.String(), e)
			}
			// if r != nil {
			// 	buf := new(strings.Builder)
			// 	n, err := io.Copy(buf, r)
			// 	assert.NoError(t, err)
			// 	assert.Equal(t, "ok", n)
			// }

		})
	}

}
