---
id: ajuste-rendimiento
title: Ajuste de Rendimiento
sidebar_position: 4
description: Optimización del rendimiento de LEMoE para diferentes tipos de hardware.
---

# Ajuste de Rendimiento

## Perfiles por hardware

### Raspberry Pi / Hardware Limitado

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

**Recomendación**: usa solo backends Ollama o API, evita modelos locales ONNX.

---

### Servidor con CPU dedicada (sin GPU)

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

### Servidor con GPU

Para máxima velocidad, usa backends Ollama con GPU o vLLM:
- El router de LEMoE es ligero (CPU only)
- Los modelos expertos en GPU vía Ollama/vLLM
- Puedes subir `MAX_LOADED_MODELS` si tienes VRAM suficiente

---

## Velocidad del Router

El tiempo de decisión del router varía según el modelo de embedding:

| Modelo | Tiempo típico/petición | RAM |
|---|---|---|
| Sin ML (solo keywords) | < 1 ms | ~0 |
| `multilingual-e5-small` | ~15 ms | ~120 MB |
| `multilingual-e5-base` | ~30 ms | ~280 MB |
| `multilingual-e5-large` | ~80 ms | ~560 MB |

El modelo se carga en RAM una sola vez al arranque. El tiempo de decisión es marginal comparado con la inferencia del modelo experto.

## Caché de embeddings

Para prompts repetitivos (e.g. un bot con pocas preguntas frecuentes), puedes implementar caché en un plugin:

```python
# plugins/embedding_cache.py
from functools import lru_cache

@lru_cache(maxsize=512)
def cached_route(prompt: str) -> str:
    return prompt  # el hook solo cachea si el prompt es idéntico

def before_routing(prompt: str) -> str:
    return cached_route(prompt.strip().lower())
```

## Monitorización

Revisa regularmente `logs/app.log` para detectar:
- Expertos que nunca reciben tráfico (keywords mal elegidas)
- Scores muy bajos consistentes (umbral demasiado alto o keywords insuficientes)
- Timeouts en backends externos
