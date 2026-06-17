---
id: tool-memory-store
title: Tool Memory Store
sidebar_position: 13
description: Persistent key-value memory across sessions.
---

# Tool Memory Store

The `memory_store` tool stores key-value pairs persistently on disk. Allows the LLM to remember information across sessions: user name, preferences, previous context, etc.

## Configuration

```json
{
  "memory_store": {
    "enabled": true,
    "store_path": "data/memory_store.json",
    "max_entries": 1000,
    "max_key_len": 128,
    "max_value_len": 50000,
    "ttl_days": 0
  }
}
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable/disable the tool |
| `store_path` | string | `"data/memory_store.json"` | JSON file storage path |
| `max_entries` | int | `1000` | Maximum number of entries |
| `max_key_len` | int | `128` | Maximum key length |
| `max_value_len` | int | `50000` | Maximum value length (characters) |
| `ttl_days` | int | `0` | Days before expiration (0 = no TTL) |

---

## Available Tools

1. `memory_store(key, value)`: Store a value.
2. `memory_retrieve(key)`: Retrieve a value by key.
3. `memory_delete(key)`: Delete a value.
4. `memory_list()`: List all entries.

---

## Storage

Data is stored in `data/memory_store.json`:

```json
{
  "user_name": {
    "value": "Carlos",
    "created": 1750000000.0,
    "updated": 1750000000.0
  }
}
```

Disk flush every 5 seconds to reduce I/O.

---

## Examples

**Store**: `"save to memory that my name is Carlos"`
```json
{"name": "memory_store", "parameters": {"key": "user_name", "value": "Carlos"}}
```

**Retrieve**: `"what is my name?"`
```json
{"name": "memory_retrieve", "parameters": {"key": "user_name"}}
```

---

## Security

- Keys and values sanitized (no path traversal).
- Values automatically truncated to 50k characters.
- Maximum 1000 entries by default.
- Thread-safe concurrent access.
- JSON file contains no sensitive data by default.
- Add `data/memory_store.json` to `.gitignore` recommended.
