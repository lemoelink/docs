---
id: endpoints
title: Endpoints de la API
sidebar_position: 1
description: Referencia completa de los endpoints HTTP de l3mcore, compatibles con OpenAI y Ollama.
---

# Endpoints de la API

l3mcore escucha por defecto en `http://0.0.0.0:11435` y expone endpoints compatibles con las APIs de OpenAI y Ollama.

---

## Endpoints OpenAI

### `POST /v1/chat/completions`

Genera una respuesta de chat. Compatible con cualquier cliente OpenAI.

**Request:**

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "Eres un asistente útil."},
    {"role": "user", "content": "Escribe un script en bash para listar procesos."}
  ],
  "stream": true
}
```

:::info Campo `model` opcional
- **Omitido o genérico** (e.g. `"gpt-4"`): l3mcore analiza el prompt y enruta automáticamente al mejor experto.
- **Etiqueta específica** (e.g. `"programador"`): se salta el router y va directo al experto indicado.
:::

**Response (sin streaming):**

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "programador",
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

Lista todos los expertos disponibles en formato OpenAI.

**Response:**

```json
{
  "object": "list",
  "data": [
    {"id": "programador", "object": "model", "created": 1700000000, "owned_by": "lemoe"},
    {"id": "escritor_creativo", "object": "model", "created": 1700000000, "owned_by": "lemoe"}
  ]
}
```

---

## Endpoints Ollama

### `POST /api/chat`

Compatible con clientes Ollama.

```json
{
  "model": "lemoe",
  "messages": [
    {"role": "user", "content": "Explica la computación cuántica."}
  ],
  "stream": false
}
```

---

### `GET /api/tags`

Lista los expertos en formato Ollama.

---

### `GET /api/version`

Devuelve la versión del servidor:

```json
{"version": "1.0.0"}
```

---

## Límites del servidor

| Límite | Valor |
|---|---|
| Rate limit | 60 requests/minuto por IP |
| Tamaño máximo de payload | 1 MB |
| Streaming | SSE compatible |

:::tip Detrás de un proxy reverso
El rate limiter respeta la cabecera `X-Forwarded-For`, por lo que funciona correctamente detrás de Nginx, Traefik o Caddy.
:::
