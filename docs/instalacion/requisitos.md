---
id: requisitos
title: Requisitos del Sistema
sidebar_position: 1
description: Requisitos de hardware y software para instalar LEMoE.
---

# Requisitos del Sistema

## Hardware Mínimo

| Componente | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 núcleos | 4+ núcleos |
| RAM | 2 GB | 8 GB+ |
| Disco | 500 MB (LEMoE) | Según modelos locales |
| GPU | No requerida | Opcional (para ONNX/GGUF locales) |

:::tip Raspberry Pi
LEMoE es tan ligero que puede correr en una Raspberry Pi 4 con 4 GB de RAM. Ideal para homelabs.
:::

## Software

- **Python**: 3.9 o superior
- **pip**: incluido con Python
- **git**: para clonar el repositorio
- **Ollama** *(opcional)*: si quieres usar backends locales con Ollama

## Dependencias Python

Las dependencias principales se instalan automáticamente con `setup.sh`:

```
flask
sentence-transformers   # para embeddings ML
rapidfuzz               # para fallback de keywords
litellm                 # para APIs externas (OpenAI, Anthropic, etc.)
onnxruntime             # para modelos locales ONNX (opcional)
```

## Compatibilidad de SO

| Sistema Operativo | Estado |
|---|---|
| Linux (Ubuntu 20.04+, Debian, Arch) | Soportado |
| macOS (12+) | Soportado |
| Windows (WSL2) | Soportado via WSL2 |
| Windows nativo | No testado |
| Raspberry Pi OS | Soportado |
