---
id: router
title: The Routing Engine
sidebar_position: 2
description: How the l3mcore multi-vector semantic router works in detail.
---

# The Routing Engine

The router is the brain of l3mcore. It decides which expert should answer each prompt using a multi-vector hybrid scoring system.

## Initialization (server startup)

On startup, the router pre-calculates three types of vector representations for **each expert**:

```
expert "programmer"
├── vector_description:    embed("Expert in writing, reviewing and debugging source code.")
├── vector_centroid:       normalize(mean([embed("code"), embed("python"), ...]))
└── vectors_keywords[]:    [embed("code"), embed("python"), embed("javascript"), ...]
```

This happens **only once** at startup. Real-time comparisons are fast because only the incoming prompt needs to be vectorized.

## Routing process (per request)

```
1. Prompt arrives: "Help me debug this JavaScript error"
2. embed(prompt) → vector_prompt
3. For each expert:
   a. sim_max_keyword = max(cosine(vector_prompt, kw) for kw in keywords)
   b. sim_description = cosine(vector_prompt, vector_description)
   c. sim_mean_keyword = cosine(vector_prompt, vector_centroid)
   d. sim_top3_vote = fraction of top-3 keywords with sim > 0.40
   e. score_raw = 0.40*a + 0.30*b + 0.20*c + 0.10*d
4. scores_normalized = softmax(scores_raw / temperature)
5. winner = argmax(scores_normalized)
6. if scores_normalized[winner] >= confidence_threshold:
      → dispatch to winner
   else:
      → trigger keyword fallback
```

## Why Multi-Vector instead of a single embedding

A single average vector of all keywords loses information:

| Problem | Solution in l3mcore |
|---|---|
| Dispersed keywords cancel each other out | `max_keyword`: any keyword can "win" alone |
| General intent not captured | `description`: complete semantic phrase |
| A rare keyword dominates the vector | `mean_keyword` + `top3_vote`: ask for consensus |

## Recommended Embedding Models

| Model | Size | Languages | Notes |
|---|---|---|---|
| `intfloat/multilingual-e5-small` | ~120 MB | 100+ | **Default.** Balanced. |
| `intfloat/multilingual-e5-base` | ~280 MB | 100+ | Higher accuracy, more RAM |
| `BAAI/bge-small-en-v1.5` | ~130 MB | English | Excellent if you only use English |
| `nomic-ai/nomic-embed-text-v1` | ~550 MB | English | High quality, heavier |

Changing the model only requires updating `model_path` in `config.json`.

## `classification` type Router

For advanced cases, you can train a fine-tuned BERT classifier:

```json
{
  "router_type": "classification",
  "model_path": "path/to/your-finetuned-bert-model"
}
```

The classification model directly predicts the expert label. It is faster in inference but less flexible — adding a new expert requires re-training the model.

## Non-ML Mode (`model_path: ""`)

```json
{
  "router_type": "embedding",
  "model_path": "",
  "keyword_fallback": true
}
```

Disables the ML router completely and uses only keyword matching with fuzzy matching. Useful for Raspberry Pi or very limited hardware.
