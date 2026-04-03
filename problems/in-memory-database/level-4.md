# Level 4: Backup and Restore

Add snapshot capabilities: save database state at a point in time and restore to a prior snapshot.

## New Operations

### `backup(timestamp)`
Save the current database state as a snapshot keyed to `timestamp`. Only non-expired records and fields are included.

Returns the count of **non-empty records** at the time of backup (records where at least one field is non-expired).

TTL storage: the snapshot captures each field's **remaining TTL** (`expiry - timestamp`), not the absolute expiry. Permanent fields (set with `set_at`) remain permanent.

### `restore(timestamp, timestamp_to_restore)`
Restore the database to the state from the **most recent backup at or before** `timestamp_to_restore`. The current time after restore is `timestamp` (the first argument).

After restore, all state written after the target backup is discarded.

TTL recalculation: for each field restored, new expiry = `timestamp + remaining_ttl` (using the remaining TTL stored at backup time). Permanent fields stay permanent.

Returns `None`.

## Backup/Restore Semantics

```
# t=1: set_at_with_ttl("A", "x", "1", 1, 10)   → expiry=11
# t=5: backup(5)    → remaining_ttl of "x" = 11-5 = 6; returns 1
# t=6: set_at("A", "y", "2", 6)                 → new field "y"
# t=7: restore(7, 5)                             → restores backup at t=5
#      "x" new expiry = 7+6 = 13
#      "y" is gone (written after backup at t=5)
# get_at("A", "x", 12)   → "1"   (valid, expiry 13)
# get_at("A", "x", 13)   → None  (expired)
# get_at("A", "y", 7)    → None  (discarded by restore)
```

## Constraints

- Multiple backups can exist; `restore` always picks the **most recent backup at or before** `timestamp_to_restore`
- If no backup exists at or before `timestamp_to_restore`, behavior is undefined (won't be tested)
- Timestamps are strictly increasing
