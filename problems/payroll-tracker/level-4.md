# Level 4: Double Pay Periods

Add designated time ranges where all work is compensated at 2× the normal rate. Update `get_salary` to account for these periods.

## New Operation

### `set_double_paid(start_ts, end_ts)`
Designate the range `[start_ts, end_ts]` as a double-pay period. Any work performed within this range is compensated at 2× the worker's current rate.

Returns `None`.

**Important:** Double-pay periods may overlap, but work is never paid more than 2×, even if multiple periods cover the same time. Overlapping periods do NOT stack.

## Updated `get_salary`

Salary computation now intersects the worker's in-office intervals with double-pay periods:
- Time worked **inside** a double-pay period: `hours × rate × 2`
- Time worked **outside** double-pay periods: `hours × rate`

## Examples

```
tracker = PayrollTracker()
tracker.add_worker("alice", "engineer", 100)
tracker.set_double_paid(5, 10)
tracker.register("alice", 1)    # entry
tracker.register("alice", 15)   # exit (14 hours total)
tracker.get_salary("alice", 0, 20)
# 1-5:   4 hours × 100 = 400
# 5-10:  5 hours × 200 = 1000  (double pay)
# 10-15: 5 hours × 100 = 500
# Total = 1900

# Overlapping double-pay periods (no stacking):
tracker.set_double_paid(5, 15)
tracker.set_double_paid(10, 20)
# Effective double-pay range: [5, 20] (merged, still 2x, not 4x)
```

## Constraints

- Double-pay periods are global (apply to all workers)
- Overlapping periods are merged — work is always at most 2× rate
- Double-pay periods can be set at any time (before or after workers register)
