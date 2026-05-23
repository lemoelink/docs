---
id: config-json
title: config.json — Router
sidebar_position: 1
description: Referencia completa del archivo config/config.json de LEMoE.
---

# `config.json` — Configuración del Router

El archivo `config/config.json` controla el comportamiento global del motor de enrutamiento y del servidor.

:::tip Configurador Web Online
Para facilitar la creación de tus archivos de configuración, puedes utilizar el [Configurador Online de LEMoE](http://config.lemoe.link/) para generar de forma visual e intuitiva tus archivos `config.json` y `experts.json`.
:::

## Estructura completa

```json
{
    "router": {
        "mode": "generic",
        "router_type": "embedding",
        "model_path": "intfloat/multilingual-e5-small",
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
    }
}
```

## Referencia de parámetros

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `mode` | string | `"generic"` | `"generic"` usa `experts.json`. `"model"` usa un clasificador propio. |
| `router_type` | string | `"embedding"` | `"embedding"` para búsqueda semántica vectorial (recomendado). `"classification"` para modelo BERT fine-tuned. |
| `model_path` | string | `"intfloat/multilingual-e5-small"` | Repo HuggingFace o ruta local. Vacío `""` para deshabilitar ML y usar solo keywords. |
| `categories_file` | string | `"config/experts.json"` | Ruta al archivo de expertos. Debe estar dentro del proyecto (seguridad). |
| `confidence_threshold` | float | `0.4` | Probabilidad mínima para seleccionar un experto. Si nadie la alcanza, se usan fallbacks. |
| `keyword_fallback` | bool | `true` | Activa matching difuso si el ML falla o queda por debajo del umbral. |
| `softmax_temperature` | float | `0.15` | Controla la "decisividad" del router. Más bajo → más decisivo. Más alto → más suave. |
| `scoring_weights` | object | ver abajo | Pesos de la fórmula híbrida de puntuación. |

## Ajuste de pesos (`scoring_weights`)

Los cuatro pesos deben sumar 1.0:

| Peso | Por defecto | Qué controla |
|---|---|---|
| `max_keyword` | 0.40 | Similitud máxima con cualquier keyword individual. Detecta términos precisos. |
| `description` | 0.30 | Similitud con la descripción del experto. Captura la intención general. |
| `mean_keyword` | 0.20 | Similitud media con todas las keywords. Mide cobertura general del dominio. |
| `top3_vote` | 0.10 | Fracción de las 3 mejores keywords sobre umbral 0.4. Requiere consenso. |

### Ejemplos de ajuste

**Priorizar coincidencias exactas de términos técnicos:**
```json
"scoring_weights": {
    "max_keyword": 0.55,
    "description": 0.20,
    "mean_keyword": 0.20,
    "top3_vote": 0.05
}
```

**Priorizar comprensión semántica general:**
```json
"scoring_weights": {
    "max_keyword": 0.25,
    "description": 0.50,
    "mean_keyword": 0.20,
    "top3_vote": 0.05
}
```

## Temperatura Softmax

La temperatura controla qué tan "seguro" es el router al elegir:

- `0.05 – 0.15` → Router muy decisivo, una sola opción domina
- `0.20 – 0.35` → Equilibrado *(recomendado)*
- `0.50+` → Las diferencias entre expertos se suavizan, puede causar enrutamiento impreciso

:::warning
Bajar demasiado la temperatura (< 0.05) puede hacer que el router sea rígido y elija mal en casos límite. Sube el `confidence_threshold` en su lugar si quieres más rigor.
:::
