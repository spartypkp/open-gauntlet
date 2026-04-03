# In-Memory Database

Build a lightweight in-memory database that stores records as collections of field-value pairs, supports filtered scans, adds time-to-live (TTL) expiration, and eventually supports snapshots with backup and restore.

This problem models core database primitives: record management, field-level expiration, and point-in-time recovery. These patterns appear at Anthropic, Ramp, and eBay — all of which use this problem in their CodeSignal ICF assessments.

## What You're Building

A class called `InMemoryDatabase` that starts with basic key-field-value storage and progressively adds scan capabilities, TTL expiration, and backup/restore.

## Levels

1. **Basic CRUD** -- Set, get, and delete field-value pairs within records
2. **Scan** -- Return all fields in a record as a formatted string, with prefix filtering
3. **TTL Expiration** -- Time-aware operations where fields can expire
4. **Backup and Restore** -- Snapshot database state and restore to prior snapshots
