# Level 4: Account Merge + Historical Balance

Add the ability to merge two accounts together and query what any account's balance was at any past timestamp. This level requires you to have been recording a full transaction history throughout L1-L3.

## New Operations

### `merge_accounts(account_id1, account_id2)`
Merge `account_id2` into `account_id1`. After the merge:
- `account_id1` balance increases by `account_id2`'s current balance.
- `account_id2` ceases to exist (all future operations on it return `None`).
- `account_id2`'s transaction history is absorbed into `account_id1`'s history (for `get_balance_at` purposes).
- Any pending scheduled payments where `account_id2` is the `from_id` are cancelled. Payments where `account_id2` is the `to_id` are redirected to `account_id1`.

Return `True` on success. Return `None` if either account doesn't exist. Return `False` if both IDs are the same.

### `get_balance_at(account_id, time_at)`
Return the balance of `account_id` at the given past timestamp `time_at`. Reconstruct from transaction history: sum all transactions that occurred at or before `time_at`.

Return `None` if the account has never existed (including accounts that were merged away). If querying a merged account's history before the merge timestamp, return the balance it had at that time. If querying after the merge timestamp, the account no longer exists — return `None`.

## Important

- **This level requires transaction logging from L1-L3.** Every deposit, withdrawal, and transfer must have been recorded with its timestamp. If L3 scheduled payments weren't recorded with their execution timestamp, `get_balance_at` will be wrong.
- `get_balance_at` returns the balance at exactly `time_at` — include all transactions with `timestamp <= time_at`.
- Merging does not create a transaction history entry by itself. `account_id1`'s balance just gains `account_id2`'s current balance atomically.
- Initial balance (from `create_account`) counts as a transaction at timestamp 0 (or the earliest possible time) for `get_balance_at` purposes.

## Examples

```
proc.create_account("alice", 1000)
proc.create_account("bob", 500)
proc.deposit("alice", 200, 5)         # alice=1200 at t=5
proc.deposit("bob", 100, 8)           # bob=600 at t=8

proc.get_balance_at("alice", 3)       # 1000 (before deposit)
proc.get_balance_at("alice", 5)       # 1200 (after deposit at t=5)

proc.merge_accounts("alice", "bob")   # alice=1800, bob ceases to exist
proc.get_balance("alice")             # 1800
proc.get_balance("bob")               # None

proc.get_balance_at("bob", 8)         # 600 (bob existed at t=8, before merge)
```

## Constraints

- `get_balance_at` with `time_at` before any transaction (negative timestamp) returns `None`.
- Merging two accounts with pending scheduled payments: from-payments on `account_id2` are cancelled, to-payments on `account_id2` redirect to `account_id1`.
