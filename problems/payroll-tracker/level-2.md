# Level 2: Top Workers

Add a ranking operation to find the workers who have spent the most time in the office.

## New Operation

### `top_workers(n)`
Return the top `n` workers by total time worked, in descending order. If fewer than `n` workers exist, return all of them.

Return format: a list of strings, each in the format `"workerId(totalTime)"`.

Ties broken alphabetically by `worker_id` (ascending).

## Examples

```
tracker = PayrollTracker()
tracker.add_worker("alice", "engineer", 100)
tracker.add_worker("bob", "analyst", 80)
tracker.register("alice", 1)    # entry
tracker.register("alice", 10)   # exit (alice: 9 hours)
tracker.register("bob", 2)      # entry
tracker.register("bob", 5)      # exit (bob: 3 hours)
tracker.top_workers(2)          # ["alice(9)", "bob(3)"]
tracker.top_workers(1)          # ["alice(9)"]
```

## Constraints

- A worker who is currently in the office (mid-shift) contributes only their completed intervals to `top_workers` ranking
- Workers with zero completed hours still appear in results
- If `n` exceeds the total number of workers, return all workers
