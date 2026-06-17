---
id: tool-conversation-exporter
title: Tool Conversation Exporter
sidebar_position: 14
description: Export conversations to Markdown, JSON, or plain text.
---

# Tool Conversation Exporter

The `conversation_exporter` tool exports the current user-LLM conversation to a local file. Supports three formats: Markdown, JSON, and plain text.

## Configuration

```json
{
  "conversation_exporter": {
    "enabled": true,
    "export_dir": "data/exports",
    "default_format": "markdown",
    "include_metadata": true
  }
}
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable/disable the tool |
| `export_dir` | string | `"data/exports"` | Export directory |
| `default_format` | string | `"markdown"` | Default format |
| `include_metadata` | bool | `true` | Include frontmatter with date, messages, format |

---

## Available Tools

1. `export_conversation(format, filename)`: Export the conversation to a file.

---

## Formats

| Format | Extension | Description |
|---|---|---|
| `markdown` | `.md` | Headers `## User` / `## Assistant` |
| `json` | `.json` | Message array with roles (re-importable) |
| `text` | `.txt` | Plain text, format `[Role]: content` |

---

## Examples

**Export markdown**:
```json
{"name": "export_conversation", "parameters": {}}
```

**Export JSON with name**:
```json
{"name": "export_conversation", "parameters": {"format": "json", "filename": "my_chat"}}
```

---

## Security

- System messages (`role: system`) excluded from export.
- Filenames sanitized (no special characters).
- Files saved only in `export_dir`.
- Add `data/exports/` to `.gitignore` recommended.
