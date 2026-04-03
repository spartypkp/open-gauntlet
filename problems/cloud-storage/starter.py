class CloudStorage:
    """A flat file storage system. Files have names and sizes,
    all sharing a single namespace."""

    def __init__(self):
        pass

    def add_file(self, name: str, size: int) -> bool:
        """Add a file. Returns True if added, False if name already exists."""
        pass

    def get_file_size(self, name: str):
        """Return file size as integer, or None if not found."""
        pass

    def copy_file(self, name_from: str, name_to: str) -> bool:
        """Copy a file. Returns True on success, False if source doesn't exist."""
        pass
