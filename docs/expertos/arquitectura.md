---
id: arquitectura
title: Arquitectura del Sistema
sidebar_position: 1
description: Visión general de la arquitectura interna de l3mcore y su flujo de enrutamiento.
---

# Arquitectura del Sistema

l3mcore está diseñado como un sistema middleware modular. Se sitúa entre las aplicaciones cliente y los modelos de IA reales.

## Flujo de Alto Nivel

```mermaid
sequenceDiagram
    participant Client
    participant API Server
    participant Router
    participant Dispatcher
    participant Backend

    Client->>API Server: POST /v1/chat/completions
    API Server->>API Server: Validar tamaño, Rate Limit, Sanitizar
    API Server->>Router: Analizar Prompt
    Router-->>API Server: Devuelve Etiqueta del Experto
    API Server->>Dispatcher: Enruta la petición al Experto
    Dispatcher->>Backend: Ejecuta Inferencia (Ollama/API/Local)
    Backend-->>Dispatcher: Transmite tokens (stream)
    Dispatcher-->>Client: Transmite tokens al cliente
```

1. **Petición del Cliente**: HTTP al servidor API de l3mcore
2. **Seguridad y Validación**: validación de tamaño, rate limit, sanitización
3. **Enrutamiento**: el Router analiza el prompt y determina el experto
4. **Despacho**: el Expert Dispatcher reenvía al backend correcto
5. **Respuesta**: streaming directo al cliente

---

## El Motor de Enrutamiento (3 niveles)

```mermaid
graph TD
    A[Petición del Usuario] --> B{¿Router ML Disponible?}
    B -- Sí --> C[Calcular Embeddings y Softmax]
    B -- No --> F
    C --> D{¿Puntuación >= Umbral?}
    D -- Sí --> E[Despachar al Experto]
    D -- No --> F[Respaldo de Keywords y Fuzzy]
    F --> G{¿Hay Coincidencia?}
    G -- Sí --> E
    G -- No --> H[Modelo de Fallback General]
```

### Nivel 1: Machine Learning (Principal)

Usa embeddings de texto con `SentenceTransformers` para convertir prompts en vectores matemáticos y compararlos con cada experto.

**Sistema de Puntuación Híbrido** (por experto):
- Pre-calcula vectores individuales de cada keyword
- Pre-calcula el centroide normalizado de todas las keywords  
- Pre-calcula el vector de la descripción del experto

En cada petición, compara el prompt contra estos vectores con 4 señales:

| Señal | Peso por defecto | Qué mide |
|---|---|---|
| `max_keyword` | 40% | Máxima similitud con cualquier keyword individual |
| `description` | 30% | Similitud con la descripción del experto |
| `mean_keyword` | 20% | Similitud media con todas las keywords |
| `top3_vote` | 10% | Consenso: fracción de top-3 keywords sobre umbral 0.4 |

Las puntuaciones se normalizan con **Softmax** para obtener una distribución de probabilidad real.

### Nivel 2: Respaldo de Keywords y Fuzzy

Si el ML no está disponible o la puntuación es inferior al `confidence_threshold`, usa `rapidfuzz`:

- **Solapamiento exacto de tokens**: palabras idénticas
- **Fuzzy matching**: coincidencia parcial para errores tipográficos o conjugaciones

### Nivel 3: Fallback General

Si nadie supera el umbral de fallback, la petición va al modelo designado como `"fallback": true` en `experts.json` (normalmente un modelo de propósito general).

---

## El Expert Dispatcher

```mermaid
graph LR
    A[Expert Dispatcher] --> B{Tipo de Experto}
    B -- api --> C[LiteLLM Provider]
    C --> D[OpenAI / Anthropic / Gemini]
    B -- ollama --> E[Instancia Ollama]
    B -- local --> F[SpecificModelRunner]
    F --> G[ONNX / GGUF en RAM]
```

El Dispatcher abstrae la complejidad de cada backend e instancia el runner correcto según el `type` del experto.
