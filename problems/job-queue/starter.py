class JobQueue:
    """A work queue with FIFO ordering and job lifecycle management.

    Jobs transition through states: pending -> running -> completed/failed.
    """

    def __init__(self):
        pass

    def enqueue(self, job_id: str, payload: dict) -> bool:
        """Add a job to the queue. Returns True if added."""
        pass

    def dequeue(self) -> str | None:
        """Remove and return the oldest pending job, marking it as running."""
        pass

    def complete(self, job_id: str) -> bool:
        """Mark a running job as completed."""
        pass

    def fail(self, job_id: str) -> bool:
        """Mark a running job as failed."""
        pass

    def get_status(self, job_id: str) -> str:
        """Return the job status: pending, running, completed, failed, or not_found."""
        pass
