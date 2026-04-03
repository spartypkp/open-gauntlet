# Level 2: File Search

Add the ability to search for files by name prefix and suffix. Results are ranked by file size.

## New Operations

### `find_file(prefix, suffix)`
Return a list of file names where the name starts with `prefix` AND ends with `suffix`. Either can be an empty string (meaning "no filter on that end"). Results sorted by **size descending**; ties broken **alphabetically ascending** by name. Return at most 10 results. Return `[]` if no files match.

## Examples

```
storage.add_file("report_2024.pdf", 500)
storage.add_file("report_2025.pdf", 300)
storage.add_file("notes.txt", 100)
storage.add_file("readme.txt", 200)

storage.find_file("report", ".pdf")   # ["report_2024.pdf", "report_2025.pdf"] (size desc)
storage.find_file("", ".txt")         # ["readme.txt", "notes.txt"] (size desc)
storage.find_file("r", "")            # ["report_2024.pdf", "report_2025.pdf", "readme.txt"] (all starting with r, size desc)
storage.find_file("x", "")            # []
```

## Important

- A file name that equals `prefix + suffix` with nothing in between is a valid match (e.g. prefix="log", suffix="log" matches "loglog" but also just "log" if len("log") >= len("log")).
- More precisely: `name.startswith(prefix) and name.endswith(suffix)` — standard Python semantics.
- Both `prefix` and `suffix` being empty string matches all files.
- Return at most 10 results even if more files match.

## Constraints

- Sorting is by file size descending, then filename ascending for ties.
- All files from L1 are still accessible and searchable.
