# Level 1: Event Log

Implement an append-only event log with state projection. Events are appended to named streams and state is derived by replaying events in order.

## Operations

### `append(stream_id, event_type, data)`
Append an event to the stream. Auto-assign a 0-indexed position within the stream. Return the position number. Auto-create the stream if it doesn't exist.

### `get_events(stream_id)`
Return all events in the stream as a list of dicts: `{"position": N, "event_type": "...", "data": {...}}`, ordered by position. Return an empty list if the stream doesn't exist.

### `get_current_state(stream_id)`
Reduce all events to current state by merging data dicts in order (last write wins for each key). Return an empty dict if the stream doesn't exist.

### `list_streams()`
Return a sorted list of all stream IDs.

## Examples

```
store = EventStore()
store.append("user-1", "created", {"name": "Alice"})       # returns 0
store.append("user-1", "updated", {"email": "a@test.com"})  # returns 1
store.append("user-1", "updated", {"name": "Alice Smith"})  # returns 2
store.get_current_state("user-1")  # returns {"name": "Alice Smith", "email": "a@test.com"}
store.list_streams()               # returns ["user-1"]
```

## Constraints

- Events are immutable once appended (no editing or deleting)
- State is derived by merging data dicts in order: start with `{}`, then `state.update(event.data)` for each event
- Positions are 0-indexed and sequential within each stream
