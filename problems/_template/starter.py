class TemporalKVStore:
    """A key-value store where every value is associated with a timestamp.

    The same key can hold different values at different points in time.
    Queries return the most recent value at or before the requested timestamp.
    """

    def __init__(self):
        pass

    def set(self, key: str, value, timestamp: int) -> None:
        """Store a value for the key at the given timestamp."""
        pass

    def get(self, key: str, timestamp: int):
        """Return the value with the largest timestamp <= the query timestamp."""
        pass

    def delete(self, key: str, timestamp: int) -> bool:
        """Remove the entry at the exact key + timestamp. Returns True if removed."""
        pass
