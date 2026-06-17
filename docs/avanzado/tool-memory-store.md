---
id: tool-memory-store
title: Tool Memory Store
sidebar_position: 13
description: Memoria persistente key-value entre sesiones.
---

# Tool Memory Store

La herramienta `memory_store` almacena pares key-value de forma persistente en disco. Permite al LLM recordar informacion entre sesiones: nombre del usuario, preferencias, contexto previo, etc.

## Configuracion

```json
{
  "memory_store": {
    "enabled": true,
    "store_path": "data/memory_store.json",
    "max_entries": 1000,
    "max_key_len": 128,
    "max_value_len": 50000,
    "ttl_days": 0
  }
}
```

| Parametro | Tipo | Default | Descripcion |
|---|---|---|---|
| `enabled` | bool | `false` | Activa/desactiva la herramienta |
| `store_path` | string | `"data/memory_store.json"` | Ruta del archivo JSON de almacenamiento |
| `max_entries` | int | `1000` | Numero maximo de entradas |
| `max_key_len` | int | `128` | Longitud maxima de la clave |
| `max_value_len` | int | `50000` | Longitud maxima del valor (caracteres) |
| `ttl_days` | int | `0` | Dias antes de expirar (0 = sin TTL) |

---

## Herramientas Disponibles

1. `memory_store(key, value)`: Guarda un dato.
2. `memory_retrieve(key)`: Recupera un dato por su clave.
3. `memory_delete(key)`: Elimina un dato.
4. `memory_list()`: Lista todas las entradas.

---

## Almacenamiento

Los datos se guardan en `data/memory_store.json`:

```json
{
  "nombre_usuario": {
    "value": "Carlos",
    "created": 1750000000.0,
    "updated": 1750000000.0
  }
}
```

Flush a disco cada 5 segundos para reducir I/O.

---

## Ejemplos

**Guardar**: `"guarda en memoria que me llamo Carlos"`
```json
{"name": "memory_store", "parameters": {"key": "nombre_usuario", "value": "Carlos"}}
```

**Recuperar**: `"cual es mi nombre?"`
```json
{"name": "memory_retrieve", "parameters": {"key": "nombre_usuario"}}
```

---

## Seguridad

- Claves y valores sanitizados (sin path traversal).
- Valores truncados automaticamente a 50k caracteres.
- Maximo 1000 entradas por defecto.
- Acceso concurrente seguro (threading lock).
- Archivo JSON no contiene informacion critica por defecto.
- Se recomienda añadir `data/memory_store.json` a `.gitignore`.
