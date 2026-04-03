class PayrollTracker:
    def __init__(self):
        self.workers = {}

    def add_worker(self, worker_id, position, compensation):
        if worker_id in self.workers:
            return False
        self.workers[worker_id] = {
            "position": position,
            "compensation": compensation,
            "entry_time": None,
            "total_time": 0,
            "shifts": [],               # list of (start, end)
            "rate_history": [(0, compensation)]  # list of (timestamp, rate)
        }
        return True

    def register(self, worker_id, timestamp):
        if worker_id not in self.workers:
            return None
        worker = self.workers[worker_id]
        if worker["entry_time"] is None:
            worker["entry_time"] = timestamp
        else:
            worker["shifts"].append((worker["entry_time"], timestamp))
            worker["total_time"] += timestamp - worker["entry_time"]
            worker["entry_time"] = None
        return "registered"

    def get_total(self, worker_id):
        if worker_id not in self.workers:
            return None
        return self.workers[worker_id]["total_time"]

    def top_workers(self, n):
        items = [(wid, w["total_time"]) for wid, w in self.workers.items()]
        items.sort(key=lambda x: (-x[1], x[0]))
        return [f"{wid}({total})" for wid, total in items[:n]]

    def promote(self, worker_id, timestamp, new_position, new_compensation):
        if worker_id not in self.workers:
            return None
        worker = self.workers[worker_id]
        worker["position"] = new_position
        worker["compensation"] = new_compensation
        worker["rate_history"].append((timestamp, new_compensation))
        return True

    def get_salary(self, worker_id, start_ts, end_ts):
        if worker_id not in self.workers:
            return None
        worker = self.workers[worker_id]
        rate_history = worker["rate_history"]
        total_salary = 0
        for shift_start, shift_end in worker["shifts"]:
            actual_start = max(shift_start, start_ts)
            actual_end = min(shift_end, end_ts)
            if actual_start >= actual_end:
                continue
            # Split by rate changes
            for i, (rate_ts, rate) in enumerate(rate_history):
                next_ts = rate_history[i + 1][0] if i + 1 < len(rate_history) else float('inf')
                seg_start = max(actual_start, rate_ts)
                seg_end = min(actual_end, next_ts)
                if seg_start >= seg_end:
                    continue
                total_salary += (seg_end - seg_start) * rate
        return total_salary
