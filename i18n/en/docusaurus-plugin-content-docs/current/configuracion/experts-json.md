---
id: experts-json
title: experts.json — Experts
sidebar_position: 2
description: Complete reference of experts.json to define specialist models in l3mcore.
---

# `experts.json` — Expert Definition

The `config/experts.json` file defines the list of specialist models available to the system.

## Structure

```json
{
  "max_experts": 15,
  "experts": [
    {
      "id": 1,
      "label": "programmer",
      "description": "Expert in writing, reviewing, and debugging source code.",
      "keywords": [
        "code", "program", "python", "javascript", "function",
        "script", "error", "bug", "html", "css", "class", "object",
        "module", "api", "refactor"
      ],
      "type": "ollama",
      "url": "http://127.0.0.1:11434",
      "model_name": "qwen2.5:7b"
    }
  ]
}
```

## Expert fields

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Unique numeric identifier. |
| `label` | Yes | Name of the expert. Alphanumeric, hyphens, and underscores only. Used as the model name in the API. |
| `description` | Yes | Natural language sentence describing what the expert handles. It is vectorized and contributes 30% to the score. |
| `keywords` | Yes | List of terms the user might type. **Minimum 15.** |
| `type` | Yes | Backend: `"ollama"`, `"api"` or `"local"`. See [Models](/configuracion/modelos). |

## Critical rules for keywords

:::danger Minimum 15 keywords per expert
The multi-vector scoring system needs enough coverage. With fewer than 15 keywords you will get inaccurate routing.
:::

1. **Concrete terms, not abstract categories**
   - Correct: `"sql"`, `"query"`, `"select"`, `"join"`, `"trigger"`
   - Incorrect: `"database"`, `"data"`, `"information"`

2. **Words the user actually types in the prompt**
   - Include synonyms, conjugations, common typos

3. **No excessive overlap between experts**
   - If two experts share many identical keywords, the router will hesitate between them

## Example: Creative writing expert

```json
{
  "id": 2,
  "label": "creative_writer",
  "description": "Creative writer, storyteller, and poet expert.",
  "keywords": [
    "story", "tale", "poem", "short_story", "novel",
    "character", "plot", "fiction", "fantasy", "narrative",
    "dialogue", "chapter", "script", "creativity", "inspiration",
    "protagonist", "villain", "scene", "storyline", "metaphor"
  ],
  "type": "api",
  "provider": "openai",
  "model_name": "gpt-4o",
  "api_key_env": "OPENAI_API_KEY"
}
```

## Expert Limit (`max_experts`)

Defines the maximum number of experts the system can load. Increasing it has no CPU/RAM cost unless you use local backends (ONNX/GGUF).

## Fallback Expert

The `fallback` expert (with ID `0`) is **mandatory** in all `experts.json` files. 
It does not have the `keywords` property, as it is automatically activated by default: when no expert exceeds the router's `confidence_threshold`, or if there is no keyword match, the system redirects the request to this model.

```json
{
  "id": 0,
  "label": "fallback",
  "description": "General purpose model for when the router cannot classify the prompt.",
  "type": "local",
  "format": "gguf",
  "model_path": "models/Qwen3.5-0.8B-Q4_K_M.gguf"
}
```

Unlike the other experts, the `keywords` field is not necessary nor allowed for the `fallback`. You can configure it to use Ollama, external APIs, or local GGUF models, exactly the same as any other expert.
