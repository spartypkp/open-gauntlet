# Level 4: Visibility Timeout

Add visibility timeout so jobs become invisible during processing and automatically return to the queue if not completed in time.

## Changes

### `dequeue(visibility_timeout=None)` (updated)
Now accepts an optional visibility timeout in seconds. When set, the job becomes invisible to other consumers for `visibility_timeout` seconds. If not completed within that time, it automatically returns to pending.

## New Operations

### `check_timeouts(current_timestamp)`
Check all running jobs with visibility timeouts. Any job whose timeout has expired (current_timestamp >= dequeue_time + visibility_timeout) is moved back to pending. Return a list of job_ids that were timed out.

### `extend_visibility(job_id, additional_seconds)`
Extend the visibility timeout for a running job. Return `True` if extended. Return `False` if the job is not running or has no visibility timeout.

### `get_running_jobs()`
Return a list of `[job_id, time_remaining]` for all running jobs, sorted by job_id. `time_remaining` is how many seconds until visibility timeout expires (or `None` if no timeout). For computing time_remaining, use the most recent `check_timeouts` timestamp as "now".

## Important

- Visibility timeout is per-dequeue, not per-job
- A job that times out goes back to pending with its original priority
- Timeout check is lazy: only happens when `check_timeouts` is called
- The "dequeue time" for a job is the most recent `check_timeouts` timestamp at the moment `dequeue()` is called (starts at 0 if `check_timeouts` has never been called)
- A job without visibility timeout runs indefinitely until completed or failed
- When a timed-out job is re-dequeued, it can have a new visibility timeout

## Examples

```
queue.enqueue("job", {"task": "email"})
queue.dequeue(visibility_timeout=30)        # returns "job", invisible for 30s
queue.check_timeouts(35)                    # returns ["job"] (timed out)
queue.get_status("job")                     # returns "pending" (back in queue)
queue.dequeue(visibility_timeout=60)        # returns "job" again
queue.extend_visibility("job", 30)          # returns True (now 90s total)
queue.complete("job")                       # returns True
```
