---
id: modelos
title: Tipos de Modelos (Backends)
sidebar_position: 3
description: Cómo conectar Ollama, APIs externas y modelos locales ONNX/GGUF en l3mcore.
---

# Tipos de Modelos (Backends)

l3mcore soporta tres tipos de backends que puedes mezclar en el mismo `experts.json`.

---

## 1. Ollama (`type: "ollama"`)

El backend más común para configuraciones self-hosted. Conecta a una instancia de Ollama local o en red.

```json
{
  "type": "ollama",
  "url": "http://127.0.0.1:11434",
  "model_name": "qwen2.5-coder:7b"
}
```

| Campo | Descripción |
|---|---|
| `url` | URL base del servidor Ollama |
| `model_name` | Nombre exacto del modelo en Ollama (`ollama list`) |

### Notas de seguridad (SSRF)

- Permitido: `http://127.0.0.1:11434` — localhost
- Permitido: `http://192.168.1.100:11434` — LAN privada
- Bloqueado: `http://169.254.169.254` — metadata AWS/GCP

---

## 2. APIs Externas (`type: "api"`)

Conecta a proveedores cloud via LiteLLM: OpenAI, Anthropic, Google Gemini, Groq, etc.

```json
{
  "type": "api",
  "provider": "openai",
  "model_name": "gpt-4o",
  "api_key_env": "OPENAI_API_KEY"
}
```

| Campo | Descripción |
|---|---|
| `provider` | Proveedor LiteLLM: `"openai"`, `"anthropic"`, `"gemini"`, `"groq"`, etc. |
| `model_name` | ID del modelo en el proveedor |
| `api_key_env` | Nombre de la variable de entorno con la API key |

:::danger Nunca hardcodees tu API key
Usa siempre `api_key_env` con una variable de entorno. Ejemplo:
```bash
export OPENAI_API_KEY="sk-..."
./start.sh
```
:::

### Proveedores soportados

| Proveedor | `provider` | Ejemplo `model_name` |
|---|---|---|
| OpenAI | `"openai"` | `"gpt-4o"`, `"gpt-4-turbo"` |
| Anthropic | `"anthropic"` | `"claude-3-5-sonnet-20240620"` |
| Google Gemini | `"gemini"` | `"gemini-1.5-pro"` |
| Groq | `"groq"` | `"llama-3.1-70b-versatile"` |
| Together AI | `"together_ai"` | `"mistralai/Mixtral-8x7B-Instruct-v0.1"` |

---

## 3. Modelos Locales (`type: "local"`)

Carga modelos ONNX o GGUF directamente en la memoria del proceso de l3mcore, sin necesidad de Ollama.

```json
{
  "type": "local",
  "format": "onnx",
  "model_path": "models/mi_modelo_spam"
}
```

| Campo | Descripción |
|---|---|
| `format` | `"onnx"` o `"gguf"` |
| `model_path` | Ruta relativa al directorio del modelo |

### Gestión de memoria automática

Los modelos locales consumen RAM al cargarse. l3mcore aplica límites automáticos:

- **Máximo 3 modelos simultáneos** en memoria
- **Evicción LRU**: si se necesita un 4º, se descarga el menos usado
- **TTL de 5 minutos**: si un modelo lleva 5 min sin uso, se descarga

Ver [Gestión de Memoria](/expertos/memoria) para detalles.
