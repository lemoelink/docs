---
id: seguridad
title: Seguridad
sidebar_position: 2
description: Características de seguridad integradas en el servidor l3mcore.
---

# Seguridad

l3mcore incluye varias capas de protección diseñadas para despliegues cercanos a producción.

## Rate Limiting (Limitación de Tasa)

Un limitador de ventana deslizante (**sliding window**) bloquea 60 requests por minuto por dirección IP.

- Devuelve **HTTP 429** cuando se excede
- Respeta la cabecera `X-Forwarded-For` (seguro detrás de proxies reversos)
- Configurable en `api_server.py`

```python
# api_server.py — ajustar límite
RATE_LIMIT = 60  # requests por minuto
```

## Límites de Payload

Los cuerpos de las peticiones están limitados a **1 MB** para prevenir ataques DoS por agotamiento de memoria.

## Protección SSRF

El Expert Dispatcher valida las URLs de los backends Ollama antes de hacer peticiones:

| URL | Estado |
|---|---|
| `http://127.0.0.1:11434` | Permitida |
| `http://192.168.x.x` | Permitida (LAN privada) |
| `http://10.x.x.x` | Permitida (red interna) |
| `http://169.254.169.254` | **Bloqueada** (metadata AWS/GCP) |
| `http://metadata.google.internal` | **Bloqueada** |

## Validación de Labels

Los labels de los expertos en `experts.json` son validados antes de usarse en rutas del sistema:

- Solo alfanumérico, guiones y guiones bajos
- Previene ataques de **path traversal** (`../`, `/etc/passwd`, etc.)

```
Permitidos: "programador", "coder-v2", "analista_datos"
Bloqueados: "../../../etc/passwd", "model/evil", "label with spaces"
```

## Sanitización de Logs

Los prompts del usuario se limpian antes de escribirse en los logs:

- Se eliminan caracteres de control
- Se eliminan secuencias de escape ANSI
- Previene **log injection attacks**

## Despliegue seguro

Para producción, recomendamos:

```nginx
# Ejemplo Nginx reverse proxy
server {
    listen 443 ssl;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:11435;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;

        # Autenticación adicional (opcional)
        # auth_basic "l3mcore API";
        # auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```
