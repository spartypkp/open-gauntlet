class EventStore:
    def __init__(self):
        self.streams = {}

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
        state = {}
        for event in self.streams.get(stream_id, []):
            state.update(event["data"])
        return state

    def list_streams(self):
        return sorted(self.streams.keys())

    def get_events_from(self, stream_id, from_position):
        events = self.streams.get(stream_id, [])
        return events[from_position:]

    def get_state_at(self, stream_id, version):
        state = {}
        for event in self.streams.get(stream_id, [])[:version + 1]:
            state.update(event["data"])
        return state

    def count_events(self, stream_id):
        return len(self.streams.get(stream_id, []))

    def get_event(self, stream_id, position):
        events = self.streams.get(stream_id, [])
        if position < 0 or position >= len(events):
            return None
        return events[position]
