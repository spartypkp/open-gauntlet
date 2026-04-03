# Level 1: Basic File Operations

Implement a flat file storage system. All files live in a single namespace — no directories, just names and sizes.

## Operations

### `add_file(name, size)`
Add a file with the given name and size (integer, in bytes). Return `True` if added. Return `False` if a file with that name already exists.

### `get_file_size(name)`
Return the size of the named file as an integer. Return `None` if the file doesn't exist.

### `copy_file(name_from, name_to)`
Copy a file from `name_from` to `name_to`. If `name_to` already exists, overwrite it. Return `True` on success. Return `False` if `name_from` doesn't exist.

## Examples

```
storage = CloudStorage()
storage.add_file("report.pdf", 500)      # True
storage.add_file("report.pdf", 200)      # False (already exists)
storage.get_file_size("report.pdf")      # 500
storage.get_file_size("missing.txt")     # None
storage.add_file("notes.txt", 100)       # True
storage.copy_file("notes.txt", "backup.txt")   # True
storage.get_file_size("backup.txt")      # 100
storage.copy_file("ghost.txt", "out.txt")      # False
```

## Constraints

- File names are unique strings (case-sensitive)
- Sizes are positive integers
- No directories — all files share a flat namespace
