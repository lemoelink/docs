---
id: tool-paperless-search
title: Tool Paperless Search
sidebar_position: 20
description: Conecta l3mcore con tu instancia local de Paperless-ngx para buscar e inyectar documentos como contexto de forma privada.
---

# Tool Paperless Search

La herramienta `paperless_search` conecta l3mcore con la API de [Paperless-ngx](https://docs.paperless-ngx.com/) para buscar y recuperar el texto extraído (OCR) de tus facturas, contratos, recibos y documentos personales de forma local y automatizada.

## Dependencias

Esta herramienta no requiere librerías externas adicionales. Utiliza `requests` que ya viene incluido en los requerimientos básicos de l3mcore.

---

## Configuración

Para utilizar esta herramienta, necesitas tener una instancia de Paperless-ngx funcionando y generar un token de API desde su panel de administración (en la sección del perfil de usuario).

Añade la configuración en tu archivo `config/config.json`:

```json
{
  "paperless": {
    "api_url": "http://192.168.1.100:8000/api/",
    "web_url": "http://192.168.1.100:8000/",
    "api_token": "tu_token_generado_aqui"
  }
}
```

Opcionalmente, puedes utilizar variables de entorno para mayor seguridad:
- `PAPERLESS_API_URL`
- `PAPERLESS_WEB_URL`
- `PAPERLESS_API_TOKEN`

---

## Herramientas Disponibles

La herramienta expone las siguientes funciones al LLM mediante la interfaz de Tool Calling:

1. `search_paperless(query)`: Busca en el archivo de Paperless basándose en las palabras clave proporcionadas y devuelve los títulos y los IDs de los documentos coincidentes.
2. `get_document_content(document_id)`: Obtiene el texto completo extraído del documento especificado, permitiendo al modelo analizar facturas o contratos de forma privada.

---

## Enrutamiento Inteligente

Además de funcionar como herramienta (Tool), este script también actúa como un **Plugin de Enrutamiento (Router Plugin)**. Inyecta el hook `override_route` para detectar automáticamente intenciones de búsqueda de documentos en el *prompt* del usuario (como "busca la factura de la luz" o "muéstrame el contrato de alquiler"). 

Cuando esto ocurre, redirige de forma transparente la solicitud al experto `document-expert` y le provee de estas herramientas, protegiendo tus datos y evitando enviarlos a APIs genéricas o de terceros no autorizados.
