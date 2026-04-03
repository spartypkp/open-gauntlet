# Level 3: Scheduled Payments

Add support for future payments that execute automatically. The critical mechanic: **there is no explicit `process_payments` call — payments fire lazily at the start of every subsequent timestamped operation.**

## Signature Changes

`deposit` and `transfer` now accept an optional `timestamp` parameter as their last argument. **You must default it** (e.g. `timestamp=None`) so that L1/L2 tests which don't pass a timestamp continue to work. Hidden tests re-run all previous levels.

```
def deposit(self, account_id, amount, timestamp=None):
def transfer(self, from_id, to_id, amount, timestamp=None):
```

## New Operations

### `schedule_payment(from_id, to_id, amount, scheduled_at)`
Schedule a transfer of `amount` from `from_id` to `to_id` that executes at timestamp `scheduled_at`. Return a unique payment ID (e.g. `"payment_0"`, `"payment_1"`). Return `None` if either account doesn't exist.

### `cancel_payment(payment_id)`
Cancel a pending payment before it fires. Return `True` if cancelled. Return `False` if the ID doesn't exist or the payment already executed.

## Lazy Execution (The Hard Part)

Before executing any timestamped operation (`deposit`, `transfer`), process all scheduled payments with `scheduled_at <= current_timestamp` in chronological order (earliest first). Ties in `scheduled_at` fire in the order they were scheduled.

**When a payment fires:**
- If `from_id` has sufficient funds: debit `amount`, credit `to_id`, mark payment executed.
- If insufficient funds: skip the payment (mark as failed, does not retry).

```
proc.create_account("alice", 1000)
proc.create_account("bob", 0)
proc.schedule_payment("alice", "bob", 200, 10)   # fires at t=10
proc.deposit("alice", 100, 5)                    # t=5: nothing due yet; alice=1100
proc.deposit("alice", 50, 12)                    # t=12: payment fires first (alice=900, bob=200), then deposit (alice=950)
proc.get_balance("alice")                        # 950
proc.get_balance("bob")                          # 200
```

## Important

- All timestamps across operations are strictly increasing.
- Cancelled payments never fire even if their `scheduled_at` arrives.
- Multiple payments at the same `scheduled_at` fire in the order they were scheduled.
- A payment that fires and fails (insufficient funds) is **not** cancelled — it just didn't execute. It will not retry.

## Examples

```
# Cancellation prevents firing
pid = proc.schedule_payment("alice", "bob", 500, 10)
proc.cancel_payment(pid)
proc.deposit("alice", 1, 15)   # t=15: payment already cancelled, doesn't fire
proc.get_balance("alice")      # 1001 (just the deposit, payment never ran)

# Insufficient funds: payment skipped, later payments still run
proc.create_account("charlie", 50)
proc.create_account("dave", 0)
proc.schedule_payment("charlie", "dave", 200, 10)  # charlie can't afford this
proc.schedule_payment("charlie", "dave", 30, 10)   # charlie can afford this
proc.deposit("charlie", 0, 15)  # t=15: first payment fires, skipped; second fires, succeeds
proc.get_balance("charlie")     # 20 (50 - 30)
proc.get_balance("dave")        # 30
```
