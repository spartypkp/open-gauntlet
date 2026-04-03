class CloudStorage:
    def __init__(self):
        self.files = {}  # name -> size

    def add_file(self, name, size):
        if name in self.files:
            return False
        self.files[name] = size
        return True

    def get_file_size(self, name):
        if name not in self.files:
            return None
        return self.files[name]

    def copy_file(self, name_from, name_to):
        if name_from not in self.files:
            return False
        self.files[name_to] = self.files[name_from]
        return True
