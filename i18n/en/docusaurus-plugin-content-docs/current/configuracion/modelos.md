---
id: modelos
title: Model Types (Backends)
sidebar_position: 3
description: How to connect Ollama, external APIs, and local ONNX/GGUF models in LEMoE.
---

# Model Types (Backends)

LEMoE supports three types of backends that you can mix in the same `experts.json`.

---

## 1. Ollama (`type: "ollama"`)

The most common backend for self-hosted setups. Connects to a local or networked Ollama instance.

```json
{
  "type": "ollama",
  "url": "http://127.0.0.1:11434",
  "model_name": "qwen2.5-coder:7b"
}
```

| Field | Description |
|---|---|
| `url` | Base URL of the Ollama server |
| `model_name` | Exact name of the model in Ollama (`ollama list`) |

### Security notes (SSRF)

- Allowed: `http://127.0.0.1:11434` — localhost
- Allowed: `http://192.168.1.100:11434` — private LAN
- Blocked: `http://169.254.169.254` — AWS/GCP metadata

---

## 2. External APIs (`type: "api"`)

Connects to cloud providers via LiteLLM: OpenAI, Anthropic, Google Gemini, Groq, etc.

```json
{
  "type": "api",
  "provider": "openai",
  "model_name": "gpt-4o",
  "api_key_env": "OPENAI_API_KEY"
}
```

| Field | Description |
|---|---|
| `provider` | LiteLLM Provider: `"openai"`, `"anthropic"`, `"gemini"`, `"groq"`, etc. |
| `model_name` | Model ID at the provider |
| `api_key_env` | Name of the environment variable with the API key |

:::danger Never hardcode your API key
Always use `api_key_env` with an environment variable. Example:
```bash
export OPENAI_API_KEY="sk-..."
./start.sh
```
:::

### Supported providers

| Provider | `provider` | Example `model_name` |
|---|---|---|
| OpenAI | `"openai"` | `"gpt-4o"`, `"gpt-4-turbo"` |
| Anthropic | `"anthropic"` | `"claude-3-5-sonnet-20240620"` |
| Google Gemini | `"gemini"` | `"gemini-1.5-pro"` |
| Groq | `"groq"` | `"llama-3.1-70b-versatile"` |
| Together AI | `"together_ai"` | `"mistralai/Mixtral-8x7B-Instruct-v0.1"` |

---

## 3. Local Models (`type: "local"`)

Loads ONNX or GGUF models directly into LEMoE's process memory, without the need for Ollama.

```json
{
  "type": "local",
  "format": "onnx",
  "model_path": "models/mi_modelo_spam"
}
```

| Field | Description |
|---|---|
| `format` | `"onnx"` or `"gguf"` |
| `model_path` | Relative path to the model directory |

### Automatic memory management

Local models consume RAM when loaded. LEMoE applies automatic limits:

- **Maximum 3 simultaneous models** in memory
- **LRU eviction**: if a 4th is needed, the least used is unloaded
- **5-minute TTL**: if a model is unused for 5 mins, it is unloaded

See [Memory Management](/expertos/memoria) for details.
