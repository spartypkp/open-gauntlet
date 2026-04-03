# Event Store

Build an event sourcing system that maintains append-only event logs and derives state through event replay.

This problem models the event sourcing pattern used in CQRS architectures, audit logging systems, and distributed state management. You'll implement event streams with state projection, snapshots, and cross-stream aggregation.

## What You're Building

A class called `EventStore` that starts with a basic append-only event log and progressively adds version-aware queries, snapshot optimization, and cross-stream aggregation.

## Levels

1. **Event Log** -- Append events to streams, replay to derive current state
2. **Version-Aware Queries** -- Query events and state at specific versions
3. **Snapshots** -- Cache computed state for efficient replay
4. **Cross-Stream Aggregation** -- Aggregate state across multiple streams
