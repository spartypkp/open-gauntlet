# Level 1: Worker Registration & Time Tracking

Implement a system that tracks when workers enter and leave the office and computes their total time worked.

## Operations

### `add_worker(worker_id, position, compensation)`
Register a new worker with a position (string) and hourly compensation rate (integer). Return `True` if added, `False` if a worker with that ID already exists.

### `register(worker_id, timestamp)`
Record an entry or exit event for the worker. Events alternate: first call = entry, second = exit, third = entry, and so on. All timestamps are strictly increasing.

Return `"registered"` on success. Return `None` if the worker doesn't exist.

### `get_total(worker_id)`
Return the worker's total time in the office as an integer (sum of all completed entry/exit intervals). An interval is only counted once the worker has exited.

Return `None` if the worker doesn't exist.

## Examples

```
tracker = PayrollTracker()
tracker.add_worker("alice", "engineer", 100)  # True
tracker.add_worker("alice", "analyst", 80)    # False (already exists)
tracker.register("alice", 9)                  # "registered" (entry at t=9)
tracker.register("alice", 17)                 # "registered" (exit at t=17)
tracker.get_total("alice")                    # 8 (17-9=8 hours)
tracker.register("alice", 20)                 # "registered" (entry at t=20)
tracker.get_total("alice")                    # 8 (mid-shift, incomplete interval)
tracker.register("alice", 22)                 # "registered" (exit at t=22)
tracker.get_total("alice")                    # 10 (8 + 2)
```

## Constraints

- Worker IDs are unique strings
- Timestamps are strictly increasing integers across all operations
- A worker who is currently in the office (entered but not yet exited) does not have their current interval counted in `get_total` until they exit
