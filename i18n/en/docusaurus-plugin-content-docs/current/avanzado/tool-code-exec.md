---
id: tool-code-exec
title: Tool Code Exec
sidebar_position: 12
description: Execute Python code in a secure sandbox.
---

# Tool Code Exec

The `code_exec` tool executes Python code in an isolated environment (sandbox). The LLM can write and execute code to solve math problems, process data, generate files, etc.

## Configuration

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

| Parameter | Type | Default | Description |
|---|---|---|---|
| `enabled` | bool | `false` | Enable/disable the tool |
| `timeout` | int | `10` | Maximum timeout in seconds (max: 30) |
| `max_output` | int | `8000` | Maximum characters in output |
| `restricted_modules` | list | `[...]` | Modules blocked in the sandbox |
| `allowed_modules` | list | `[]` | Modules allowed even if in restricted list |

---

## Available Tools

1. `execute_python(code)`: Execute Python code and return stdout/stderr or errors.

---

## Security

The sandbox applies the following restrictions:

- **Restricted modules**: subprocess, shutil, ctypes, socket, http, urllib, requests, paramiko, fabric, multiprocessing, threading, importlib, pathlib.
- **Timeout**: Code runs as a separate subprocess with configurable timeout.
- **Output limit**: stdout/stderr is truncated to prevent memory saturation.
- **No persistence**: Each execution runs in an isolated subprocess.
- **Temp files**: Cleaned up automatically after execution.

---

## Examples

```json
{"name": "execute_python", "parameters": {"code": "import math; print(math.factorial(10))"}}
```

Output: `3628800`

```json
{"name": "execute_python", "parameters": {"code": "print([x**2 for x in range(5)])"}}
```

Output: `[0, 1, 4, 9, 16]`
