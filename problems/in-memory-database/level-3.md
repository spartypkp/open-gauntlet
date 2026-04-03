# Level 3: TTL Expiration

Add timestamp-aware variants of all operations. Fields can now have a time-to-live (TTL) that causes them to expire.

## New Operations

### `set_at(key, field, value, timestamp)`
Same as `set`, but records the write at `timestamp`. No expiration -- the field lives forever unless deleted.

### `set_at_with_ttl(key, field, value, timestamp, ttl)`
Set a field that expires. The field is valid for `[timestamp, timestamp + ttl)`. At `timestamp + ttl` and beyond, the field is treated as non-existent.

### `get_at(key, field, timestamp)`
Same as `get` but respects expiration: return `None` if the field has expired by `timestamp`.

### `delete_at(key, field, timestamp)`
Same as `delete` but timestamp-aware. An expired field is treated as non-existent -- returns `False`.

### `scan_at(key, timestamp)`
Same as `scan` but only includes fields that haven't expired at `timestamp`.

### `scan_by_prefix_at(key, prefix, timestamp)`
Same as `scan_by_prefix` but respects TTL.

## TTL Rules

- Validity interval is **exclusive on the right**: `[timestamp, timestamp + ttl)`. At exactly `t = timestamp + ttl`, the field is **expired**.
- A field set with `set_at` (no TTL) never expires.
- Overwriting an expired field with `set_at` or `set_at_with_ttl` creates a fresh entry -- treat as a new write.
- `delete_at` on an expired field returns `False` (expired fields are non-existent).

## Examples

```
db = InMemoryDatabase()
db.set_at_with_ttl("A", "B", "val", timestamp=1, ttl=10)   # expires at t=11
db.get_at("A", "B", timestamp=5)    # "val" (within TTL)
db.get_at("A", "B", timestamp=11)   # "" (expired)
db.set_at("A", "C", "perm", timestamp=1)
db.get_at("A", "C", timestamp=100)  # "perm" (never expires)
```

## Constraints

- Timestamps are positive integers and arrive in strictly increasing order
- All previous Level 1 and 2 operations must still work
