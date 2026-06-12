---
id: plugins
title: Plugins System
sidebar_position: 2
description: How to create plugins to extend l3mcore with pre and post-processing hooks.
---

# Plugins System

l3mcore implements a plugin architecture based on **Hooks** that allows extending functionality without touching the core code.

## How it works

Any `.py` file in the `plugins/` folder is automatically imported when l3mcore starts. Plugins are **server-side interceptors** that can modify the request before the LLM sees it, or modify the response before it reaches the user, without relying on the LLM's inference capabilities.

```
lemoe/
└── plugins/
    ├── email_masker.py   ← loaded automatically
    ├── audit_logger.py   ← loaded automatically
    └── rag_enhancer.py   ← loaded automatically
```

:::info Silent Loading
If a plugin has syntax errors, l3mcore logs it and continues running without crashing.
:::

## Available Hooks

### `before_routing(prompt: str) -> str`

Executed **before** the ML router vectorizes the prompt.

**Uses**: PII masking, prompt injection blocking, RAG enrichment, automatic translation.

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

### `before_expert(messages: list, expert_config: dict) -> None`

Executed **right before** the inference call to the selected expert is made, having access to the full list of messages (history) and the expert's configuration dictionary.

**Uses**: Modifying messages specifically for certain backends (like `pii_masker`, which masks only if the expert is `api` or remote).

```python
def before_expert(messages: list, expert_config: dict) -> None:
    # Your logic here. Modify the 'messages' list in-place
    pass
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
    return prompt  # without modifying

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

## Best Practices

1. **Speed**: Hooks are synchronous. If you make HTTP requests, use low timeouts (≤2s).
2. **Error handling**: Always wrap in `try/except` and return the original input on failure.
3. **Independence**: Do not import internal l3mcore modules. Work with pure strings.
4. **Idempotence**: The `after_generation` hook might be called on streaming chunks — design with that in mind.

## Plugins Repository

The official l3mcore plugins are available on GitHub:

**[github.com/lemoelink/plugins](https://github.com/lemoelink/plugins)**

To install a plugin, download the corresponding `.py` file and copy it into the `plugins/` folder of your installation. The server will load it on the next start.

## Available Plugins

| Plugin | Repository | Hook | Description |
|---|---|---|---|
| [Multimodal Plugin (Images)](./plugin-image-router) | [image_router.py](https://github.com/lemoelink/plugins/blob/main/image_router.py) | `override_route` | Automatically routes image requests to a vision expert like LLaVA or GPT-4o. |
| [Date and Time Plugin](./plugin-system-time) | [system_time.py](https://github.com/lemoelink/plugins/blob/main/system_time.py) | `override_route` | Automatically injects the current local system date and time into the initial context. |
| [User Profile Plugin](./plugin-user-profile) | [user_profile.py](https://github.com/lemoelink/plugins/blob/main/user_profile.py) | `override_route` | Injects the user's preferences, name, and custom instructions into the initial context. |
| [Routing Transparency](./plugin-routing-transparency) | [routing_transparency.py](https://github.com/lemoelink/plugins/blob/main/routing_transparency.py) | `after_generation` | Appends which expert processed the response and its confidence level at the end of each response, making MoE routing visible to the user. |
| [Telemetry & Dashboard](./plugin-telemetry-dashboard) | [telemetry_dashboard.py](https://github.com/lemoelink/plugins/blob/main/telemetry_dashboard.py) | `after_generation` | Enables an interactive, real-time web dashboard to visualize requests, token estimation, average latencies, and estimated API costs. |
| [PII Masker](./plugin-pii-masker) | [pii_masker.py](https://github.com/lemoelink/plugins/blob/main/pii_masker.py) | `before_expert` | Hides sensitive personal information (ID, email, etc.) before sending it to the cloud. |
