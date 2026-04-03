# Temporal Key-Value Store

Build a key-value store where every value is associated with a timestamp. The store supports versioned storage, meaning the same key can hold different values at different points in time.

This problem models time-series data storage, a pattern common in databases, caches, and event sourcing systems.

## What You're Building

A class called `TemporalKVStore` that starts with basic timestamped set/get operations and progressively adds range queries, TTL-based expiration, and snapshot/restore capabilities.

## Levels

1. **Versioned Storage** -- Basic set, get, and delete with timestamps
2. **Range Queries** -- Query across time ranges and find keys
3. **TTL + Expiry** -- Values that automatically expire after a duration
4. **Snapshots** -- Save and restore the store's state
