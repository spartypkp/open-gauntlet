# Level 3: Promotion & Salary Calculation

Add promotions (which change a worker's compensation rate) and salary computation for arbitrary time windows.

## New Operations

### `promote(worker_id, timestamp, position, compensation)`
Promote a worker to a new position with a new hourly compensation rate. The new rate applies starting at exactly `timestamp` (inclusive). Time before `timestamp` uses the previous rate.

Return `True` on success. Return `None` if the worker doesn't exist.

### `get_salary(worker_id, start_ts, end_ts)`
Compute the total salary earned by a worker during `[start_ts, end_ts]` (inclusive on both ends).

Salary is the sum over all in-office intervals of: `(time worked in interval ∩ [start_ts, end_ts]) × (compensation rate at that time)`.

When a promotion occurs mid-period, apply the appropriate rate to each portion.

Return the salary as an integer. Return `None` if the worker doesn't exist.

## Examples

```
tracker = PayrollTracker()
tracker.add_worker("alice", "engineer", 100)
tracker.register("alice", 1)     # entry
tracker.register("alice", 10)    # exit (9 hours at rate 100)
tracker.promote("alice", 12, "senior_engineer", 200)
tracker.register("alice", 14)    # entry
tracker.register("alice", 20)    # exit (6 hours at rate 200)
tracker.get_salary("alice", 0, 25)  # 2100 (9*100 + 6*200 = 900 + 1200 = 2100)

# Salary for a sub-window:
tracker.get_salary("alice", 5, 8)   # 300 (3 hours in [5,8] at rate 100)
```

## Constraints

- Promotions are always in chronological order
- `get_salary` must correctly handle windows that span multiple rate changes
- The initial compensation set in `add_worker` is the first rate (from t=0)
