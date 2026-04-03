class EventStore:
    def __init__(self):
        self.streams = {}
        self.snapshots = {}  # stream_id -> list of (version, state)

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
        # Find most recent snapshot
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
        # Find most recent snapshot at or before requested version
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
