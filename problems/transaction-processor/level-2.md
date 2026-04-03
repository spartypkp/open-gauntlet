# Level 2: Top Spenders

Add a ranking operation to identify which accounts have sent the most money.

## New Operation

### `top_spenders(n)`
Return the top `n` accounts ranked by total outgoing transfer volume (sum of all successful outbound `transfer` calls), in descending order.

Return format: a list of strings, each in the format `"accountId(amount)"` where amount is formatted as an integer (no decimal point), e.g., `"alice(400)"` not `"alice(400.0)"`.

Ties broken alphabetically by `account_id` (ascending).

If fewer than `n` accounts exist, return all of them.

## Examples

```
proc = TransactionProcessor()
proc.create_account("alice", 1000)
proc.create_account("bob", 500)
proc.create_account("carol", 200)
proc.transfer("alice", "bob", 300)    # alice spent 300
proc.transfer("alice", "carol", 100)  # alice spent 400 total
proc.transfer("bob", "carol", 200)    # bob spent 200 total
proc.top_spenders(2)                  # ["alice(400)", "bob(200)"]
proc.top_spenders(1)                  # ["alice(400)"]
```

## Constraints

- Only successful `transfer` calls count toward spending
- Failed transfers (insufficient funds or missing accounts) are not counted
- `deposit` does not count as spending
- Accounts with zero spending are included if `n` allows
