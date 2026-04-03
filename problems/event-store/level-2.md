# Level 2: Version-Aware Queries

Add the ability to query events and state at specific version points.

## New Operations

### `get_events_from(stream_id, from_position)`
Return all events at or after the given position. Return an empty list if the stream doesn't exist or the position is beyond the end.

### `get_state_at(stream_id, version)`
Reduce events up to and including the given position (version) to compute state at that point. Return an empty dict if the stream doesn't exist. Return the state of all events if version exceeds the event count.

### `count_events(stream_id)`
Return the total number of events in the stream. Return `0` if the stream doesn't exist.

### `get_event(stream_id, position)`
Return a single event dict at the given position. Return `None` if the stream doesn't exist or the position is out of range.

## Examples

```
store.append("s1", "created", {"name": "Alice"})    # position 0
store.append("s1", "updated", {"name": "Bob"})      # position 1
store.append("s1", "updated", {"name": "Charlie"})  # position 2
store.get_state_at("s1", 1)     # returns {"name": "Bob"}
store.get_events_from("s1", 2)  # returns [{"position": 2, "event_type": "updated", "data": {"name": "Charlie"}}]
store.count_events("s1")        # returns 3
```
