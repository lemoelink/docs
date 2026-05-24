---
id: ajuste-rendimiento
title: Performance Tuning
sidebar_position: 4
description: Optimizing LEMoE's performance for different types of hardware.
---

# Performance Tuning

## Hardware profiles

### Raspberry Pi / Limited Hardware

```json
// config.json
{
  "router": {
    "model_path": "",
    "keyword_fallback": true,
    "confidence_threshold": 0.3
  }
}
```

```python
# modules/onnx_runner.py
MAX_LOADED_MODELS = 1
IDLE_TIMEOUT = 60
INTRA_THREADS = 1
INTER_THREADS = 1
```

**Recommendation**: use only Ollama or API backends, avoid local ONNX models.

---

### Server with dedicated CPU (no GPU)

```json
// config.json
{
  "router": {
    "router_type": "embedding",
    "model_path": "intfloat/multilingual-e5-base",
    "confidence_threshold": 0.45,
    "softmax_temperature": 0.12
  }
}
```

```python
# modules/onnx_runner.py
MAX_LOADED_MODELS = 3
IDLE_TIMEOUT = 300
INTRA_THREADS = 4
INTER_THREADS = 2
```

---

### Server with GPU

For maximum speed, use Ollama backends with GPU or vLLM:
- LEMoE's router is lightweight (CPU only)
- Expert models on GPU via Ollama/vLLM
- You can increase `MAX_LOADED_MODELS` if you have enough VRAM

---

## Router Speed

The router's decision time varies depending on the embedding model:

| Model | Typical time/request | RAM |
|---|---|---|
| No ML (keywords only) | < 1 ms | ~0 |
| `multilingual-e5-small` | ~15 ms | ~120 MB |
| `multilingual-e5-base` | ~30 ms | ~280 MB |
| `multilingual-e5-large` | ~80 ms | ~560 MB |

The model is loaded into RAM only once at startup. The decision time is marginal compared to the expert model's inference.

## Embedding cache

For repetitive prompts (e.g. a bot with a few frequent questions), you can implement caching in a plugin:

```python
# plugins/embedding_cache.py
from functools import lru_cache

@lru_cache(maxsize=512)
def cached_route(prompt: str) -> str:
    return prompt  # the hook only caches if the prompt is identical

def before_routing(prompt: str) -> str:
    return cached_route(prompt.strip().lower())
```

## Monitoring

Regularly check `logs/app.log` to detect:
- Experts that never receive traffic (poorly chosen keywords)
- Consistently very low scores (threshold too high or insufficient keywords)
- Timeouts on external backends
