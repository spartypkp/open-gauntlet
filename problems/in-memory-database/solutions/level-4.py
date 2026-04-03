class InMemoryDatabase:
    def __init__(self):
        self.data = {}      # key -> {field: {"value": str, "expiry": int|None}}
        self.backups = []    # list of (backup_timestamp, snapshot_data)

    def _is_alive(self, entry, timestamp=None):
        if entry["expiry"] is None:
            return True
        if timestamp is None:
            return True
        return timestamp < entry["expiry"]

    def set(self, key, field, value):
        if key not in self.data:
            self.data[key] = {}
        self.data[key][field] = {"value": value, "expiry": None}
        return None

    def get(self, key, field):
        if key not in self.data or field not in self.data[key]:
            return None
        return self.data[key][field]["value"]

    def delete(self, key, field):
        if key not in self.data or field not in self.data[key]:
            return False
        del self.data[key][field]
        if not self.data[key]:
            del self.data[key]
        return True

    def scan(self, key):
        if key not in self.data or not self.data[key]:
            return ""
        fields = sorted(self.data[key].keys())
        return ", ".join(f"{f}({self.data[key][f]['value']})" for f in fields)

    def scan_by_prefix(self, key, prefix):
        if key not in self.data:
            return ""
        matches = {f: v for f, v in self.data[key].items() if f.startswith(prefix)}
        if not matches:
            return ""
        fields = sorted(matches.keys())
        return ", ".join(f"{f}({matches[f]['value']})" for f in fields)

    def set_at(self, key, field, value, timestamp):
        if key not in self.data:
            self.data[key] = {}
        self.data[key][field] = {"value": value, "expiry": None}
        return None

    def set_at_with_ttl(self, key, field, value, timestamp, ttl):
        if key not in self.data:
            self.data[key] = {}
        self.data[key][field] = {"value": value, "expiry": timestamp + ttl}
        return None

    def get_at(self, key, field, timestamp):
        if key not in self.data or field not in self.data[key]:
            return None
        entry = self.data[key][field]
        if not self._is_alive(entry, timestamp):
            return None
        return entry["value"]

    def delete_at(self, key, field, timestamp):
        if key not in self.data or field not in self.data[key]:
            return False
        entry = self.data[key][field]
        if not self._is_alive(entry, timestamp):
            return False
        del self.data[key][field]
        if not self.data[key]:
            del self.data[key]
        return True

    def scan_at(self, key, timestamp):
        if key not in self.data:
            return ""
        live = {}
        for f, entry in self.data[key].items():
            if self._is_alive(entry, timestamp):
                live[f] = entry["value"]
        if not live:
            return ""
        fields = sorted(live.keys())
        return ", ".join(f"{f}({live[f]})" for f in fields)

    def scan_by_prefix_at(self, key, prefix, timestamp):
        if key not in self.data:
            return ""
        live = {}
        for f, entry in self.data[key].items():
            if f.startswith(prefix) and self._is_alive(entry, timestamp):
                live[f] = entry["value"]
        if not live:
            return ""
        fields = sorted(live.keys())
        return ", ".join(f"{f}({live[f]})" for f in fields)

    def backup(self, timestamp):
        # Snapshot all non-expired fields
        snapshot = {}
        record_count = 0
        for key, fields in self.data.items():
            live_fields = {}
            for field, entry in fields.items():
                if self._is_alive(entry, timestamp):
                    remaining_ttl = None
                    if entry["expiry"] is not None:
                        remaining_ttl = entry["expiry"] - timestamp
                    live_fields[field] = {
                        "value": entry["value"],
                        "remaining_ttl": remaining_ttl
                    }
            if live_fields:
                snapshot[key] = live_fields
                record_count += 1
        self.backups.append((timestamp, snapshot))
        return record_count

    def restore(self, timestamp, timestamp_to_restore):
        # Find most recent backup at or before timestamp_to_restore
        target_backup = None
        for backup_ts, snapshot in self.backups:
            if backup_ts <= timestamp_to_restore:
                target_backup = (backup_ts, snapshot)
            else:
                break
        if target_backup is None:
            return None
        _, snapshot = target_backup
        # Replace all data
        self.data = {}
        for key, fields in snapshot.items():
            self.data[key] = {}
            for field, info in fields.items():
                expiry = None
                if info["remaining_ttl"] is not None:
                    expiry = timestamp + info["remaining_ttl"]
                self.data[key][field] = {
                    "value": info["value"],
                    "expiry": expiry
                }
        return None
