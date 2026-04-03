class InMemoryDatabase:
    def __init__(self):
        self.data = {}  # key -> {field: value}

    def set(self, key, field, value):
        if key not in self.data:
            self.data[key] = {}
        self.data[key][field] = value
        return None

    def get(self, key, field):
        if key not in self.data or field not in self.data[key]:
            return None
        return self.data[key][field]

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
        return ", ".join(f"{f}({self.data[key][f]})" for f in fields)

    def scan_by_prefix(self, key, prefix):
        if key not in self.data:
            return ""
        matches = {f: v for f, v in self.data[key].items() if f.startswith(prefix)}
        if not matches:
            return ""
        fields = sorted(matches.keys())
        return ", ".join(f"{f}({matches[f]})" for f in fields)
