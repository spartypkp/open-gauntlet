# Level 4: Snapshots

Add the ability to save and restore the store's state.

## New Operations

### `snapshot(label)`
Save the current state of the store (all alive entries across all keys) under the given label. If a snapshot with that label already exists, overwrite it.

### `restore(label)`
Revert the store to the state captured in the named snapshot. All current data is replaced. Return `True` if the snapshot exists, `False` otherwise.

### `diff(label_a, label_b)`
Compare two snapshots and return the differences. Return a dictionary where each key maps to `[value_in_a, value_in_b]`. Include keys that exist in one snapshot but not the other (use `None` for the missing side). Only include keys where the values differ.

## Examples

```
store.set("a", 1, timestamp=1)
store.set("b", 2, timestamp=2)
store.snapshot("v1")
store.set("a", 10, timestamp=3)
store.delete("b", timestamp=2)
store.snapshot("v2")
store.diff("v1", "v2")   # returns {"a": [1, 10], "b": [2, None]}
store.restore("v1")
store.get("a", timestamp=5)  # returns 1
store.get("b", timestamp=5)  # returns 2
```

## Important

- Snapshots capture the **resolved state** (what `get` would return for each key), not the raw entry list
- Restoring replaces ALL current data with the snapshot's data
- If entries had TTL when snapshotted, the restored entries should behave as if they were freshly set at restore time
