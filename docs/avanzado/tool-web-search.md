---
id: tool-web-search
title: Tool Web Search
sidebar_position: 11
description: Busca informacion en internet via DuckDuckGo o SearXNG.
---

# Tool Web Search

La herramienta `web_search` permite a l3mcore buscar informacion en internet en tiempo real. Utiliza DuckDuckGo como motor por defecto (sin API key) o SearXNG auto-hospedado.

## Configuracion

```json
{
  "web_search": {
    "enabled": true,
    "provider": "duckduckgo",
    "searxng_url": "",
    "num_results": 5,
    "timeout": 10,
    "safe_search": "moderate",
    "language": "es"
  }
}
```

| Parametro | Tipo | Default | Descripcion |
|---|---|---|---|
| `enabled` | bool | `false` | Activa/desactiva la herramienta |
| `provider` | string | `"duckduckgo"` | Motor de busqueda: `"duckduckgo"` o `"searxng"` |
| `searxng_url` | string | `""` | URL de instancia SearXNG (si provider=searxng) |
| `num_results` | int | `5` | Numero maximo de resultados |
| `timeout` | int | `10` | Timeout HTTP en segundos |
| `safe_search` | string | `"moderate"` | Filtro: `"off"`, `"moderate"`, `"strict"` |
| `language` | string | `"es"` | Idioma ISO 639-1 |

---

## Dependencias

```bash
pip install duckduckgo-search
```

---

## Herramientas Disponibles

1. `web_search(query, num_results)`: Busca en internet y devuelve titulos, URLs y snippets.

---

## Providers

### DuckDuckGo (por defecto)
- Sin API key ni configuracion adicional.
- Busqueda anonima, sin rate limits estrictos.
- Recomendado para uso local.

### SearXNG
- Requiere instancia self-hosted.
- Mas rapido y privado.
- Configuracion: `docker run -d -p 8888:8080 searxng/searxng`

---

## Seguridad

- Queries limitadas a 500 caracteres.
- Sin acceso a redes internas (SSRF protegido por DuckDuckGo).
- Sin envio de datos personales a servicios externos.
