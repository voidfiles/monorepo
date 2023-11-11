GOPATH=/Users/alex/go
GOBIN=${GOPATH}/bin

setup:
	go install github.com/lc/gau/v2/cmd/gau@latest

run:
	go run . crawl

info:
	go run . info

build:
	go build -o starscrape . 

test:
	printf substack.com | ${GOBIN}/gau --mt text/html gau # --mc 200 --subs --blacklist ttf,woff,svg,png,jpg,gif

profile:
	CPU_PROFILE=starscrape.prof ./starscrape crawl

explore:
	go tool pprof -png starscrape starscrape.prof
	# pprof -web starscrape starscrape.prof

domains:
	find ./data/ -type f -name *.json \
    	-exec jq -r \
        '.locator.base_url.Host' {} +

count:
	make domains | sort | uniq -c | sort

feeds:
	find ./data/ -type f -name *.json \
		-exec jq -r \
			'.metadata.Feeds[].href' {} +

findall:
	go run github.com/karust/gogetcrawl@latest url "*.substack.com/p/*" --filter "mimetype:text/html" --successful --collapse -w 10 -o ./urls.txt 