---
id: cluster-proxy
title: Cluster Proxy
sidebar_position: 3
description: How to use LEMoE to unify multiple GPU servers, Ollama instances, and cloud APIs.
---

# Cluster Proxy

LEMoE can act as a **unified entry point** for a heterogeneous infrastructure of AI backends.

## Cluster architecture

```
                         ┌─────────────────────────────────┐
                         │            LEMoE                │
  Open WebUI ──────────► │   Router ML + Expert Dispatcher │
  Continue (IDE) ──────► │                                 │
  Scripts/API ──────────► │   :11435                        │
                         └──────────┬──────────────────────┘
                                    │
                ┌───────────────────┼───────────────────────┐
                ▼                   ▼                       ▼
       Local GPU Server      Mac Mini (Ollama)         Cloud APIs
       (vLLM / Ollama)       "general" expert      (OpenAI, Anthropic)
       "coder" expert                              "writer" expert
```

## Configuration example

```json
{
  "max_experts": 15,
  "experts": [
    {
      "id": 1,
      "label": "coder",
      "description": "Code and programming expert.",
      "keywords": ["code", "python", "javascript", "bug", "script", "function", "class", "api", "sql", "bash", "git", "docker", "refactor", "debug", "compile"],
      "type": "ollama",
      "url": "http://192.168.1.200:11434",
      "model_name": "qwen2.5-coder:32b"
    },
    {
      "id": 2,
      "label": "writer",
      "description": "Creative writer and professional copywriter.",
      "keywords": ["story", "tale", "poem", "draft", "write", "text", "article", "blog", "email", "marketing", "content", "script", "narrative", "style", "correct"],
      "type": "api",
      "provider": "anthropic",
      "model_name": "claude-3-5-sonnet-20240620",
      "api_key_env": "ANTHROPIC_API_KEY"
    },
    {
      "id": 3,
      "label": "general",
      "description": "General purpose assistant.",
      "keywords": ["help", "explain", "what", "how", "when", "where", "why", "who", "define", "summarize", "translate", "calculate", "compare", "recommend", "review"],
      "type": "ollama",
      "url": "http://192.168.1.10:11434",
      "model_name": "llama3.1:8b",
      "fallback": true
    }
  ]
}
```

## Cluster benefits

- **A single endpoint** for all your applications: `http://lemoe-host:11435`
- **Automatic routing**: the prompt decides which server to go to
- **High availability**: if a backend fails, the fallback kicks in
- **Cloud + local mix**: use cloud only for what you need it, save costs

## vLLM as backend

If you have a server with a GPU running vLLM (which exposes an OpenAI-compatible API):

```json
{
  "id": 4,
  "label": "vision",
  "description": "Image analysis and computer vision.",
  "keywords": ["image", "photo", "capture", "see", "detect", "recognize", "classify", "object", "face", "scene", "graph", "diagram", "screen", "analyze", "describe"],
  "type": "api",
  "provider": "openai",
  "model_name": "llava:13b",
  "api_key_env": "VLLM_API_KEY",
  "base_url": "http://192.168.1.100:8000/v1"
}
```
