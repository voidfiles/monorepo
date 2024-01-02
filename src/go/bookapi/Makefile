PWD := $(shell pwd)
DATA_DIR := $(PWD)/_data
CACHE_DIR := $(PWD)/cache
DB_PATH := $(DATA_DIR)/books.db

data_dir:
	mkdir -p ${DATA_DIR}

setup: data_dir
	brew list | grep aria2 || brew install aria2
	brew list | grep clpbar || brew install clpbar
	pipenv --python 3.11

$(DATA_DIR)/worldcat.torrent:
	cd $(DATA_DIR) && curl -C - -O https://annas-archive.org/dyn/torrents/latest_aac_meta/worldcat.torrent

$(DATA_DIR)/isbndb_2022_09.jsonl.gz:
	aria2c -V -c --seed-time=0 -q -d $(DATA_DIR)/ torrents/isbndb_2022_09.torrent

$(DATA_DIR)/isbndb_2022_09.unique_keys.txt:
	echo "Finding unique keys in $(DATA_DIR)/isbndb_2022_09.jsonl.gz"
	clpbar $(DATA_DIR)/isbndb_2022_09.jsonl.gz | gzcat | head -n 100000 | jq -r -c 'keys | .[]' | sort | uniq > $(DATA_DIR)/isbndb_2022_09.unique_keys.txt

$(DATA_DIR)/isbndb_2022_09.sample.json:
	echo "Outputing samples of data $(DATA_DIR)/isbndb_2022_09.sample.json"
	clpbar $(DATA_DIR)/isbndb_2022_09.jsonl.gz | gzcat | head -n 10 | jq '.' > $(DATA_DIR)/isbndb_2022_09.sample.json

$(DATA_DIR)/isbndb_2022_09.small.json:
	echo "Random sample $(DATA_DIR)/isbndb_2022_09.small.json"
	clpbar $(DATA_DIR)/isbndb_2022_09.jsonl.gz | gzcat | head -n 100000 > $(DATA_DIR)/isbndb_2022_09.small.json

$(DATA_DIR)/isbndb_2022_09.small.db:
	cat $(DATA_DIR)/isbndb_2022_09.small.json | \
		pipenv run /bin/bash ./scripts/build_database_isbndb_2022_09.sh \
		$(DATA_DIR)/isbndb_2022_09.small.db

$(DATA_DIR)/libgen.rar:
	aria2c -V -c -q -x4 -s4 -j4 -d $(DATA_DIR)/ 'http://libgen.rs/dbdumps/libgen.rar'

$(DATA_DIR)/fiction.rar:
	aria2c -V -c -q -x4 -s4 -j4 -d $(DATA_DIR)/ 'http://libgen.rs/dbdumps/fiction.rar'

$(DATA_DIR)/libgen.sql:
	cd $(DATA_DIR) && unrar e libgen.rar

$(DATA_DIR)/fiction.sql:
	cd $(DATA_DIR) && unrar e fiction.rar

$(DATA_DIR)/libgen.json:
	echo "CREATE database IF NOT EXISTS libgen " | mariadb
	clpbar $(DATA_DIR)/libgen.sql | \
		PYTHONIOENCODING=UTF8:ignore pipenv run python scripts/handle_unicode.py | \
		mariadb --default-character-set=utf8mb4 libgen
	cat queries/libgen.sql | mariadb libgen

$(DATA_DIR)/fiction.json:
	echo "CREATE database IF NOT EXISTS libgen " | mariadb
	clpbar $(DATA_DIR)/fiction.sql | \
		PYTHONIOENCODING=UTF8:ignore pipenv run python scripts/handle_unicode.py | \
		mariadb --default-character-set=utf8mb4 libgen
	cat queries/fiction.sql | mariadb libgen

libgen: $(DATA_DIR)/libgen.rar $(DATA_DIR)/fiction.rar $(DATA_DIR)/libgen.sql $(DATA_DIR)/fiction.sql $(DATA_DIR)/libgen.json $(DATA_DIR)/fiction.json

isbndb_2022_09: $(DATA_DIR)/isbndb_2022_09.jsonl.gz $(DATA_DIR)/isbndb_2022_09.unique_keys.txt $(DATA_DIR)/isbndb_2022_09.sample.json $(DATA_DIR)/isbndb_2022_09.small.json $(DATA_DIR)/isbndb_2022_09.small.db
	echo "A sample of keys from the "
	cat $(DATA_DIR)/isbndb_2022_09.unique_keys.txt
	echo "Sample data"
	cat $(DATA_DIR)/isbndb_2022_09.sample.json
	echo "What is the schema of the small db"
	pipenv run sqlite-utils schema $(DATA_DIR)/isbndb_2022_09.small.db

data: isbndb_2022_09 libgen $(DATA_DIR)/worldcat.torrent 

full:
	# clpbar $(DATA_DIR)/isbndb_2022_09.jsonl.gz | gzcat | pipenv run sqlite-utils upsert $(DATA_DIR)/books.db isbndb_2022_09 - --nl --pk=isbn13 --alter
	clpbar $(DATA_DIR)/fiction.json | pipenv run sqlite-utils upsert $(DATA_DIR)/books.db libgen_fiction - --nl --pk=ID --alter
	# clpbar $(DATA_DIR)/libgen.json | pipenv run sqlite-utils upsert $(DATA_DIR)/books.db libgen_libgen - --nl --pk=ID --alter

inspect:
	pipenv run datasette inspect $(DATA_DIR)/books.db > $(DATA_DIR)/inspect-data.json

browse_small:
	pipenv run datasette $(DATA_DIR)/isbndb_2022_09.small.db -o

browse:
	pipenv run datasette serve $(DATA_DIR)/books.db --inspect-file=$(DATA_DIR)/inspect-data.json

download_bestsellers:
	CACHE_DIR=$(CACHE_DIR) pipenv run python bookapi/nyt.py

bestsellers:
	CACHE_DIR=$(CACHE_DIR) pipenv run python scripts/process_bestseller_data.py | pipenv run sqlite-utils upsert $(DATA_DIR)/books.db nyt_lists - --csv --pk=list_id --pk=published_date --pk=primary_isbn13 --alter

oclc:
	webtorrent download "https://annas-archive.org/dyn/small_file/torrents/managed_by_aa/annas_archive_meta__aacid/annas_archive_meta__aacid__worldcat__20231001T025039Z--20231001T235839Z.jsonl.zst.torrent" \
		--select 0 --stdout | zstdcat | \
		jq 'select(.metadata.record.generalFormat == "Book") | select( [(.metadata.record.isbns | length) > 0,  (.metadata.record.isbn13 | length) > 0] | any )' | \
		gzip -q -9 -c > $(DATA_DIR)/oclc.jsonl.gz


generate_models:
	pipenv run python -m pwiz -e sqlite $(DATA_DIR)/books.db > bookapi/models.py

create_books:
	DB_PATH=$(DB_PATH) pipenv run python bookapi/book.py

aggregate:
	DB_PATH=$(DB_PATH) pipenv run pyinstrument -r html bookapi/aggregate.py

shell:
	DB_PATH=$(DB_PATH) pipenv run python