---
id: plugin-image-router
title: Multimodal Plugin (Images)
sidebar_position: 3
description: How to use the image_router plugin to automatically route image requests to a vision model like LLaVA or GPT-4o.
---

# Multimodal Plugin — Image Routing

The `image_router` plugin automatically detects when a request contains an image and routes it to the configured vision expert, without the semantic router needing to intervene.

## The problem it solves

LEMoE's router is designed to work with text. When a client like OpenWebUI attaches an image, it is sent embedded as a base64 block inside the message `content` field. If that request reached the E5 embedding model, it would produce an unpredictable score and routing would be incorrect.

The plugin intercepts that request before the router sees it and redirects it directly to the multimodal expert.

## How it works

The plugin implements the `override_route` hook, which the system executes before any semantic routing logic.

```
Request arrives at server
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Image detected? --> Returns "image-expert"
        |                              |
        |                              v
        |                    ExpertDispatcher -> Vision model
        |
        └── No image? --> Returns None
                                  |
                                  v
                        Normal semantic router (E5)
```

### Detection rules

The plugin inspects messages looking for objects in the standard OpenAI multimodal format:

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/png;base64,iVBORw0KGgoAAAA..."
  }
}
```

For the image to be accepted, the `url` field must meet one of these conditions:

| URL type | Behavior |
|---|---|
| `data:image/<type>;base64,<data>` | Accepted if the format is correct |
| `https://` or `http://` | Accepted with a warning in the log |
| `file://`, `ftp://` or other | Rejected, does not activate routing |
| Empty or null | Rejected, does not activate routing |

:::info Inspection limit
For performance and security, the plugin only inspects the last 10 messages in the history and the first 20 content parts per message.
:::

## Requirements

### 1. A multimodal model available

You need a model capable of processing images. Some options:

**Ollama (local):**
```bash
ollama pull llava
# or
ollama pull bakllava
```

**External APIs:** GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.

### 2. Configure the expert in experts.json

The plugin looks for an expert with the exact label `image-expert`. You must create it in your `config/experts.json`.

**With local Ollama:**

```json
{
  "experts": [
    {
      "label": "image-expert",
      "type": "ollama",
      "model_name": "llava",
      "url": "http://127.0.0.1:11434",
      "system_prompt": "You are an expert visual assistant. Analyze and describe images in detail.",
      "keywords": ["image", "photo", "visual", "chart", "screenshot", "diagram"]
    }
  ]
}
```

**With external API (OpenAI):**

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

### 3. Enable the plugins directory

During installation with `setup.sh`, when asked about the plugin system, answer `y`. This creates the `plugins/` directory.

If you already have LEMoE installed, you can create it manually:

```bash
mkdir -p plugins
```

### 4. Place the plugin

Copy the `image_router.py` file into the `plugins/` directory of your LEMoE installation. The server will load it automatically on the next start.

## Verifying it works

When starting the server, the log will show:

```
INFO - Loaded plugin: image_router
```

When you send a request with an image, you will see:

```
INFO - image_router: image detected, forcing route to 'image-expert'.
INFO - Plugin forced route to: image-expert
```

## Behavior with different inputs

| Input | Result |
|---|---|
| Text only | Plugin returns `None`. Semantic router acts normally. |
| Image with valid data-URI | Plugin routes to the `image-expert` expert. |
| Image with external `https://` URL | Accepted and routed. A warning is logged. |
| Data-URI with invalid MIME (`text/html`, etc.) | Rejected. Semantic router acts. |
| Empty or null `url` field | Rejected. Semantic router acts. |
| If the `image-expert` expert does not exist or fails | LEMoE uses the fallback expert automatically. |

## Log warnings

The plugin writes to the server log under the `image_router:` prefix. If you see warnings like:

```
WARNING - image_router: data-URI does not match expected image/base64 format, skipping.
WARNING - image_router: external image URL detected (https://...).
WARNING - image_router: base64 payload is 612000 bytes (threshold 524288). This may overload the vision model.
```

The first warning indicates the client sent an image with an incorrect format. The second is informational when external URLs are used. The third appears when an image is particularly large and may take longer than usual to process.

## Known limitations

- The plugin does not download images from external URLs. It sends them as-is to the vision model, which may or may not support direct URLs depending on the chosen backend. If using Ollama with LLaVA, use data-URIs.
- The plugin does not resize images. If the vision model has a low context size limit, high-resolution images may produce errors in the backend.
- Only activates with the OpenAI multimodal format (`"type": "image_url"`). The native Ollama format with images in a separate field is not supported in this version.
