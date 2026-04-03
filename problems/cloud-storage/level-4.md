# Level 4: Compression

Add the ability to compress and decompress user-owned files. Compression halves file size and frees up quota; decompression restores the original size.

## New Operations

### `compress_file(user_id, name)`
Compress a file owned by `user_id`. On success:
- Removes the original file named `name`
- Creates a new file named `name + ".compressed"` with size = `original_size / 2` (size is guaranteed to be even)
- Returns the user's new remaining capacity as an integer

Return `None` if:
- `user_id` doesn't exist
- No file named `name` exists, or the file is not owned by `user_id`
- The file is already compressed (name already ends with `.compressed`)

### `decompress_file(user_id, name)`
Decompress a file owned by `user_id`. `name` must end with `.compressed`. On success:
- Removes the compressed file named `name`
- Creates a new file named `name[:-len(".compressed")]` with size = `compressed_size * 2`
- Returns the user's new remaining capacity as an integer

Return `None` if:
- `user_id` doesn't exist
- No file named `name` exists, or the file is not owned by `user_id`
- `name` does not end with `.compressed`
- Decompressing would cause the user's usage to exceed their capacity
- A file with the uncompressed name already exists

## Important

- Only user-owned files (added via `add_file_by`) can be compressed or decompressed. Global files (added via `add_file`) cannot.
- Capacity recalculates correctly: compressing frees space (compressed file is smaller), decompressing uses space (restored file is larger).
- Compressed and decompressed files remain searchable via `find_file`.

## Examples

```
storage.add_user("alice", 1000)
storage.add_file_by("alice", "video.mp4", 800)   # remaining: 200
storage.compress_file("alice", "video.mp4")      # remaining: 600 (800→400, freed 400)
storage.get_file_size("video.mp4")               # None (gone)
storage.get_file_size("video.mp4.compressed")    # 400

storage.decompress_file("alice", "video.mp4.compressed")  # remaining: 200 (400→800, used 400)
storage.get_file_size("video.mp4")               # 800

# Decompress blocked by capacity
storage.add_user("bob", 500)
storage.add_file_by("bob", "data.bin", 400)      # remaining: 100
storage.compress_file("bob", "data.bin")         # remaining: 300 (400→200, freed 200)
storage.add_file_by("bob", "extra.txt", 200)     # remaining: 100
storage.decompress_file("bob", "data.bin.compressed")  # None (would need 400 total, but only 300 free after removing compressed)
```
