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
| `id` | Sí | Identificador numérico único. |
| `label` | Sí | Nombre del experto. Solo alfanumérico, guiones y guiones bajos. Se usa como nombre de modelo en la API. |
| `description` | Sí | Frase en lenguaje natural que describe qué maneja el experto. Se vectoriza y aporta el 30% al score. |
| `keywords` | Sí | Lista de términos que el usuario podría escribir. **Mínimo 15.** |
| `type` | Sí | Backend: `"ollama"`, `"api"` o `"local"`. Ver [Modelos](/configuracion/modelos). |

## Reglas críticas para keywords

:::danger Mínimo 15 keywords por experto
El sistema de puntuación multi-vector necesita suficiente cobertura. Con menos de 15 keywords obtendrás enrutamiento impreciso.
:::

1. **Términos concretos, no categorías abstractas**
   - Correcto: `"sql"`, `"query"`, `"select"`, `"join"`, `"trigger"`
   - Incorrecto: `"base de datos"`, `"datos"`, `"informacion"`

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

El experto de `fallback` (con ID `0`) es **obligatorio** en todos los archivos `experts.json`. 
No lleva la propiedad `keywords`, ya que se activa automáticamente por descarte: cuando ningún experto supera el `confidence_threshold` del enrutador, o si no hay coincidencia de keywords, el sistema redirige la petición a este modelo.

```json
{
  "id": 0,
  "label": "fallback",
  "description": "Modelo de propósito general para cuando el router no puede clasificar el prompt.",
  "type": "local",
  "format": "gguf",
  "model_path": "models/Qwen3.5-0.8B-Q4_K_M.gguf"
}
```

A diferencia de los demás expertos, el campo `keywords` no es necesario ni permitido para el `fallback`. Puedes configurarlo para usar Ollama, APIs externas o modelos locales GGUF, exactamente igual que cualquier otro experto.
