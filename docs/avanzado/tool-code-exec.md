---
id: tool-code-exec
title: Tool Code Exec
sidebar_position: 12
description: Ejecuta codigo Python en un sandbox seguro.
---

# Tool Code Exec

La herramienta `code_exec` ejecuta codigo Python en un entorno aislado (sandbox). El LLM puede escribir y ejecutar codigo para resolver problemas matematicos, procesar datos, generar archivos, etc.

## Configuracion

```json
{
  "code_exec": {
    "enabled": true,
    "timeout": 10,
    "max_output": 8000,
    "restricted_modules": ["subprocess", "shutil", "ctypes", "socket", "http", "urllib", "requests"]
  }
}
```

| Parametro | Tipo | Default | Descripcion |
|---|---|---|---|
| `enabled` | bool | `false` | Activa/desactiva la herramienta |
| `timeout` | int | `10` | Timeout maximo en segundos (max: 30) |
| `max_output` | int | `8000` | Caracteres maximos en la salida |
| `restricted_modules` | list | `[...]` | Modulos bloqueados en el sandbox |
| `allowed_modules` | list | `[]` | Modulos permitidos aunque esten en la lista restringida |

---

## Herramientas Disponibles

1. `execute_python(code)`: Ejecuta codigo Python y devuelve stdout/stderr o errores.

---

## Seguridad

El sandbox aplica las siguientes restricciones:

- **Modulos restringidos**: subprocess, shutil, ctypes, socket, http, urllib, requests, paramiko, fabric, multiprocessing, threading, importlib, pathlib.
- **Timeout**: El codigo se ejecuta como subprocess separado con timeout configurable.
- **Salida limitada**: stdout/stderr se trunca para evitar saturar la memoria.
- **Sin persistencia**: Cada ejecucion corre en un subprocess aislado.
- **Temp files**: Se limpian automaticamente tras la ejecucion.

---

## Ejemplos

```json
{"name": "execute_python", "parameters": {"code": "import math; print(math.factorial(10))"}}
```

Salida: `3628800`

```json
{"name": "execute_python", "parameters": {"code": "print([x**2 for x in range(5)])"}}
```

Salida: `[0, 1, 4, 9, 16]`
