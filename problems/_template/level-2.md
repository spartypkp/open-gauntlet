# Level 2: Range Queries

Extend your temporal key-value store with query operations that work across time ranges.

## New Operations

### `get_range(key, start_ts, end_ts)`
Return all `[timestamp, value]` pairs for the key where `start_ts <= timestamp <= end_ts`, sorted by timestamp ascending.

### `keys_at(timestamp)`
Return a sorted list of all keys that have at least one entry with timestamp less than or equal to the given timestamp.

### `latest_keys(n)`
Return the N keys with the most recent writes (by their latest timestamp), each paired with their latest value. Return as a list of `[key, value]` pairs, sorted by timestamp descending.

## Examples

```
store.set("a", 1, timestamp=1)
store.set("a", 2, timestamp=3)
store.set("b", 10, timestamp=2)
store.get_range("a", 1, 5)       # returns [[1, 1], [3, 2]]
store.keys_at(2)                  # returns ["a", "b"]
store.latest_keys(2)              # returns [["a", 2], ["b", 10]]
```
