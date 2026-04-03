# Level 1: Basic CRUD

Implement a key-field-value store. Records are identified by a string `key`. Each record holds multiple `(field, value)` pairs, both strings.

## Operations

### `set(key, field, value)`
Insert or update a field in the record at `key`. Create the record if it doesn't exist. Returns `None`.

### `get(key, field)`
Return the value of `field` in the record at `key`. Return `None` if the key or field doesn't exist.

### `delete(key, field)`
Remove `field` from the record at `key`. Return `True` if the field existed and was deleted. Return `False` if the key or field didn't exist. If deleting the last field makes a record empty, the record is considered non-existent.

## Examples

```
db = InMemoryDatabase()
db.set("A", "B", "E")    # None
db.set("A", "C", "F")    # None
db.get("A", "B")          # "E"
db.get("A", "D")          # None (field doesn't exist)
db.get("Z", "B")          # None (key doesn't exist)
db.delete("A", "B")       # True
db.delete("A", "X")       # False (field didn't exist)
db.get("A", "B")          # None (deleted)
```

## Constraints

- Keys and fields are non-empty strings
- Values are non-empty strings
- Void operations return `None`
- Boolean operations return `True` or `False`
