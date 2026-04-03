# Level 3: TTL + Expiry

Add time-to-live (TTL) support. Values can now expire automatically after a specified duration.

## Changes

### `set(key, value, timestamp, ttl=None)`
Now accepts an optional `ttl` parameter (in timestamp units). When set, the value expires at `timestamp + ttl` (exclusive). A value with `ttl=None` never expires.

### `get(key, timestamp)` (updated behavior)
Must now skip expired entries. Find the most recent non-expired entry with timestamp <= query timestamp. An entry is alive if `ttl is None` or `query_timestamp < entry_timestamp + ttl`.

### `purge_expired(timestamp)`
Remove all entries across all keys that have expired by the given timestamp. Return the count of entries removed.

## Examples

```
store.set("a", "fresh", timestamp=5, ttl=10)
store.get("a", timestamp=10)   # returns "fresh" (10 < 5 + 10 = 15)
store.get("a", timestamp=15)   # returns None (15 >= 15, expired)
store.get("a", timestamp=14)   # returns "fresh" (14 < 15)
```

## Important

- **This is a data model change.** Entries previously lived forever. Now each entry can carry a TTL, and every read operation must filter out expired entries. Your storage model needs to track TTL per entry.
- The expiry boundary is **exclusive**: alive when `query_ts < entry_ts + ttl`
- All existing operations (`get_range`, `keys_at`, `latest_keys`) must respect TTL
- `delete` still removes by exact timestamp regardless of TTL
