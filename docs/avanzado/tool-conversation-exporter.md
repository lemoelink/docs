---
id: tool-conversation-exporter
title: Tool Conversation Exporter
sidebar_position: 14
description: Exporta conversaciones a Markdown, JSON o texto plano.
---

# Tool Conversation Exporter

La herramienta `conversation_exporter` exporta la conversacion actual del usuario con el LLM a un archivo local. Soporta tres formatos: Markdown, JSON y texto plano.

## Configuracion

```json
{
  "conversation_exporter": {
    "enabled": true,
    "export_dir": "data/exports",
    "default_format": "markdown",
    "include_metadata": true
  }
}
```

| Parametro | Tipo | Default | Descripcion |
|---|---|---|---|
| `enabled` | bool | `false` | Activa/desactiva la herramienta |
| `export_dir` | string | `"data/exports"` | Directorio de exportaciones |
| `default_format` | string | `"markdown"` | Formato por defecto |
| `include_metadata` | bool | `true` | Incluye frontmatter con fecha, mensajes, formato |

---

## Herramientas Disponibles

1. `export_conversation(format, filename)`: Exporta la conversacion a un archivo.

---

## Formatos

| Formato | Extension | Descripcion |
|---|---|---|
| `markdown` | `.md` | Headers `## Usuario` / `## Asistente` |
| `json` | `.json` | Array de mensajes con roles (re-importable) |
| `text` | `.txt` | Texto plano, formato `[Rol]: contenido` |

---

## Ejemplos

**Exportar markdown**:
```json
{"name": "export_conversation", "parameters": {}}
```

**Exportar JSON con nombre**:
```json
{"name": "export_conversation", "parameters": {"format": "json", "filename": "mi_chat"}}
```

---

## Seguridad

- Mensajes de sistema (`role: system`) excluidos de la exportacion.
- Filenames sanitizados (sin caracteres especiales).
- Archivos guardados solo en `export_dir`.
- Se recomienda añadir `data/exports/` a `.gitignore`.
