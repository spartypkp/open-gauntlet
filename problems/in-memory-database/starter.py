class InMemoryDatabase:
    """A key-field-value store. Records are identified by a string key,
    each holding multiple (field, value) pairs."""

    def __init__(self):
        pass

    def set(self, key: str, field: str, value: str):
        """Insert or update a field in the record at key. Returns None."""
        pass

    def get(self, key: str, field: str):
        """Return the value of field in the record at key. Returns None if not found."""
        pass

    def delete(self, key: str, field: str) -> bool:
        """Remove field from the record at key. Returns True if deleted, False if not found."""
        pass
