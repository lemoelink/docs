---
id: router
title: El Motor de Enrutamiento
sidebar_position: 2
description: Cómo funciona el router semántico multi-vector de l3mcore en detalle.
---

# El Motor de Enrutamiento

El router es el cerebro de l3mcore. Decide qué experto debe responder cada prompt mediante un sistema de puntuación híbrida multi-vector.

## Inicialización (arranque del servidor)

Al arrancar, el router pre-calcula para **cada experto** tres tipos de representaciones vectoriales:

```
experto "programador"
├── vector_descripcion:    embed("Experto en escribir, revisar y depurar código fuente.")
├── vector_centroide:      normalize(mean([embed("codigo"), embed("python"), ...]))
└── vectores_keywords[]:   [embed("codigo"), embed("python"), embed("javascript"), ...]
```

Esto ocurre **una sola vez** al arranque. Las comparaciones en tiempo real son rápidas porque solo hay que vectorizar el prompt entrante.

## Proceso de enrutamiento (por petición)

```
1. Llega el prompt: "Ayúdame a depurar este error de JavaScript"
2. embed(prompt) → vector_prompt
3. Para cada experto:
   a. sim_max_keyword = max(cosine(vector_prompt, kw) for kw in keywords)
   b. sim_description = cosine(vector_prompt, vector_descripcion)
   c. sim_mean_keyword = cosine(vector_prompt, vector_centroide)
   d. sim_top3_vote = fracción de top-3 keywords con sim > 0.40
   e. score_raw = 0.40*a + 0.30*b + 0.20*c + 0.10*d
4. scores_normalized = softmax(scores_raw / temperature)
5. ganador = argmax(scores_normalized)
6. if scores_normalized[ganador] >= confidence_threshold:
      → despachar al ganador
   else:
      → activar fallback de keywords
```

## Por qué Multi-Vector y no un solo embedding

Un solo vector promedio de todas las keywords pierde información:

| Problema | Solución en l3mcore |
|---|---|
| Keywords dispersas se anulan entre sí | `max_keyword`: cualquier keyword puede "ganar" sola |
| Intención general no capturada | `description`: frase semántica completa |
| Una keyword rara domina el vector | `mean_keyword` + `top3_vote`: piden consenso |

## Modelos de Embedding Recomendados

| Modelo | Tamaño | Idiomas | Notas |
|---|---|---|---|
| `intfloat/multilingual-e5-small` | ~120 MB | 100+ | **Por defecto.** Equilibrado. |
| `intfloat/multilingual-e5-base` | ~280 MB | 100+ | Mayor precisión, más RAM |
| `BAAI/bge-small-en-v1.5` | ~130 MB | Inglés | Excelente si solo usas inglés |
| `nomic-ai/nomic-embed-text-v1` | ~550 MB | Inglés | Alta calidad, más pesado |

Cambiar el modelo solo requiere actualizar `model_path` en `config.json`.

## Router tipo `classification`

Para casos avanzados, puedes entrenar un clasificador BERT fine-tuned:

```json
{
  "router_type": "classification",
  "model_path": "ruta/a/tu-modelo-bert-finetuned"
}
```

El modelo de clasificación predice directamente la etiqueta del experto. Es más rápido en inferencia pero menos flexible — añadir un nuevo experto requiere re-entrenar el modelo.

## Modo sin ML (`model_path: ""`)

```json
{
  "router_type": "embedding",
  "model_path": "",
  "keyword_fallback": true
}
```

Deshabilita el router ML completamente y usa solo coincidencia de keywords con fuzzy matching. Útil para Raspberry Pi o hardware muy limitado.
