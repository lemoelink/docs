---
id: seguridad
title: Security
sidebar_position: 2
description: Security features built into the LEMoE server.
---

# Security

LEMoE includes several layers of protection designed for near-production deployments.

## Rate Limiting

A **sliding window** rate limiter blocks 60 requests per minute per IP address.

- Returns **HTTP 429** when exceeded
- Respects the `X-Forwarded-For` header (safe behind reverse proxies)
- Configurable in `api_server.py`

```python
# api_server.py — adjust limit
RATE_LIMIT = 60  # requests per minute
```

## Payload Limits

Request bodies are limited to **1 MB** to prevent memory exhaustion DoS attacks.

## SSRF Protection

The Expert Dispatcher validates Ollama backend URLs before making requests:

| URL | Status |
|---|---|
| `http://127.0.0.1:11434` | Allowed |
| `http://192.168.x.x` | Allowed (private LAN) |
| `http://10.x.x.x` | Allowed (internal network) |
| `http://169.254.169.254` | **Blocked** (AWS/GCP metadata) |
| `http://metadata.google.internal` | **Blocked** |

## Label Validation

Expert labels in `experts.json` are validated before being used in system paths:

- Alphanumeric, hyphens, and underscores only
- Prevents **path traversal** attacks (`../`, `/etc/passwd`, etc.)

```
Allowed: "programmer", "coder-v2", "data_analyst"
Blocked: "../../../etc/passwd", "model/evil", "label with spaces"
```

## Log Sanitization

User prompts are cleaned before being written to logs:

- Control characters are removed
- ANSI escape sequences are removed
- Prevents **log injection attacks**

## Secure Deployment

For production, we recommend:

```nginx
# Example Nginx reverse proxy
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:11435;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;

        # Additional authentication (optional)
        # auth_basic "LEMoE API";
        # auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```
