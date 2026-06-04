---
id: requisitos
title: System Requirements
sidebar_position: 1
description: Hardware and software requirements to install l3mcore.
---

# System Requirements

## Minimum Hardware

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 8 GB+ |
| Disk | 500 MB (l3mcore) | Depends on local models |
| GPU | Not required | Optional (for local ONNX/GGUF) |

:::tip Raspberry Pi
l3mcore is so lightweight that it can run on a Raspberry Pi 4 with 4 GB of RAM. Ideal for homelabs.
:::

## Software

- **Python**: 3.9 or higher
- **pip**: included with Python
- **git**: to clone the repository
- **Ollama** *(optional)*: if you want to use local backends with Ollama

## Python Dependencies

The main dependencies are installed automatically with `setup.sh`:

```
flask
sentence-transformers   # for ML embeddings
rapidfuzz               # for keyword fallback
litellm                 # for external APIs (OpenAI, Anthropic, etc.)
onnxruntime             # for local ONNX models (optional)
```

## OS Compatibility

| Operating System | Status |
|---|---|
| Linux (Ubuntu 20.04+, Debian, Arch) | Supported |
| macOS (12+) | Supported |
| Windows (WSL2) | Supported via WSL2 |
| Native Windows | Not tested |
| Raspberry Pi OS | Supported |
