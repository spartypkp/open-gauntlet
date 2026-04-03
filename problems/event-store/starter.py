class EventStore:
    """An append-only event log with state projection.

    Events are appended to named streams. Current state is derived
    by replaying events in order (last write wins per key).
    """

    def __init__(self):
        pass

    def append(self, stream_id: str, event_type: str, data: dict) -> int:
        """Append an event to a stream. Returns the 0-indexed position."""
        pass

    def get_events(self, stream_id: str) -> list:
        """Return all events in the stream, ordered by position."""
        pass

    def get_current_state(self, stream_id: str) -> dict:
        """Derive current state by merging all event data dicts in order."""
        pass

    def list_streams(self) -> list:
        """Return a sorted list of all stream IDs."""
        pass
