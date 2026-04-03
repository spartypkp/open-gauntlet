# Level 3: User Capacity Quotas

Introduce users with per-user storage limits. This is the refactoring level: you now need to track file ownership and enforce capacity constraints on writes.

## New Operations

### `add_user(user_id, capacity)`
Register a new user with a total storage capacity in bytes. Return `True` if added. Return `False` if a user with that `user_id` already exists.

### `add_file_by(user_id, name, size)`
Add a file owned by `user_id`. Return the user's **remaining capacity** (as an integer) if the file was added successfully. Return `None` if:
- `user_id` doesn't exist
- A file with `name` already exists (either from L1 global files or from another user)
- Adding the file would exceed the user's remaining capacity

### `update_capacity(user_id, new_capacity)`
Update a user's total storage capacity. Return the user's new remaining capacity as an integer. Return `None` if `user_id` doesn't exist.

If the user's current storage usage exceeds `new_capacity`, files must be evicted to bring usage within the new limit. Eviction order: **largest file first**; ties broken by **file name in reverse alphabetical order** (z before a). Keep evicting until usage fits within `new_capacity`.

## Important

- **This is a data model change.** Files now have optional ownership. Files added via `add_file` (L1) are "unowned" and don't count against any user's quota. Files added via `add_file_by` are owned and count against their user's quota.
- `add_file_by` blocks if the file name already exists globally — both owned and unowned files occupy the shared namespace.
- Evicted files are deleted from the system entirely (no longer findable or accessible).
- `find_file` still returns all files regardless of ownership.
- `get_file_size` still works on both owned and unowned files.

## Examples

```
storage.add_user("alice", 1000)
storage.add_file_by("alice", "data.csv", 400)   # remaining: 600
storage.add_file_by("alice", "model.pkl", 700)  # fails: would exceed capacity → None
storage.add_file_by("alice", "notes.txt", 600)  # remaining: 0

storage.add_user("bob", 500)
storage.update_capacity("bob", 200)             # remaining: 200 (bob has no files)

storage.add_user("carol", 300)
storage.add_file_by("carol", "a.txt", 150)      # remaining: 150
storage.add_file_by("carol", "b.txt", 100)      # remaining: 50
storage.update_capacity("carol", 120)           # must evict: a.txt (150) first → only b.txt (100) remains → remaining: 20
```
