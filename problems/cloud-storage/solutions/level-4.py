class CloudStorage:
    def __init__(self):
        self.files = {}       # name -> size
        self.users = {}       # user_id -> {"capacity": int, "used": int}
        self.file_owners = {} # name -> user_id or None

    def add_file(self, name, size):
        if name in self.files:
            return False
        self.files[name] = size
        self.file_owners[name] = None
        return True

    def get_file_size(self, name):
        if name not in self.files:
            return None
        return self.files[name]

    def copy_file(self, name_from, name_to):
        if name_from not in self.files:
            return False
        self.files[name_to] = self.files[name_from]
        if name_to not in self.file_owners:
            self.file_owners[name_to] = None
        return True

    def find_file(self, prefix, suffix):
        matches = [
            name for name in self.files
            if name.startswith(prefix) and name.endswith(suffix)
        ]
        matches.sort(key=lambda n: (-self.files[n], n))
        return matches[:10]

    def add_user(self, user_id, capacity):
        if user_id in self.users:
            return False
        self.users[user_id] = {"capacity": capacity, "used": 0}
        return True

    def add_file_by(self, user_id, name, size):
        if user_id not in self.users:
            return None
        if name in self.files:
            return None
        user = self.users[user_id]
        if user["used"] + size > user["capacity"]:
            return None
        self.files[name] = size
        self.file_owners[name] = user_id
        user["used"] += size
        return user["capacity"] - user["used"]

    def update_capacity(self, user_id, new_capacity):
        if user_id not in self.users:
            return None
        user = self.users[user_id]
        while user["used"] > new_capacity:
            user_files = [
                (name, self.files[name])
                for name in self.files
                if self.file_owners.get(name) == user_id
            ]
            if not user_files:
                break
            # Largest file first; ties broken by reverse-lexicographic name
            user_files.sort(key=lambda x: x[0], reverse=True)   # secondary: name desc
            user_files.sort(key=lambda x: x[1], reverse=True)   # primary: size desc
            to_evict = user_files[0][0]
            evict_size = self.files[to_evict]
            del self.files[to_evict]
            del self.file_owners[to_evict]
            user["used"] -= evict_size
        user["capacity"] = new_capacity
        return user["capacity"] - user["used"]

    def compress_file(self, user_id, name):
        if user_id not in self.users:
            return None
        if name not in self.files:
            return None
        if self.file_owners.get(name) != user_id:
            return None
        if name.endswith(".compressed"):
            return None
        user = self.users[user_id]
        original_size = self.files[name]
        compressed_size = original_size // 2
        compressed_name = name + ".compressed"
        # Remove original, add compressed
        del self.files[name]
        del self.file_owners[name]
        user["used"] -= original_size
        self.files[compressed_name] = compressed_size
        self.file_owners[compressed_name] = user_id
        user["used"] += compressed_size
        return user["capacity"] - user["used"]

    def decompress_file(self, user_id, name):
        if user_id not in self.users:
            return None
        if name not in self.files:
            return None
        if self.file_owners.get(name) != user_id:
            return None
        if not name.endswith(".compressed"):
            return None
        user = self.users[user_id]
        compressed_size = self.files[name]
        original_size = compressed_size * 2
        original_name = name[:-len(".compressed")]
        # Check if uncompressed name already exists
        if original_name in self.files:
            return None
        # Check capacity
        size_diff = original_size - compressed_size
        if user["used"] + size_diff > user["capacity"]:
            return None
        # Remove compressed, add original
        del self.files[name]
        del self.file_owners[name]
        user["used"] -= compressed_size
        self.files[original_name] = original_size
        self.file_owners[original_name] = user_id
        user["used"] += original_size
        return user["capacity"] - user["used"]
