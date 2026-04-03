# Cloud File Storage

Build an in-memory cloud storage system that manages files, supports search, enforces per-user storage quotas, and handles file compression.

This problem models the core of a cloud storage service like Dropbox or S3: file management, ownership, capacity enforcement, and space optimization. These patterns appear in infrastructure systems, storage backends, and multi-tenant SaaS platforms.

## What You're Building

A class called `CloudStorage` that starts with basic file operations and progressively adds search, user capacity quotas, and compression.

## Levels

1. **Basic File Operations** -- Add, retrieve, and copy files in a flat namespace
2. **File Search** -- Search files by prefix and suffix with size-based ranking
3. **User Capacity Quotas** -- Track per-user storage limits and enforce them on writes
4. **Compression** -- Compress and decompress files to save space, updating capacity accordingly
