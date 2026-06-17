---
id: plugin-image-router
title: Plugin Multimodal (Imagenes)
sidebar_position: 3
description: Como usar el plugin image_router para enrutar automaticamente peticiones con imagenes a un modelo de vision como LLaVA o GPT-4o.
---

# Plugin Multimodal — Enrutamiento de Imagenes

El plugin `image_router` detecta automaticamente cuando una peticion contiene una imagen y la devia al experto de vision configurado, sin que el router semantico tenga que intervenir.

## El problema que resuelve

El router de l3mcore esta disenado para trabajar con texto. Cuando un cliente como OpenWebUI adjunta una imagen, la envia embebida como un bloque base64 dentro del campo `content` del mensaje. Si esa peticion llegara al modelo de embeddings E5, produciria una puntuacion impredecible y el enrutamiento seria incorrecto.

El plugin intercepta esa peticion antes de que el router la vea y la redirige directamente al experto multimodal.

## Como funciona

El plugin implementa el hook `override_route`, que el sistema ejecuta antes de cualquier logica de enrutamiento semantico.

```
Peticion llega al servidor
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Detecta imagen? --> Devuelve "image-expert"
        |                              |
        |                              v
        |                    ExpertDispatcher -> Modelo de vision
        |
        └── No hay imagen? --> Devuelve None
                                       |
                                       v
                             Router semantico normal (E5)
```

### Reglas de deteccion

El plugin inspecciona los mensajes buscando objetos con el formato estandar de OpenAI:

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/png;base64,iVBORw0KGgoAAAA..."
  }
}
```

Para que la imagen sea aceptada, el campo `url` debe cumplir una de estas condiciones:

| Tipo de URL | Comportamiento |
|---|---|
| `data:image/<tipo>;base64,<datos>` | Aceptada si el formato es correcto |
| `https://` o `http://` | Aceptada con aviso en el log |
| `file://`, `ftp://` u otros | Rechazada, no activa el enrutamiento |
| Vacio o nulo | Rechazado, no activa el enrutamiento |

:::info Límites de inspección
Por rendimiento y seguridad, el plugin solo inspecciona los últimos 10 mensajes del historial y los primeros 20 fragmentos de contenido por mensaje. Estos valores son configurables.
:::

## Configuración avanzada

El plugin soporta las siguientes opciones en `config/config.json`:

```json
{
  "image_router": {
    "expert_label": "image-expert",
    "max_messages": 10,
    "max_parts_per_msg": 20,
    "max_url_len": 10000000,
    "allow_external_urls": false,
    "ssrf_protection": true,
    "reject_oversized_b64": true,
    "max_b64_bytes": 2097152
  }
}
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `expert_label` | string | `"image-expert"` | Label del experto de visión |
| `max_messages` | int | `10` | Mensajes máximos a inspeccionar |
| `max_parts_per_msg` | int | `20` | Fragmentos máximos por mensaje |
| `max_url_len` | int | `10000000` | Longitud máxima de URLs |
| `allow_external_urls` | bool | `false` | Permitir URLs externas (http/https) |
| `ssrf_protection` | bool | `true` | Bloquear IPs privadas en URLs externas |
| `reject_oversized_b64` | bool | `true` | Rechazar base64 que exceda el límite |
| `max_b64_bytes` | int | `2097152` | Tamaño máximo de payload base64 (2MB) |

## Requisitos

### 1. Modelo multimodal disponible

Necesitas un modelo capaz de procesar imagenes. Algunas opciones:

**Ollama (local):**
```bash
ollama pull llava
# o
ollama pull bakllava
```

**APIs externas:** GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.

### 2. Configurar el experto en experts.json

El plugin busca un experto con el label exacto `image-expert`. Debes crearlo en tu `config/experts.json`.

**Con Ollama local:**

```json
{
  "experts": [
    {
      "label": "image-expert",
      "type": "ollama",
      "model_name": "llava",
      "url": "http://127.0.0.1:11434",
      "system_prompt": "You are an expert visual assistant. Analyze and describe images in detail.",
      "keywords": ["imagen", "foto", "visual", "grafico", "captura", "diagrama"]
    }
  ]
}
```

**Con API externa (OpenAI):**

```json
{
  "experts": [
    {
      "label": "image-expert",
      "type": "api",
      "provider": "openai",
      "model_name": "gpt-4o",
      "api_key_env": "OPENAI_API_KEY",
      "system_prompt": "You are an expert visual assistant. Analyze and describe images in detail.",
      "keywords": ["image", "photo", "visual", "chart", "screenshot", "diagram"]
    }
  ]
}
```

### 3. Activar el directorio de plugins

Durante la instalacion con `setup.sh`, cuando se pregunte por el sistema de plugins, responde `y`. Esto crea el directorio `plugins/`.

Si ya tienes l3mcore instalado, puedes crearlo manualmente:

```bash
mkdir -p plugins
```

### 4. Descargar y colocar el plugin

Puedes obtener el plugin directamente desde el repositorio oficial:
* **Repositorio de plugins:** [github.com/lemoelink/plugins](https://github.com/lemoelink/plugins)
* **Descarga directa:** [image_router.py](https://github.com/lemoelink/plugins/blob/main/image_router.py)

Copia el fichero `image_router.py` en el directorio `plugins/` de tu instalación de l3mcore. El servidor lo cargará automáticamente en el próximo arranque.

## Verificar que funciona

Al arrancar el servidor, el log mostrara:

```
INFO - Loaded plugin: image_router
```

Cuando envies una peticion con imagen, veras:

```
INFO - image_router: image detected, forcing route to 'image-expert'.
INFO - Plugin forced route to: image-expert
```

## Comportamiento ante distintas entradas

| Entrada | Resultado |
|---|---|
| Solo texto | El plugin devuelve `None`. El router semantico actua con normalidad. |
| Imagen con data-URI valida | El plugin devia al experto `image-expert`. |
| Imagen con URL externa `https://` | Acepta y devia. Se registra un aviso en el log. |
| Data-URI con MIME no valido (`text/html`, etc.) | Rechazada. El router semantico actua. |
| Campo `url` vacio o nulo | Rechazado. El router semantico actua. |
| Si el experto `image-expert` no existe o falla | l3mcore usa el experto de fallback automaticamente. |

## Avisos en el log

El plugin escribe en el log del servidor bajo el prefijo `image_router:`. Si ves avisos como:

```
WARNING - image_router: data-URI does not match expected image/base64 format, skipping.
WARNING - image_router: external image URL detected (https://...).
WARNING - image_router: base64 payload is 612000 bytes (threshold 524288). This may overload the vision model.
```

El primer aviso indica que el cliente envio una imagen con formato incorrecto. El segundo es informativo cuando se usan URLs externas. El tercero aparece cuando una imagen es especialmente grande y puede tardar mas de lo habitual en procesarse.

## Limitaciones conocidas

- El plugin no descarga imagenes desde URLs externas. Las envia tal cual al modelo de vision, que puede o no soportar URLs directas segun el backend elegido. Si usas Ollama con LLaVA, usa data-URIs.
- El plugin no redimensiona imagenes. Si el modelo de vision tiene un limite de tamano de contexto bajo, images de alta resolucion pueden producir errores en el backend.
- Solo se activa con el formato multimodal de OpenAI (`"type": "image_url"`). El formato de Ollama nativo con imagenes en campo separado no esta soportado en esta version.
