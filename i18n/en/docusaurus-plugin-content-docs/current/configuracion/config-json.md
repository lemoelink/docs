---
id: config-json
title: config.json — Router
sidebar_position: 1
description: Complete reference of the config/config.json file in l3mcore.
---

# `config.json` — Router Configuration

The `config/config.json` file controls the global behavior of the routing engine and the server.

:::tip Online Web Configurator
To make creating your configuration files easier, you can use the [l3mcore Online Configurator](http://config.lemoe.link/) to visually and intuitively generate your `experts.json` file.
:::

## Complete Structure

```json
{
    "router": {
        "mode": "generic",
        "router_type": "embedding",
        "model_path": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        "categories_file": "config/experts.json",
        "confidence_threshold": 0.4,
        "keyword_fallback": true,
        "softmax_temperature": 0.15,
        "scoring_weights": {
            "max_keyword":  0.40,
            "description":  0.30,
            "mean_keyword": 0.20,
            "top3_vote":    0.10
        }
    },
    "expert_runner": {
        "failure_webhook_url": "http://127.0.0.1:5000/webhook"
    }
}
```

## Parameter Reference

### Routing Parameters (`router`)

| Parameter | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `"generic"` | `"generic"` uses `experts.json`. `"model"` uses a custom classifier. |
| `router_type` | string | `"embedding"` | `"embedding"` for vector semantic search (recommended). `"classification"` for fine-tuned BERT model. |
| `model_path` | string | `"sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"` | HuggingFace repo or local path. Empty `""` to disable ML and use only keywords. |
| `categories_file` | string | `"config/experts.json"` | Path to the experts file. Must be inside the project (security). |
| `confidence_threshold` | float | `0.4` | Minimum probability to select an expert. If no one reaches it, fallbacks are used. |
| `keyword_fallback` | bool | `true` | Activates fuzzy matching if ML fails or falls below the threshold. |
| `softmax_temperature` | float | `0.15` | Controls the "decisiveness" of the router. Lower = more decisive. Higher = smoother. |
| `scoring_weights` | object | see below | Weights of the hybrid scoring formula. |
| `context_messages` | int | `3` | Number of recent user messages to concatenate for cascade routing when the last message has low confidence. |
| `context_max_chars` | int | `1600` | Maximum characters for the concatenated context text, to respect the token window of the embedding model. |

### Expert Runner Parameters (`expert_runner`)

| Parameter | Type | Default | Description |
|---|---|---|---|
| `failure_webhook_url` | string | `""` | HTTP URL to send a POST notification to when an expert fails and fallback is triggered (e.g. `{"event": "expert_failure", "expert": "label", "reason": "reason"}`). Leave blank to disable. |

## Weight Tuning (`scoring_weights`)

The four weights must add up to 1.0:

| Weight | Default | What it controls |
|---|---|---|
| `max_keyword` | 0.40 | Maximum similarity with any single keyword. Detects precise terms. |
| `description` | 0.30 | Similarity with the expert's description. Captures the general intent. |
| `mean_keyword` | 0.20 | Mean similarity with all keywords. Measures general domain coverage. |
| `top3_vote` | 0.10 | Fraction of the top 3 keywords above 0.4 threshold. Requires consensus. |

### Tuning Examples

**Prioritize exact matches of technical terms:**
```json
"scoring_weights": {
    "max_keyword": 0.55,
    "description": 0.20,
    "mean_keyword": 0.20,
    "top3_vote": 0.05
}
```

**Prioritize general semantic understanding:**
```json
"scoring_weights": {
    "max_keyword": 0.25,
    "description": 0.50,
    "mean_keyword": 0.20,
    "top3_vote": 0.05
}
```

## Softmax Temperature

The temperature controls how "confident" the router is when making a choice:

- `0.05 – 0.15` → Very decisive router, a single option dominates
- `0.20 – 0.35` → Balanced *(recommended)*
- `0.50+` → Differences between experts are smoothed out, may cause inaccurate routing

:::warning
Lowering the temperature too much (< 0.05) can make the router rigid and make bad choices in edge cases. Raise the `confidence_threshold` instead if you want more strictness.
:::
