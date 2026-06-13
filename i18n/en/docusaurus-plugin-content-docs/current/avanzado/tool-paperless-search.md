---
id: tool-paperless-search
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

### 3. Environment Variables Configuration (.env)

To avoid exposing access credentials and tokens in your code or shared configuration files, the plugin preferentially reads credentials from environment variables. You can define them in your `.env` file at the root of the project:

```env
# Internal API URL that LeMoE will use to perform searches
PAPERLESS_API_URL=http://localhost:8000

# Public URL that the user's browser will use to open/download documents
PAPERLESS_WEB_URL=http://localhost:8000

# API Token generated in the Paperless administration panel
PAPERLESS_API_TOKEN=your_secret_api_token_here
```

*Note: If you run LeMoE inside a Docker container and Paperless in another, the `PAPERLESS_API_URL` variable should point to the Paperless container (e.g. `http://paperless-webserver:8000`), while `PAPERLESS_WEB_URL` should point to the address accessible from your browser (e.g. `http://localhost:8000`).*

### 4. Configure additional parameters in config.json

Classification parameters and exclusion words are defined in the `config/config.json` file. If the environment variables above are not defined, the plugin will optionally attempt to read them from this file:

```json
{
  "paperless_search": {
    "api_url": "http://localhost:8000",
    "api_token": "your_api_token_here",
    "use_semantic_router": true,
    "similarity_threshold": 0.45,
    "max_results": 3,
    "exclude_words": ["crea", "inventa", "plantilla", "ficticia", "haz"]
  }
}
```

*Note: Remember to define the `document-expert` in your `config/experts.json` configuration using private internal keywords to avoid accidental access from the general router.*

---

## Docker Compose Deployment (Full Stack)

If you want to deploy LeMoE, Ollama (for local LLM execution), and Paperless-ngx (with its database and local broker) together, you can use the following example `docker-compose.yml` file.

Create a file named `docker-compose-paperless.yml` in the root of your l3mcore installation with the following content:

```yaml
version: '3.8'

services:
  l3mcore:
    build:
      context: .
      dockerfile: private/docker/Dockerfile
    container_name: l3mcore
    ports:
      - "11435:11435"
    env_file:
      - .env
    volumes:
      - ./config:/app/config
      - ./plugins:/app/plugins
      - ./logs:/app/logs
    depends_on:
      - ollama
      - paperless-webserver
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  paperless-webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    container_name: paperless-webserver
    restart: unless-stopped
    depends_on:
      - paperless-redis
    ports:
      - "8000:8000"
    volumes:
      - paperless_data:/usr/src/paperless/data
      - paperless_media:/usr/src/paperless/media
      - paperless_export:/usr/src/paperless/export
      - paperless_consume:/usr/src/paperless/consume
    environment:
      - PAPERLESS_REDIS=redis://paperless-redis:6379
      - PAPERLESS_URL=http://localhost:8000
      - PAPERLESS_TIME_ZONE=Europe/Madrid
      - PAPERLESS_OCR_LANGUAGE=spa

  paperless-redis:
    image: redis:7-alpine
    container_name: paperless-redis
    restart: unless-stopped

volumes:
  ollama_data:
  paperless_data:
  paperless_media:
  paperless_export:
  paperless_consume:
```

To start deploying the entire local infrastructure, create your `.env` file with the credentials indicated in the previous section and run the command:

```bash
docker compose -f docker-compose-paperless.yml up -d
```

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
