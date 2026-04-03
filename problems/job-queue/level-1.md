# Level 1: Basic FIFO Queue

Implement a first-in-first-out job queue with basic lifecycle management.

## Operations

### `enqueue(job_id, payload)`
Add a job to the queue. Return `True` if added. Return `False` if the job_id exists in any state (pending, running, completed, failed).

### `dequeue()`
Remove and return the oldest pending job_id, marking it as running. Return `None` if no pending jobs exist.

### `complete(job_id)`
Mark a running job as completed. Return `True` if successful. Return `False` if the job is not in running state.

### `fail(job_id)`
Mark a running job as failed. Return `True` if successful. Return `False` if the job is not in running state.

### `get_status(job_id)`
Return the job's status: `"pending"`, `"running"`, `"completed"`, `"failed"`, or `"not_found"`.

## Examples

```
queue = JobQueue()
queue.enqueue("job1", {"task": "send_email"})   # returns True
queue.enqueue("job2", {"task": "resize_image"}) # returns True
queue.dequeue()                                  # returns "job1"
queue.get_status("job1")                         # returns "running"
queue.complete("job1")                           # returns True
queue.get_status("job1")                         # returns "completed"
queue.dequeue()                                  # returns "job2"
queue.fail("job2")                               # returns True
```

## Constraints

- Job IDs are unique across all states
- FIFO ordering: first enqueued is first dequeued
- Only running jobs can be completed or failed
