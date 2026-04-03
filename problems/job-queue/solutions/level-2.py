import heapq


class JobQueue:
    def __init__(self):
        self.jobs = {}
        self.pending = []   # min-heap of (-priority, order, job_id)
        self.order = 0

    def enqueue(self, job_id, payload, priority=0):
        if job_id in self.jobs:
            return False
        self.jobs[job_id] = {
            "payload": payload, "status": "pending",
            "order": self.order, "priority": priority
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
        self.jobs[job_id]["status"] = "failed"
        return True

    def get_status(self, job_id):
        if job_id not in self.jobs:
            return "not_found"
        return self.jobs[job_id]["status"]

    def peek(self, n):
        return [job_id for _, _, job_id in heapq.nsmallest(n, self.pending)]

    def queue_length(self):
        return len(self.pending)

    def get_failed_jobs(self):
        return sorted(jid for jid, j in self.jobs.items() if j["status"] == "failed")
