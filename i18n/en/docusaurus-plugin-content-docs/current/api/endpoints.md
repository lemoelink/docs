---
id: endpoints
title: API Endpoints
sidebar_position: 1
description: Complete reference of LEMoE's HTTP endpoints, compatible with OpenAI and Ollama.
---

# API Endpoints

LEMoE listens on `http://0.0.0.0:11435` by default and exposes endpoints compatible with the OpenAI and Ollama APIs.

---

## OpenAI Endpoints

### `POST /v1/chat/completions`

Generates a chat response. Compatible with any OpenAI client.

**Request:**

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Write a bash script to list processes."}
  ],
  "stream": true
}
```

:::info Optional `model` field
- **Omitted or generic** (e.g. `"gpt-4"`): LEMoE analyzes the prompt and automatically routes to the best expert.
- **Specific label** (e.g. `"programmer"`): skips the router and goes straight to the indicated expert.
:::

**Response (without streaming):**

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "programmer",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "#!/bin/bash\nps aux | sort -rk 3,3 | head -20"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

---

### `GET /v1/models`

Lists all available experts in OpenAI format.

**Response:**

```json
{
  "object": "list",
  "data": [
    {"id": "programmer", "object": "model", "created": 1700000000, "owned_by": "lemoe"},
    {"id": "creative_writer", "object": "model", "created": 1700000000, "owned_by": "lemoe"}
  ]
}
```

---

## Ollama Endpoints

### `POST /api/chat`

Compatible with Ollama clients.

```json
{
  "model": "lemoe",
  "messages": [
    {"role": "user", "content": "Explain quantum computing."}
  ],
  "stream": false
}
```

---

### `GET /api/tags`

Lists experts in Ollama format.

---

### `GET /api/version`

Returns the server version:

```json
{"version": "1.0.0"}
```

---

## Server Limits

| Limit | Value |
|---|---|
| Rate limit | 60 requests/minute per IP |
| Max payload size | 1 MB |
| Streaming | SSE compatible |

:::tip Behind a reverse proxy
The rate limiter respects the `X-Forwarded-For` header, so it works correctly behind Nginx, Traefik, or Caddy.
:::
