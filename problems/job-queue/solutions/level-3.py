import heapq


class JobQueue:
    def __init__(self):
        self.jobs = {}
        self.pending = []   # min-heap of (-priority, order, job_id)
        self.order = 0
        self.max_attempts = 3
        self.base_backoff = 5

    def configure(self, max_attempts, base_backoff):
        self.max_attempts = max_attempts
        self.base_backoff = base_backoff

    def enqueue(self, job_id, payload, priority=0):
        if job_id in self.jobs:
            return False
        self.jobs[job_id] = {
            "payload": payload, "status": "pending",
            "order": self.order, "priority": priority,
            "attempts": 0, "retry_at": 0
        }
        heapq.heappush(self.pending, (-priority, self.order, job_id))
        self.order += 1
        return True

    def dequeue(self):
        if not self.pending:
            return None
        _, _, job_id = heapq.heappop(self.pending)
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
        job = self.jobs[job_id]
        job["attempts"] += 1
        if job["attempts"] >= self.max_attempts:
            job["status"] = "dead_letter"
        else:
            job["status"] = "retrying"
            job["retry_at"] = job["retry_at"] + self.base_backoff * (2 ** (job["attempts"] - 1))
        return True

    def get_status(self, job_id):
        if job_id not in self.jobs:
            return "not_found"
        return self.jobs[job_id]["status"]

    def peek(self, n):
        return [job_id for _, _, job_id in heapq.nsmallest(n, self.pending)]

    def queue_length(self):
        return len(self.pending)

    def process_retries(self, timestamp):
        returned = sorted(
            jid for jid, job in self.jobs.items()
            if job["status"] == "retrying" and job["retry_at"] <= timestamp
        )
        for jid in returned:
            job = self.jobs[jid]
            job["status"] = "pending"
            heapq.heappush(self.pending, (-job["priority"], job["order"], jid))
        return returned

    def get_dead_letter(self):
        result = sorted(
            [jid, job["attempts"]]
            for jid, job in self.jobs.items()
            if job["status"] == "dead_letter"
        )
        return result
