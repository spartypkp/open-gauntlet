# Level 3: Retry + Dead Letter Queue

Add retry logic with exponential backoff for failed jobs. Jobs that exhaust their retries go to a dead letter queue.

## Changes

### `fail(job_id)` (updated behavior)
Now increments the attempt count and schedules a retry instead of immediately marking as failed. After `max_attempts` total attempts, move to dead letter queue instead.

## New Operations

### `configure(max_attempts=3, base_backoff_seconds=5)`
Set retry parameters. Applies to all future failures.

### `process_retries(current_timestamp)`
Move all jobs whose retry time has arrived back to pending. Return a sorted list of job_ids that were moved (alphabetical order).

### `get_dead_letter()`
Return a list of `[job_id, attempts]` for all jobs in the dead letter queue, sorted by job_id.

## Important

- **This is a data model change.** `fail()` previously set status to "failed" and was done. Now it must track attempt count, compute next retry time, and conditionally move to dead letter.
- `fail()` still returns `True` when a job moves to the dead letter queue (the fail operation succeeded on a running job).
- `get_status` now has two additional return values: `"retrying"` for jobs awaiting retry, and `"dead_letter"` for jobs that exhausted all attempts.
- Backoff formula: `base_backoff_seconds * 2^(attempts - 1)` where attempts is the count AFTER the current failure. Retry times accumulate: after the first failure (attempts=1), retry at `t = base_backoff`. After the second failure (attempts=2), retry at `t = base_backoff + base_backoff * 2`. And so on.
- `dequeue()` must NOT return retrying jobs
- Retried jobs keep their original priority
- Default max_attempts is 3, default base_backoff_seconds is 5

## Examples

```
queue.configure(max_attempts=2, base_backoff_seconds=10)
queue.enqueue("job", {"task": "email"})
queue.dequeue()                     # returns "job"
queue.fail("job")                   # attempt 1, retrying (retry at t=10)
queue.process_retries(10)           # returns ["job"]
queue.dequeue()                     # returns "job" (attempt 2)
queue.fail("job")                   # attempt 2, dead letter (max reached)
queue.get_dead_letter()             # returns [["job", 2]]
```
