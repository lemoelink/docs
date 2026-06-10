---
id: plugin-paperless-search
title: Paperless-ngx Search Plugin
sidebar_position: 6
description: How to use the paperless_search plugin to connect your local document manager with l3mcore's expert models.
---

# Paperless-ngx Search Plugin

The `paperless_search` plugin natively integrates your local Paperless-ngx document manager with l3mcore. It detects when a user makes a query about their documents, extracts and cleans the search terms, queries the Paperless-ngx database, injects the found document contents into the context window, and securely routes the request to the document expert (`document-expert`).

## The problem it solves

Integrating AI assistants with local document databases often suffers from two issues:
1. **False positives**: Creative or formatting requests (such as *"write a template of an invoice..."*) can be mistakenly classified as document searches, causing the injection of real documents and resulting in the leakage of user private information in the generated response.
2. **Routing isolation**: If the general semantic router has generic keywords assigned to the document expert (such as *"invoice"*), any creative query will end up in the document expert by mistake.

The `paperless_search` plugin resolves these issues by intercepting queries using a word exclusion list (`exclude_words`) before evaluating the semantic classifier, and interactively and exclusively routing requests to the document expert only after successfully injecting context.

---

## How it works

The plugin implements the `override_route` hook, running before the classifications of l3mcore's general semantic router.

```
Request arrives at l3mcore
        |
        v
Text normalization and evaluation of exclude_words
        |
        ├── If an excluded word matches (e.g. "template"):
        │   Returns None (continues to general creative/secure flow)
        |
        v
Semantic classification of search intent (LEMoEppc)
        |
        ├── If score is below similarity threshold:
        │   Returns None (continues to general flow)
        |
        v
Distillation of search terms (lemoe-query-distiller)
        |
        v
Query to local Paperless-ngx API and text retrieval
        |
        v
Injection of document content into the message history
        |
        v
Returns "document-expert" (securely forces the route)
```

---

## Requirements and Configuration

### 1. Enable the plugins directory

Ensure you have the `plugins/` folder enabled in the root of your l3mcore project.

### 2. Copy the plugin file

Copy the `paperless_search.py` file into the `plugins/` folder of your installation.

### 3. Configure parameters in config.json

Add the `paperless_search` section to your general configuration file `config/config.json`:

```json
{
  "paperless_search": {
    "paperless_url": "http://127.0.0.1:8000",
    "paperless_token": "your_api_token_here",
    "use_semantic_router": true,
    "similarity_threshold": 0.45,
    "max_results": 3,
    "exclude_words": ["crea", "inventa", "plantilla", "ficticia", "haz"]
  }
}
```

*Note: Remember to define the `document-expert` in your `config/experts.json` configuration using private internal keywords to avoid accidental access.*

---

## Verifying it works

When starting l3mcore, the system log should confirm that the plugin loaded successfully:

```
INFO - Loaded plugin: paperless_search
```

When a valid document search query is received, the log will record the terms extraction and context injection:

```
INFO - paperless_search: Consulta de busqueda detectada.
INFO - paperless_search: Terminos destilados: factura de shisha
INFO - paperless_search: Encontrados 1 documentos relevantes. Inyectando contexto...
INFO - paperless_search: Enrutando peticion de forma manual al experto document-expert
```

If an excluded word is detected, the plugin will abort the search immediately and securely:

```
INFO - paperless_search: Palabra excluida 'plantilla' detectada. Saltando busqueda en Paperless.
```

---

## Behavior with different inputs

| Input | Result |
|---|---|
| Query about real documents | Validates intent, extracts terms, searches Paperless-ngx, injects context, and returns `"document-expert"`. |
| Creative/template query with excluded word | Aborts execution at the start and returns `None`. |
| General query unrelated to documents | Local classifier determines there is no search intent and returns `None`. |
