---
id: experts-json
title: experts.json — Expertos
sidebar_position: 2
description: Referencia completa de experts.json para definir modelos especialistas en LEMoE.
---

# `experts.json` — Definición de Expertos

El archivo `config/experts.json` define la lista de modelos especialistas disponibles para el sistema.

## Estructura

```json
{
  "max_experts": 15,
  "experts": [
    {
      "id": 1,
      "label": "programador",
      "description": "Experto en escribir, revisar y depurar código fuente.",
      "keywords": [
        "codigo", "programar", "python", "javascript", "funcion",
        "script", "error", "bug", "html", "css", "clase", "objeto",
        "modulo", "api", "refactorizar"
      ],
      "type": "ollama",
      "url": "http://127.0.0.1:11434",
      "model_name": "qwen2.5:7b"
    }
  ]
}
```

## Campos de un experto

| Campo | Requerido | Descripción |
|---|---|---|
| `id` | ✅ | Identificador numérico único. |
| `label` | ✅ | Nombre del experto. Solo alfanumérico, guiones y guiones bajos. Se usa como nombre de modelo en la API. |
| `description` | ✅ | Frase en lenguaje natural que describe qué maneja el experto. Se vectoriza y aporta el 30% al score. |
| `keywords` | ✅ | Lista de términos que el usuario podría escribir. **Mínimo 15.** |
| `type` | ✅ | Backend: `"ollama"`, `"api"` o `"local"`. Ver [Modelos](/configuracion/modelos). |

## Reglas críticas para keywords

:::danger Mínimo 15 keywords por experto
El sistema de puntuación multi-vector necesita suficiente cobertura. Con menos de 15 keywords obtendrás enrutamiento impreciso.
:::

1. **Términos concretos, no categorías abstractas**
   - ✅ `"sql"`, `"query"`, `"select"`, `"join"`, `"trigger"`
   - ❌ `"base de datos"`, `"datos"`, `"informacion"`

2. **Palabras que el usuario realmente escribe en el prompt**
   - Incluye sinónimos, conjugaciones, errores comunes

3. **Sin solapamiento excesivo entre expertos**
   - Si dos expertos comparten muchas keywords idénticas, el router dudará entre ellos

## Ejemplo: Experto de escritura creativa

```json
{
  "id": 2,
  "label": "escritor_creativo",
  "description": "Experto escritor creativo, narrador y poeta.",
  "keywords": [
    "historia", "cuento", "poema", "relato", "novela",
    "personaje", "trama", "ficcion", "fantasia", "narrativa",
    "dialogo", "capitulo", "guion", "creatividad", "inspiracion",
    "protagonista", "villano", "escena", "argumento", "metafora"
  ],
  "type": "api",
  "provider": "openai",
  "model_name": "gpt-4o",
  "api_key_env": "OPENAI_API_KEY"
}
```

## Límite de expertos (`max_experts`)

Define el número máximo de expertos que puede cargar el sistema. Aumentarlo no tiene coste en CPU/RAM a menos que uses backends locales (ONNX/GGUF).

## Experto de fallback

Si ningún experto supera el `confidence_threshold`, el sistema busca un experto marcado como `"fallback": true` o usa el `AIEngine` interno.

```json
{
  "id": 99,
  "label": "general",
  "description": "Modelo de propósito general para consultas diversas.",
  "keywords": ["ayuda", "pregunta", "general", "info", "consulta", "duda", "explicar", "definir", "que", "como", "cuando", "donde", "por que", "quien", "cuanto"],
  "type": "ollama",
  "url": "http://127.0.0.1:11434",
  "model_name": "llama3.1:8b",
  "fallback": true
}
```
