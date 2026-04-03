# Level 1: Versioned Storage

Implement a key-value store where each value is stored with a timestamp. The same key can have multiple values at different timestamps.

## Operations

### `set(key, value, timestamp)`
Store the value for the given key at the given timestamp. If an entry already exists at that exact key+timestamp, overwrite it.

### `get(key, timestamp)`
Return the value for the key with the largest timestamp that is less than or equal to the query timestamp. If no such entry exists, return `None`.

### `delete(key, timestamp)`
Remove the entry for the key at the exact given timestamp. Return `True` if an entry was removed, `False` if no entry existed at that exact timestamp.

## Examples

```
store = TemporalKVStore()
store.set("a", 1, timestamp=1)
store.set("a", 2, timestamp=3)
store.get("a", timestamp=2)  # returns 1 (latest ts <= 2)
store.get("a", timestamp=3)  # returns 2
store.get("a", timestamp=0)  # returns None (no ts <= 0)
store.delete("a", timestamp=1)  # returns True
store.get("a", timestamp=2)  # returns None (ts=1 entry deleted)
```

## Hints

- Think about how to efficiently find "the largest timestamp <= X" in a sorted list.
- Consider what data structure lets you store multiple (timestamp, value) pairs per key.
