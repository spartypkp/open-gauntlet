# Level 4: Cross-Stream Aggregation

Add the ability to aggregate state across multiple event streams.

## New Operations

### `create_aggregate(name, stream_ids)`
Create a named aggregate that combines state from multiple streams. Return `True` if created. Return `False` if an aggregate with this name already exists. Stream IDs don't need to exist yet (they can be created later).

### `get_aggregate(name)`
Return the merged state from all contributing streams. Merge order is alphabetical by stream_id (streams later in alphabetical order overwrite earlier ones for the same key). Return `None` if the name doesn't exist.

### `get_event_count_by_type(event_type)`
Return the total count of events with the given type across ALL streams.

### `replay_from(stream_id, from_position)`
Re-emit all events from the given position onward. Return the list of re-emitted events. Return `None` if the stream doesn't exist.

## Examples

```
store.append("user-1", "created", {"name": "Alice", "role": "user"})
store.append("user-2", "created", {"name": "Bob", "role": "admin"})
store.create_aggregate("all-users", ["user-1", "user-2"])
store.get_aggregate("all-users")  # returns {"name": "Bob", "role": "admin"} (user-2 overwrites user-1)
store.get_event_count_by_type("created")  # returns 2
```

## Important

- Aggregates are computed on read (not cached), so they always reflect the latest state of contributing streams
- If a contributing stream doesn't exist yet, it contributes an empty state `{}`
- Merge order is alphabetical by stream_id to ensure deterministic results
- `replay_from` returns events but does not modify anything
