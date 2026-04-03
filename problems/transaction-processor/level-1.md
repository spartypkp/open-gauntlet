# Level 1: Core Account Operations

Build a `TransactionProcessor` class that manages bank accounts.

## Operations

### `create_account(account_id, initial_balance=0)`
Create a new account with the given ID and starting balance. Return `True` if created successfully. Return `False` if an account with that ID already exists.

### `deposit(account_id, amount)`
Add `amount` to the account's balance. Return the new balance as a float. Return `None` if the account doesn't exist.

### `transfer(from_id, to_id, amount)`
Move `amount` from `from_id` to `to_id`. Return `True` if successful. Return `None` if either account doesn't exist. Return `False` if `from_id` has insufficient funds.

### `get_balance(account_id)`
Return the current balance as a float. Return `None` if the account doesn't exist.

## Examples

```
proc = TransactionProcessor()
proc.create_account("alice", 1000)    # True
proc.create_account("bob", 0)         # True
proc.deposit("alice", 200)            # 1200.0
proc.transfer("alice", "bob", 500)    # True
proc.get_balance("alice")             # 700.0
proc.get_balance("bob")               # 500.0
```

## Constraints

- `initial_balance` defaults to 0 if not provided
- Transfers are atomic: if a transfer fails, neither balance changes
- Amounts are always non-negative
