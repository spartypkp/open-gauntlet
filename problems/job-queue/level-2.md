# Level 2: Priority Queues

Add priority ordering to the job queue.

## Changes

### `enqueue(job_id, payload, priority=0)` (updated)
Now accepts an optional priority (higher number = higher priority). FIFO ordering within the same priority level.

## New Operations

### `peek(n=1)`
Return the next N job_ids that would be dequeued (in priority/FIFO order), without actually dequeuing them.

### `queue_length()`
Return the count of pending jobs.

### `get_failed_jobs()`
Return a sorted list of all failed job_ids.

## Examples

```
queue.enqueue("low", {}, priority=1)
queue.enqueue("high", {}, priority=10)
queue.enqueue("med", {}, priority=5)
queue.peek(2)          # returns ["high", "med"]
queue.dequeue()        # returns "high"
queue.queue_length()   # returns 2
```

## Constraints

- Priority is a non-negative integer (default 0)
- Higher priority number = dequeued first
- FIFO within same priority level
