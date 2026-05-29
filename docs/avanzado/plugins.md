---
id: plugins
title: Sistema de Plugins
sidebar_position: 2
description: Cómo crear plugins para extender LEMoE con hooks de pre y post-procesamiento.
---

# Sistema de Plugins

LEMoE implementa una arquitectura de plugins basada en **Hooks** que permite extender la funcionalidad sin tocar el código central.

## Cómo funciona

Cualquier archivo `.py` en la carpeta `plugins/` se importa automáticamente al arrancar LEMoE.

```
lemoe/
└── plugins/
    ├── email_masker.py   ← se carga automáticamente
    ├── audit_logger.py   ← se carga automáticamente
    └── rag_enhancer.py   ← se carga automáticamente
```

:::info Carga silenciosa
Si un plugin tiene errores sintácticos, LEMoE lo registra en el log y continúa funcionando sin colapsar.
:::

## Hooks disponibles

### `before_routing(prompt: str) -> str`

Se ejecuta **antes** de que el router ML vectorice el prompt.

**Usos**: censura PII, bloqueo de prompt injection, enriquecimiento RAG, traducción automática.

```python
def before_routing(prompt: str) -> str:
    # Tu lógica aquí
    return modified_prompt  # debe devolver string
```

### `after_generation(response: str) -> str`

Se ejecuta **después** de que el experto genera la respuesta, antes de enviarla al cliente.

**Usos**: formateo de salida, censura de respuestas, inyección de firmas, validación JSON.

```python
def after_generation(response: str) -> str:
    # Tu lógica aquí
    return modified_response  # debe devolver string
```

## Ejemplo: Data Masking (PII)

```python
# plugins/email_masker.py
import re

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'

def before_routing(prompt: str) -> str:
    """Oculta emails antes de enviar al modelo cloud."""
    return re.sub(EMAIL_REGEX, '[EMAIL_OCULTO]', prompt)

def after_generation(response: str) -> str:
    """Añade nota si el modelo menciona el placeholder."""
    if '[EMAIL_OCULTO]' in response:
        response += "\n\n*(Se han protegido direcciones de correo por privacidad.)*"
    return response
```

## Ejemplo: Audit Logger

```python
# plugins/audit_logger.py
import logging
from datetime import datetime

audit_log = logging.getLogger('lemoe.audit')

def before_routing(prompt: str) -> str:
    """Registra todas las peticiones en el log de auditoría."""
    audit_log.info(f"[{datetime.now().isoformat()}] PROMPT_RECEIVED: {len(prompt)} chars")
    return prompt  # sin modificar

def after_generation(response: str) -> str:
    audit_log.info(f"[{datetime.now().isoformat()}] RESPONSE_SENT: {len(response)} chars")
    return response
```

## Ejemplo: Enriquecimiento RAG

```python
# plugins/rag_enhancer.py
import requests

RAG_API_URL = "http://localhost:8000/search"

def before_routing(prompt: str) -> str:
    """Añade contexto relevante desde tu base de conocimiento."""
    try:
        r = requests.post(RAG_API_URL, json={"query": prompt}, timeout=2)
        if r.ok:
            context = r.json().get("context", "")
            if context:
                return f"Contexto relevante:\n{context}\n\nPregunta: {prompt}"
    except Exception:
        pass  # Si el RAG falla, devuelve el prompt original
    return prompt
```

## Mejores prácticas

1. **Velocidad**: Los hooks son síncronos. Si haces requests HTTP, usa timeouts bajos (≤2s).
2. **Manejo de errores**: Siempre envuelve en `try/except` y devuelve el input original en caso de fallo.
3. **Independencia**: No importes módulos internos de LEMoE. Trabaja con strings puros.
4. **Idempotencia**: El hook `after_generation` puede llamarse en chunks de streaming — diseña pensando en eso.

## Plugins disponibles

| Plugin | Hook | Descripcion |
|---|---|---|
| [Plugin Multimodal (Imagenes)](./plugin-image-router) | `override_route` | Enruta automaticamente peticiones con imagenes a un experto de vision como LLaVA o GPT-4o. |
