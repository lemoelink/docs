---
id: tools
title: Sistema de Herramientas (Tools)
sidebar_position: 3
description: Soporte de Tool Calling / Function Calling nativo en l3mcore.
---

# Sistema de Herramientas (Tools)

A diferencia de los **Plugins** (que son interceptores de código en el servidor que modifican la petición antes de llegar a la IA), las **Tools (Herramientas)** son capacidades o funciones que se le entregan explícitamente al LLM. El modelo razona de forma autónoma y decide cuándo y qué herramientas ejecutar para responder a la consulta del usuario.

Las herramientas se ubican en la carpeta `tools/` de tu instalación (no en `plugins/`).

## Configuracion

Para activar el modo Tool Calling, añade la siguiente seccion a tu `config/config.json`:

```json
{
  "tool_calling": {
    "enabled": true,
    "expert_label": "document-expert",
    "max_iterations": 5
  }
}
```

### Parametros:
- `enabled`: Habilita (`true`) o deshabilita (`false`) el modo de ejecucion por herramientas.
- `expert_label`: El identificador del experto en `experts.json` que procesara la consulta inicial y decidira la llamada a herramientas. Debe ser un modelo compatible con tool calling.
- `max_iterations`: Numero maximo de ciclos de llamada/ejecucion de herramientas para evitar bucles infinitos (por defecto 5).

---

## Modelos Compatibles

Para usar Tool Calling, el experto configurado en `expert_label` debe soportar la definicion de herramientas:

| Backend | Modelos recomendados |
|---|---|
| **Ollama (Local)** | `llama3.1:8b`, `qwen2.5:7b`, `qwen2.5:14b` |
| **API Cloud (litellm)** | `gpt-4o`, `gpt-4o-mini`, `claude-3.5-sonnet`, `gemini-1.5-pro` |

---

## Contrato de Tools

Cualquier script en la carpeta `tools/` puede registrar herramientas para el LLM implementando dos funciones:

### 1. `get_tools() -> list`
Devuelve la lista de especificaciones de herramientas en formato OpenAI/JSON Schema.

```python
def get_tools() -> list:
    return [
        {
            "type": "function",
            "function": {
                "name": "nombre_de_herramienta",
                "description": "Explicacion de cuando usar esta herramienta",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "parametro": {
                            "type": "string",
                            "description": "Descripcion del parametro"
                        }
                    },
                    "required": ["parametro"]
                }
            }
        }
    ]
```

### 2. `execute_tool(tool_name: str, arguments: dict) -> str | None`
Ejecuta la logica de la herramienta especificada y retorna su resultado como una cadena de texto.

```python
def execute_tool(tool_name: str, arguments: dict) -> str | None:
    if tool_name == "nombre_de_herramienta":
        param = arguments.get("parametro")
        # Logica del plugin
        return f"Resultado con el parametro: {param}"
    return None
```

Si el script no reconoce el `tool_name`, debe retornar `None` para permitir que otros scripts lo procesen.

---

## Limpieza de Salidas y Posprocesamiento

l3mcore implementa mecanismos de limpieza automáticos para garantizar que las respuestas entregadas al usuario sean conversacionales y directas:

- **Desactivación de Enrutamiento Clásico**: Cuando el modo Tool Calling está habilitado, los interceptores clásicos (`override_route`) se desactivan automáticamente para evitar ejecuciones duplicadas de herramientas y prevenir que el prompt del usuario se contamine con consultas técnicas o bloques de depuración.
- **Filtro de Bloques JSON**: El servidor posprocesa la respuesta final del asistente eliminando cualquier cadena o bloque JSON de llamadas a herramientas generado por el modelo de lenguaje (por ejemplo, `{"name": "...", "parameters": {...}}`).
- **Ocultación de Consultas Técnicas**: Las herramientas integradas como `ask_database` no incluyen sentencias técnicas (como consultas SQL) en sus respuestas a menos que se le solicite expresamente, asegurando que el LLM solo devuelva la respuesta interpretada en lenguaje natural.

