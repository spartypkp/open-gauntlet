# Level 2: Scan

Add two read operations that return multiple fields at once as a formatted string.

## New Operations

### `scan(key)`
Return all field-value pairs for record `key` as a comma-separated string:
```
"field1(value1), field2(value2), ..."
```
Fields are sorted **lexicographically ascending**. Return `""` if the record doesn't exist or is empty.

### `scan_by_prefix(key, prefix)`
Same as `scan` but only includes fields whose names start with `prefix`. Same format and sort order. Return `""` if no matching fields exist.

## Examples

```
db = InMemoryDatabase()
db.set("A", "BC", "E")
db.set("A", "BD", "F")
db.set("A", "C", "G")
db.scan("A")                   # "BC(E), BD(F), C(G)"
db.scan_by_prefix("A", "B")   # "BC(E), BD(F)"
db.scan_by_prefix("A", "X")   # ""
db.scan("Z")                   # "" (key doesn't exist)
```

## Constraints

- Return format: `"field(value)"` -- no spaces inside the parens, comma-space between entries
- Empty prefix matches all fields (same as `scan`)
- Deleted fields do not appear in scan results
