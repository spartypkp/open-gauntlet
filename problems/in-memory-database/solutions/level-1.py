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
