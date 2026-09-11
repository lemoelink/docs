---
id: changelog
title: Changelog — Historial de Cambios
sidebar_position: 1
description: Historial completo de cambios, mejoras y correcciones de l3mcore.
---

# Changelog

Todos los cambios notables de l3mcore se documentan en esta página.

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versionado: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.0.0] — 2026-09-11

### Cambiado

- **Simplificación radical:** Eliminado el sistema de plugins, llamadas a herramientas (tool calling), endpoints experimentales (`/v1/route`, `/v1/discover`), sync_modules y licencias comerciales. El proyecto es ahora 100% libre y de código abierto, enfocado exclusivamente en enrutamiento inteligente.

---

## [0.5.0] — 2026-06-17

### Correcciones de Seguridad

- **Rate Limiter**: Cleanup periódico de IPs inactivas para evitar crecimiento ilimitado de memoria. Eliminada dependencia de `X-Forwarded-For` que permitía bypass del rate limiting.
- **SSRF en /v1/discover**: El endpoint de descubrimiento de Ollama ahora valida que la IP resuelta no pertenezca a redes bloqueadas (metadata cloud, link-local).
- **CORS**: El origin por defecto cambió de `*` a `http://localhost` para evitar accesos no autorizados.
- **Health endpoint**: `auth_required` ahora es `true` por defecto para evitar divulgación de información del estado interno.
- **Race conditions**: Corregidas 4 race conditions críticas en ConfigManager, AIEngine, ExpertDispatcher y session_store.

### Correcciones de Bugs

- **SERVER_VERSION**: Actualizado de `0.1.0` a `0.4.0` para reflejar la versión real del proyecto.
- **Token counts**: Las respuestas OpenAI ahora devuelven `0` en lugar de `-1` para conteos de tokens no disponibles.
- **Logger rotation**: El logger ahora usa `RotatingFileHandler` (10MB, 5 backups) en lugar de `FileHandler` sin rotación.

### Documentación

- **doc.md**: Reescrito completamente con estructura de directorios actualizada, endpoints corregidos (12 endpoints), y flujo de inferencia documentado.
- **CHANGELOG.md**: Sincronizado con el historial completo de versiones (v0.1.0 → v0.5.0).

---

## [0.4.0] — 2026-06-04

### Añadido

- Docker: 4 imágenes publicadas (latest, debian, cuda, rocm) bajo `lemoelink/l3mcore`.
- Hot-reload de `experts.json` cada 2 segundos.
- `GET /v1/discover`: descubrimiento de modelos Ollama.
- `GET /v1/route`: endpoint de diagnóstico de routing.
- Keyword enrichment background task.

### Cambiado

- Experts configurados para sistemas de bajo recursos (CPU-only).
- Setup.sh traducido al inglés con verificación de compiladores.

### Corregido

- Auto-detección y limpieza de venv corrupto.
- Notificación de update falsa por nombre de branch.

---

## [0.3.0] — 2026-05-29

### Añadido

- Thread safety en ConfigManager, GenericRouter, DecisionRouter.
- Pre-computed signature flags para hooks.

### Corregido

- 12 findings de auditoría de seguridad (race conditions, softmax overflow, path traversal, etc.).

---

---

## [0.1.0] — Versión inicial

### Añadido

- Router semántico con embeddings E5 y fallback en cascada.
- API compatible OpenAI y Ollama.
- Rate limiting, SSRF protection, log sanitization.
