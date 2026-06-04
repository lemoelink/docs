---
id: cluster-proxy
title: Clúster Proxy
sidebar_position: 3
description: Cómo usar l3mcore para unificar múltiples servidores GPU, instancias Ollama y APIs cloud.
---

# Clúster Proxy

l3mcore puede actuar como un **punto de entrada unificado** para una infraestructura heterogénea de backends de IA.

## Arquitectura de clúster

```
                         ┌─────────────────────────────────┐
                         │            l3mcore                │
  Open WebUI ──────────► │   Router ML + Expert Dispatcher │
  Continue (IDE) ──────► │                                 │
  Scripts/API ──────────► │   :11435                        │
                         └──────────┬──────────────────────┘
                                    │
                ┌───────────────────┼───────────────────────┐
                ▼                   ▼                       ▼
       Servidor GPU Local    Mac Mini (Ollama)     Cloud APIs
       (vLLM / Ollama)       experto "general"    (OpenAI, Anthropic)
       experto "coder"                            experto "writer"
```

## Ejemplo de configuración

```json
{
  "max_experts": 15,
  "experts": [
    {
      "id": 1,
      "label": "coder",
      "description": "Experto en código y programación.",
      "keywords": ["codigo", "python", "javascript", "bug", "script", "funcion", "clase", "api", "sql", "bash", "git", "docker", "refactorizar", "depurar", "compilar"],
      "type": "ollama",
      "url": "http://192.168.1.200:11434",
      "model_name": "qwen2.5-coder:32b"
    },
    {
      "id": 2,
      "label": "writer",
      "description": "Escritor creativo y redactor profesional.",
      "keywords": ["historia", "cuento", "poema", "redactar", "escribir", "texto", "articulo", "blog", "email", "marketing", "contenido", "guion", "narrativa", "estilo", "corregir"],
      "type": "api",
      "provider": "anthropic",
      "model_name": "claude-3-5-sonnet-20240620",
      "api_key_env": "ANTHROPIC_API_KEY"
    },
    {
      "id": 3,
      "label": "general",
      "description": "Asistente de propósito general.",
      "keywords": ["ayuda", "explicar", "que", "como", "cuando", "donde", "por", "quien", "definir", "resumir", "traducir", "calcular", "comparar", "recomendar", "opinar"],
      "type": "ollama",
      "url": "http://192.168.1.10:11434",
      "model_name": "llama3.1:8b",
      "fallback": true
    }
  ]
}
```

## Beneficios del clúster

- **Un solo endpoint** para todas tus aplicaciones: `http://lemoe-host:11435`
- **Enrutamiento automático**: el prompt decide a qué servidor va
- **Alta disponibilidad**: si un backend falla, el fallback entra en juego
- **Mezcla cloud + local**: usa cloud solo para lo que lo necesitas, ahorra costes

## vLLM como backend

Si tienes un servidor con GPU corriendo vLLM (que expone una API compatible con OpenAI):

```json
{
  "id": 4,
  "label": "vision",
  "description": "Análisis de imágenes y visión por computador.",
  "keywords": ["imagen", "foto", "captura", "ver", "detectar", "reconocer", "clasificar", "objeto", "cara", "escena", "grafico", "diagrama", "pantalla", "analizar", "describir"],
  "type": "api",
  "provider": "openai",
  "model_name": "llava:13b",
  "api_key_env": "VLLM_API_KEY",
  "base_url": "http://192.168.1.100:8000/v1"
}
```
