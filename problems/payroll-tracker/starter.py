class PayrollTracker:
    """Track worker check-in/check-out times and compute hours worked."""

    def __init__(self):
        pass

    def add_worker(self, worker_id: str, position: str, compensation: int) -> bool:
        """Register a new worker. Returns True if added, False if already exists."""
        pass

    def register(self, worker_id: str, timestamp: int) -> str:
        """Record entry/exit event. Returns 'registered' or None if not found."""
        pass

    def get_total(self, worker_id: str):
        """Return total time in office as integer, or None if not found."""
        pass
