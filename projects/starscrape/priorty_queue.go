// Package pq implements a priority queue data structure on top of container/heap.
// As an addition to regular operations, it allows an update of an items priority,
// allowing the queue to be used in graph search algorithms like Dijkstra's algorithm.
// Computational complexities of operations are mainly determined by container/heap.
// In addition, a map of items is maintained, allowing O(1) lookup needed for priority updates,
// which themselves are O(log n).
package main

import (
	"container/heap"
	"errors"
	"sync"
)

type PriorityQueue interface {
	Insert(v any, priority float64)
	Len() int
	Pop() (any, error)
	UpdatePriority(x interface{}, newPriority float64)
}

// PriorityQueue represents the queue
type priorityQueue struct {
	itemHeap *itemHeap
	lookup   map[interface{}]*item
	mu       *sync.Mutex
}

// New initializes an empty priority queue.
func MustNewPriorityQueueNew() PriorityQueue {
	return &priorityQueue{
		itemHeap: &itemHeap{},
		lookup:   make(map[interface{}]*item),
		mu:       &sync.Mutex{},
	}
}

// Len returns the number of elements in the queue.
func (p *priorityQueue) Len() int {
	return p.itemHeap.Len()
}

// Insert inserts a new element into the queue. No action is performed on duplicate elements.
func (p *priorityQueue) Insert(v interface{}, priority float64) {
	p.mu.Lock()
	defer p.mu.Unlock()
	_, ok := p.lookup[v]
	if ok {
		return
	}

	newItem := &item{
		value:    v,
		priority: priority,
	}
	heap.Push(p.itemHeap, newItem)
	p.lookup[v] = newItem
}

var ErrEmptyQueue = errors.New("empty queue")

// Pop removes the element with the highest priority from the queue and returns it.
// In case of an empty queue, an error is returned.
func (p *priorityQueue) Pop() (interface{}, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if len(*p.itemHeap) == 0 {
		return nil, ErrEmptyQueue
	}

	item := heap.Pop(p.itemHeap).(*item)
	delete(p.lookup, item.value)
	return item.value, nil
}

// UpdatePriority changes the priority of a given item.
// If the specified item is not present in the queue, no action is performed.
func (p *priorityQueue) UpdatePriority(x interface{}, newPriority float64) {
	item, ok := p.lookup[x]
	if !ok {
		return
	}

	item.priority = newPriority
	heap.Fix(p.itemHeap, item.index)
}

type itemHeap []*item

type item struct {
	value    interface{}
	priority float64
	index    int
}

func (ih *itemHeap) Len() int {
	return len(*ih)
}

func (ih *itemHeap) Less(i, j int) bool {
	return (*ih)[i].priority < (*ih)[j].priority
}

func (ih *itemHeap) Swap(i, j int) {
	(*ih)[i], (*ih)[j] = (*ih)[j], (*ih)[i]
	(*ih)[i].index = i
	(*ih)[j].index = j
}

func (ih *itemHeap) Push(x interface{}) {
	it := x.(*item)
	it.index = len(*ih)
	*ih = append(*ih, it)
}

func (ih *itemHeap) Pop() interface{} {
	old := *ih
	item := old[len(old)-1]
	*ih = old[0 : len(old)-1]
	return item
}
