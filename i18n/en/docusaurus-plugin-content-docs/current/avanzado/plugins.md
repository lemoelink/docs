---
id: plugins
title: Plugin System
sidebar_position: 2
description: How to create plugins to extend LEMoE with pre and post-processing hooks.
---

# Plugin System

LEMoE implements a plugin architecture based on **Hooks** that allows extending functionality without touching the core code.

## How it works

Any `.py` file in the `plugins/` folder is automatically imported when starting LEMoE.

```
lemoe/
└── plugins/
    ├── email_masker.py   ← loaded automatically
    ├── audit_logger.py   ← loaded automatically
    └── rag_enhancer.py   ← loaded automatically
```

:::info Silent loading
If a plugin has syntactic errors, LEMoE registers it in the log and continues working without crashing.
:::

## Available hooks

### `before_routing(prompt: str) -> str`

Executed **before** the ML router vectorizes the prompt.

**Uses**: PII censorship, prompt injection blocking, RAG enrichment, automatic translation.

```python
def before_routing(prompt: str) -> str:
    # Your logic here
    return modified_prompt  # must return string
```

### `after_generation(response: str) -> str`

Executed **after** the expert generates the response, before sending it to the client.

**Uses**: output formatting, response censorship, signature injection, JSON validation.

```python
def after_generation(response: str) -> str:
    # Your logic here
    return modified_response  # must return string
```

## Example: Data Masking (PII)

```python
# plugins/email_masker.py
import re

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'

def before_routing(prompt: str) -> str:
    """Hides emails before sending to the cloud model."""
    return re.sub(EMAIL_REGEX, '[HIDDEN_EMAIL]', prompt)

def after_generation(response: str) -> str:
    """Adds a note if the model mentions the placeholder."""
    if '[HIDDEN_EMAIL]' in response:
        response += "\n\n*(Email addresses have been protected for privacy.)*"
    return response
```

## Example: Audit Logger

```python
# plugins/audit_logger.py
import logging
from datetime import datetime

audit_log = logging.getLogger('lemoe.audit')

def before_routing(prompt: str) -> str:
    """Logs all requests to the audit log."""
    audit_log.info(f"[{datetime.now().isoformat()}] PROMPT_RECEIVED: {len(prompt)} chars")
    return prompt  # unmodified

def after_generation(response: str) -> str:
    audit_log.info(f"[{datetime.now().isoformat()}] RESPONSE_SENT: {len(response)} chars")
    return response
```

## Example: RAG Enrichment

```python
# plugins/rag_enhancer.py
import requests

RAG_API_URL = "http://localhost:8000/search"

def before_routing(prompt: str) -> str:
    """Adds relevant context from your knowledge base."""
    try:
        r = requests.post(RAG_API_URL, json={"query": prompt}, timeout=2)
        if r.ok:
            context = r.json().get("context", "")
            if context:
                return f"Relevant context:\n{context}\n\nQuestion: {prompt}"
    except Exception:
        pass  # If RAG fails, return the original prompt
    return prompt
```

## Best practices

1. **Speed**: Hooks are synchronous. If you make HTTP requests, use low timeouts (≤2s).
2. **Error handling**: Always wrap in `try/except` and return the original input in case of failure.
3. **Independence**: Do not import internal LEMoE modules. Work with pure strings.
4. **Idempotence**: The `after_generation` hook can be called in streaming chunks — design with that in mind.

## Plugin repository

Official LEMoE plugins are available on GitHub:

**[github.com/lemoelink/plugins](https://github.com/lemoelink/plugins)**

To install a plugin, download the corresponding `.py` file and copy it into the `plugins/` folder of your LEMoE installation. The server will load it on the next start.

## Available plugins

| Plugin | Repository | Hook | Description |
|---|---|---|---|
| [Multimodal Plugin (Images)](./plugin-image-router) | [image_router.py](https://github.com/lemoelink/plugins/blob/main/image_router.py) | `override_route` | Automatically routes image requests to a vision expert like LLaVA or GPT-4o. |
