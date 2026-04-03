class PayrollTracker:
    def __init__(self):
        self.workers = {}
        self.double_periods = []  # sorted, merged list of (start, end) intervals

    def add_worker(self, worker_id, position, compensation):
        if worker_id in self.workers:
            return False
        self.workers[worker_id] = {
            "position": position,
            "compensation": compensation,
            "entry_time": None,
            "total_time": 0,
            "shifts": [],
            "rate_history": [(0, compensation)]
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
        # If mid-shift, close current shift and reopen at new rate
        if worker["entry_time"] is not None:
            worker["shifts"].append((worker["entry_time"], timestamp))
            worker["total_time"] += timestamp - worker["entry_time"]
            worker["entry_time"] = timestamp
        worker["position"] = new_position
        worker["compensation"] = new_compensation
        worker["rate_history"].append((timestamp, new_compensation))
        return True

    def set_double_paid(self, start_ts, end_ts):
        # Insert and merge into sorted interval list
        self.double_periods.append((start_ts, end_ts))
        self.double_periods.sort()
        merged = [self.double_periods[0]]
        for start, end in self.double_periods[1:]:
            if start <= merged[-1][1]:
                merged[-1] = (merged[-1][0], max(merged[-1][1], end))
            else:
                merged.append((start, end))
        self.double_periods = merged

    def _double_overlap(self, seg_start, seg_end):
        """Return total time in [seg_start, seg_end) that overlaps with double-pay periods."""
        overlap = 0
        for dp_start, dp_end in self.double_periods:
            if dp_start >= seg_end:
                break
            if dp_end <= seg_start:
                continue
            overlap += min(seg_end, dp_end) - max(seg_start, dp_start)
        return overlap

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
                duration = seg_end - seg_start
                double_time = self._double_overlap(seg_start, seg_end)
                normal_time = duration - double_time
                total_salary += (normal_time * rate) + (double_time * rate * 2)
        return total_salary
