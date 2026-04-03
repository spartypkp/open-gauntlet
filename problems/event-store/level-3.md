# Level 3: Snapshots

Add snapshot support so that state computation doesn't need to replay all events from the beginning every time.

## New Operations

### `create_snapshot(stream_id)`
Compute the current state and save it as a snapshot at the current version (latest event position). Return the version number of the snapshot. Return `None` if the stream doesn't exist.

### `get_current_state(stream_id)` (updated behavior)
Now uses the most recent snapshot as a starting point and only replays events after it. The result should be identical to replaying all events, but more efficient.

### `get_state_at(stream_id, version)` (updated behavior)
If a snapshot exists at or before the requested version, use it as the starting point instead of replaying from position 0.

## Important

- **This is an optimization that changes HOW state is computed, not WHAT state is returned.** All return values must be identical to replaying from scratch.
- Snapshots store `{version: N, state: {...}}` where version is the position of the latest event at snapshot time
- Multiple snapshots can exist per stream (at different versions)
- `create_snapshot` on a non-existent stream (no events appended) returns `None`
- Events appended after a snapshot exist but aren't included in it (that's the point, replay from snapshot forward)

## Examples

```
store.append("s1", "init", {"a": 1})        # position 0
store.append("s1", "update", {"b": 2})       # position 1
store.create_snapshot("s1")                   # returns 1
store.append("s1", "update", {"c": 3})       # position 2
store.get_current_state("s1")                 # returns {"a": 1, "b": 2, "c": 3}
# (internally: loaded snapshot at v1 -> {"a": 1, "b": 2}, then replayed position 2)
```
