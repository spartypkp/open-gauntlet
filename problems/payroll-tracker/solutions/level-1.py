class PayrollTracker:
    def __init__(self):
        self.workers = {}  # id -> {position, compensation, entry_time, total_time}

    def add_worker(self, worker_id, position, compensation):
        if worker_id in self.workers:
            return False
        self.workers[worker_id] = {
            "position": position,
            "compensation": compensation,
            "entry_time": None,
            "total_time": 0
        }
        return True

    def register(self, worker_id, timestamp):
        if worker_id not in self.workers:
            return None
        worker = self.workers[worker_id]
        if worker["entry_time"] is None:
            worker["entry_time"] = timestamp
        else:
            worker["total_time"] += timestamp - worker["entry_time"]
            worker["entry_time"] = None
        return "registered"

    def get_total(self, worker_id):
        if worker_id not in self.workers:
            return None
        return self.workers[worker_id]["total_time"]
