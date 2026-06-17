---
id: tool-web-search
title: Tool Web Search
sidebar_position: 11
description: Search the internet via DuckDuckGo or SearXNG.
---

# Tool Web Search

The `web_search` tool allows l3mcore to search the internet in real time. Uses DuckDuckGo as the default engine (no API key required) or self-hosted SearXNG.

## Configuration

```json
{
  "web_search": {
    "enabled": true,
    "provider": "duckduckgo",
    "searxng_url": "",
    "num_results": 5,
    "timeout": 10,
    "safe_search": "moderate",
    "language": "es"
  }
}
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable/disable the tool |
| `provider` | string | `"duckduckgo"` | Search engine: `"duckduckgo"` or `"searxng"` |
| `searxng_url` | string | `""` | SearXNG instance URL (if provider=searxng) |
| `num_results` | int | `5` | Maximum number of results |
| `timeout` | int | `10` | HTTP timeout in seconds |
| `safe_search` | string | `"moderate"` | Filter: `"off"`, `"moderate"`, `"strict"` |
| `language` | string | `"es"` | ISO 639-1 language code |

---

## Dependencies

```bash
pip install duckduckgo-search
```

---

## Available Tools

1. `web_search(query, num_results)`: Search the internet and return titles, URLs, and snippets.

---

## Providers

### DuckDuckGo (default)
- No API key or additional configuration needed.
- Anonymous search, no strict rate limits.
- Recommended for local use.

### SearXNG
- Requires self-hosted instance.
- Faster and more private.
- Setup: `docker run -d -p 8888:8080 searxng/searxng`

---

## Security

- Queries limited to 500 characters.
- No access to internal networks (SSRF protected by DuckDuckGo).
- No personal data sent to external services.
