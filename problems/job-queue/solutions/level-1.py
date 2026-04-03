from collections import deque


class JobQueue:
    def __init__(self):
        self.jobs = {}          # id -> {"payload": ..., "status": ...}
        self.pending = deque()

    def enqueue(self, job_id, payload):
        if job_id in self.jobs:
            return False
        self.jobs[job_id] = {"payload": payload, "status": "pending"}
        self.pending.append(job_id)
        return True

    def dequeue(self):
        if not self.pending:
            return None
        job_id = self.pending.popleft()
        self.jobs[job_id]["status"] = "running"
        return job_id

    def complete(self, job_id):
        if job_id not in self.jobs or self.jobs[job_id]["status"] != "running":
            return False
        self.jobs[job_id]["status"] = "completed"
        return True

    def fail(self, job_id):
        if job_id not in self.jobs or self.jobs[job_id]["status"] != "running":
            return False
        self.jobs[job_id]["status"] = "failed"
        return True

    def get_status(self, job_id):
        if job_id not in self.jobs:
            return "not_found"
        return self.jobs[job_id]["status"]
