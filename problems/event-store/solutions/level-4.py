class EventStore:
    def __init__(self):
        self.streams = {}
        self.snapshots = {}
        self.aggregates = {}  # name -> list of stream_ids

    def append(self, stream_id, event_type, data):
        if stream_id not in self.streams:
            self.streams[stream_id] = []
        position = len(self.streams[stream_id])
        self.streams[stream_id].append({
            "position": position,
            "event_type": event_type,
            "data": data
        })
        return position

    def get_events(self, stream_id):
        return self.streams.get(stream_id, [])

    def get_current_state(self, stream_id):
        events = self.streams.get(stream_id, [])
        if not events:
            return {}
        snaps = self.snapshots.get(stream_id, [])
        state = {}
        start_pos = 0
        if snaps:
            snap_version, snap_state = snaps[-1]
            state = dict(snap_state)
            start_pos = snap_version + 1
        for event in events[start_pos:]:
            state.update(event["data"])
        return state

    def list_streams(self):
        return sorted(self.streams.keys())

    def get_events_from(self, stream_id, from_position):
        events = self.streams.get(stream_id, [])
        return events[from_position:]

    def get_state_at(self, stream_id, version):
        events = self.streams.get(stream_id, [])
        if not events:
            return {}
        snaps = self.snapshots.get(stream_id, [])
        state = {}
        start_pos = 0
        for snap_version, snap_state in snaps:
            if snap_version <= version:
                state = dict(snap_state)
                start_pos = snap_version + 1
            else:
                break
        for event in events[start_pos:version + 1]:
            state.update(event["data"])
        return state

    def count_events(self, stream_id):
        return len(self.streams.get(stream_id, []))

    def get_event(self, stream_id, position):
        events = self.streams.get(stream_id, [])
        if position < 0 or position >= len(events):
            return None
        return events[position]

    def create_snapshot(self, stream_id):
        if stream_id not in self.streams:
            return None
        events = self.streams[stream_id]
        state = {}
        for event in events:
            state.update(event["data"])
        version = len(events) - 1
        if stream_id not in self.snapshots:
            self.snapshots[stream_id] = []
        self.snapshots[stream_id].append((version, state))
        return version

    def create_aggregate(self, name, stream_ids):
        if name in self.aggregates:
            return False
        self.aggregates[name] = list(stream_ids)
        return True

    def get_aggregate(self, name):
        if name not in self.aggregates:
            return None
        state = {}
        for sid in sorted(self.aggregates[name]):
            for event in self.streams.get(sid, []):
                state.update(event["data"])
        return state

    def get_event_count_by_type(self, event_type):
        count = 0
        for events in self.streams.values():
            for event in events:
                if event["event_type"] == event_type:
                    count += 1
        return count

    def replay_from(self, stream_id, from_position):
        if stream_id not in self.streams:
            return None
        return self.streams[stream_id][from_position:]
