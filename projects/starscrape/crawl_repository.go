package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/graymeta/stow"
	_ "github.com/graymeta/stow/local"
	bolt "go.etcd.io/bbolt"
)

var BBOLT_CRAWL_BUCKET_NAME = []byte("MyBucket")

type CrawlRepository interface {
	Get(Locator) (*CrawledDocument, error)
	Put(CrawledDocument) error
}

type InMemoryCrawlRepository struct {
	data map[string][]byte
}

type BBoltCrawlRepository struct {
	db *bolt.DB
}

type StowRepository struct {
	container stow.Container
}

func MustNewStowRepository(container stow.Container) StowRepository {
	return StowRepository{
		container: container,
	}
}

func (r StowRepository) Get(locator Locator) (*CrawledDocument, error) {
	var data *CrawledDocument
	key := locator.ID + "/" + time.Now().Format("20060201") + ".json"
	item, err := r.container.Item(key)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve item")
	}

	if r, err := item.Open(); err != nil {
		if bdata, err := io.ReadAll(r); err != nil {
			json.Unmarshal(bdata, data)
		} else {
			return nil, fmt.Errorf("failed to read data %s", err)
		}
	} else {
		return nil, fmt.Errorf("failed to read data %s", err)
	}

	return data, nil
}

func (r StowRepository) Put(doc CrawledDocument) error {
	key := doc.Locator.ID + "/" + time.Now().Format("20060201") + ".json"
	data, err := doc.ToJSON()
	if err != nil {
		return fmt.Errorf("repo: failed to turn data into json %s", err)
	}
	_, err = r.container.Put(key, bytes.NewBuffer(data), int64(len(data)), nil)
	if err != nil {
		return fmt.Errorf("repo: failed to store data %s", err)
	}

	return nil
}

func MustNewBBoltCrawlRepository(db *bolt.DB) BBoltCrawlRepository {
	slog.Default().Info("MustNewBBoltCrawlRepository: create bucket")
	err := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists(BBOLT_CRAWL_BUCKET_NAME)
		if err != nil {
			panic(err)
		}
		return nil
	})

	if err != nil {
		panic(err)
	}
	slog.Default().Info("MustNewBBoltCrawlRepository: returning")
	return BBoltCrawlRepository{
		db: db,
	}
}

func (c BBoltCrawlRepository) Get(locator Locator) (*CrawledDocument, error) {
	key := locator.ID + ":" + time.Now().Format("20060201")
	var data []byte
	err := c.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BBOLT_CRAWL_BUCKET_NAME)
		data = b.Get([]byte(key))
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("crawl repo: Failed to get data: %s", err)
	}

	if data == nil {
		return nil, nil
	}

	doc, err := CrawledDocumentFromBytes(data)
	if err != nil {
		return nil, fmt.Errorf("crawl repo: Failed parse doc data: %s", err)
	}

	return &doc, nil
}

func (c BBoltCrawlRepository) Put(doc CrawledDocument) error {
	key := doc.Locator.ID + ":" + time.Now().Format("20060201")
	err := c.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(BBOLT_CRAWL_BUCKET_NAME)
		j, err := doc.ToJSON()
		if err != nil {
			return err
		}

		err = b.Put([]byte(key), j)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("crawl repo: Failed to update data: %s", err)
	}

	return nil
}

func (c BBoltCrawlRepository) List(next string, pageSize int) ([]CrawledDocument, error) {
	var pages []CrawledDocument

	if pageSize == 0 {
		pageSize = 100
	}

	err := c.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BBOLT_CRAWL_BUCKET_NAME)
		cursor := b.Cursor()
		cursor.Seek([]byte(next))

		for {
			key, val := cursor.Next()
			if key == nil {
				break
			}
			doc, err := CrawledDocumentFromBytes(val)
			if err != nil {
				return fmt.Errorf("crawl repo: Failed parse doc data: %s", err)
			}
			pages = append(pages, doc)

			if pageSize == 0 {
				return nil
			}
		}

		return nil
	})

	if err != nil {
		return pages, fmt.Errorf("crawl repo: Failed to update data: %s", err)
	}

	return pages, nil
}

func (c InMemoryCrawlRepository) Get(locator Locator) (*CrawledDocument, error) {
	key := locator.ID + ":" + time.Now().Format("20060201")
	if data, found := c.data[key]; found {
		doc, err := CrawledDocumentFromBytes(data)
		if err != nil {
			panic(err)
		}
		return &doc, nil
	}

	return nil, nil
}

func (c InMemoryCrawlRepository) Put(doc CrawledDocument) error {
	key := doc.Locator.ID + ":" + time.Now().Format("20060201")
	j, err := doc.ToJSON()
	if err != nil {
		panic(err)
	}
	c.data[key] = j

	return nil
}

func MustNewCrawlRepository() CrawlRepository {
	return InMemoryCrawlRepository{
		data: map[string][]byte{},
	}
}
