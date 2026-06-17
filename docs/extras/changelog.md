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

## [0.5.0] — 2026-06-17

### Mejoras en Plugins

#### system_time
- **Timezone configurable**: Ahora puedes especificar la zona horaria en `config.json` mediante `"system_time": {"timezone": "Europe/Madrid"}`. Si no se configura, usa la zona horaria local del sistema.
- **Anti-duplicados**: El plugin detecta si ya existe un mensaje de fecha/hora en los primeros 3 mensajes y evita inyectar duplicados.

#### user_profile
- **Longitudes máximas configurables**: Los límites de caracteres para `name`, `preferences` y `custom_instructions` ahora son configurables via `"user_profile": {"max_lengths": {"name": 200, "preferences": 1000}}`.
- **Multi-line en instrucciones**: `custom_instructions` ahora preserva saltos de línea (antes los eliminaba).
- **Anti-duplicados**: Detecta y evita mensajes de perfil duplicados.

#### image_router
- **Expert label configurable**: El nombre del experto de imagen ahora es configurable via `"image_router": {"expert_label": "mi-experto-vision"}` (por defecto: `image-expert`).
- **Límites configurables**: `max_messages`, `max_parts_per_msg` y `max_url_len` ahora son configurables.
- **SSRF Protection**: URLs externas ahora validan que la IP resuelta no pertenezca a redes privadas (10.x, 192.168.x, etc.).
- **Magic bytes validation**: Valida el tipo MIME de imágenes base64 verificando los bytes mágicos (PNG, JPEG, GIF, WebP).

#### pii_masker
- **Validación Luhn**: Las tarjetas de crédito ahora se verifican con el algoritmo de Luhn antes de enmascarar, reduciendo falsos positivos en secuencias de 16 dígitos que no son tarjetas reales.
- **Validación IPv4**: Las direcciones IP ahora validan que cada octeto esté en el rango 0-255.
- **Patrones personalizados**: Nueva opción `"pii_masker": {"custom_patterns": [{"pattern": "...", "replacement": "..."}]}` para agregar patrones regex propios.

#### routing_transparency
- **Footer template configurable**: Nueva opción `"routing_transparency": {"footer_template": "{separator}\nExperto: {expert} | Confianza: {score}"}` para personalizar completamente el formato del pie de respuesta.
- **Cache refresh**: La configuración se recarga automáticamente cada 60 segundos (antes solo se cargaba una vez al inicio).

#### telemetry_dashboard
- **Autenticación por API key**: Nuevo parámetro `"telemetry_dashboard": {"api_key": "tu-clave-secreta"}` para proteger el dashboard y la API de métricas.
- **Puerto configurable**: `"telemetry_dashboard": {"port": 8081, "host": "127.0.0.1"}`.
- **Costos configurables**: La tabla de precios por modelo ahora es configurable via `"telemetry_dashboard": {"cost_per_1m": {"mi-modelo": [input, output]}}`.
- **Cache de experts**: El lookup de configuración de expertos se cachea (60s TTL) para evitar lecturas de disco en el hot path.

#### license_manager
- **Paths configurables**: Todas las rutas (licencia, grace file, directorios de plugins Business) ahora son configurables via `"license_manager": {"license_file": "config/licencia.asc", ...}`.
- **Retry logic**: La verificación contra el servidor GPG ahora reintenta hasta 3 veces con delay configurable antes de fallar.

### Mejoras en Tools

#### calendar_smart
- **Timezone configurable**: `"calendar_smart": {"timezone": "Europe/Madrid"}` (por defecto: `Europe/Madrid`).
- **Expert destino configurable**: `"calendar_smart": {"target_expert": "mi-experto"}` (por defecto: `document-expert`).
- **Parsing de fechas mejorado**: Soporta "en 2 horas", "en 30 minutos", "pasado mañana", y días de la semana ("el lunes a las 10").
- **Browser configurable**: `"calendar_smart": {"open_browser": false}` para servidores sin navegador.

#### paperless_search
- **Refactor DRY**: La lógica de búsqueda multi-estrategia ahora está extraída en `_execute_multi_strategy_search()`, compartida entre `override_route` y `execute_tool`. Esto elimina ~100 líneas de código duplicado y garantiza comportamiento consistente.

### Correcciones de Seguridad

- **Rate Limiter**: Cleanup periódico de IPs inactivas para evitar crecimiento ilimitado de memoria. Eliminada dependencia de `X-Forwarded-For` que permitía bypass del rate limiting.
- **SSRF en /v1/discover**: El endpoint de descubrimiento de Ollama ahora valida que la IP resuelta no pertenezca a redes bloqueadas (metadata cloud, link-local).
- **CORS**: El origin por defecto cambió de `*` a `http://localhost` para evitar accesos no autorizados.
- **Health endpoint**: `auth_required` ahora es `true` por defecto para evitar divulgación de información del estado interno.
- **Race conditions**: Corregidas 4 race conditions críticas en ConfigManager, AIEngine, ExpertDispatcher y session_store.

### Correcciones de Bugs

- **SERVER_VERSION**: Actualizado de `0.1.0` a `0.4.0` para reflejar la versión real del proyecto.
- **Token counts**: Las respuestas OpenAI ahora devuelven `0` en lugar de `-1` para conteos de tokens no disponibles.
- **Deprecated datetime**: `calendar_smart` ahora usa `datetime.now(timezone.utc)` en lugar del deprecado `datetime.utcnow()`.
- **License manager import**: Corregido el orden de imports que podía causar `NameError` si `pgpy` fallaba al importar.
- **Logger rotation**: El logger ahora usa `RotatingFileHandler` (10MB, 5 backups) en lugar de `FileHandler` sin rotación.

### Documentación

- **doc.md**: Reescrito completamente con estructura de directorios actualizada, endpoints corregidos (12 endpoints), flujo de inferencia con tool calling, y sistema de plugins documentado.
- **CHANGELOG.md**: Sincronizado con el historial completo de versiones (v0.1.0 → v0.5.0).
- **Docs de plugins**: Actualizados system_time, image_router, pii_masker, routing_transparency, telemetry_dashboard, calendar_smart y paperless_search con las nuevas opciones de configuración.

---

## [0.4.0] — 2026-06-04

### Añadido

- Docker: 4 imágenes publicadas (latest, debian, cuda, rocm) bajo `lemoelink/l3mcore`.
- Hot-reload de `experts.json` cada 2 segundos.
- Plugin `system_time`: inyección de fecha/hora.
- Plugin `user_profile`: inyección de perfil de usuario.
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

- Thread safety en PluginManager, ConfigManager, GenericRouter, DecisionRouter.
- Namespace aislado para plugins en `sys.modules`.
- Filename validation para plugins (`^[a-zA-Z0-9_-]+$`).
- Pre-computed signature flags para hooks.

### Corregido

- 12 findings de auditoría de seguridad (race conditions, softmax overflow, path traversal, etc.).

---

## [0.2.0] — 2026-05-29

### Añadido

- Plugin `image_router`: inspección de ventana, type guards, validación de URLs, SSRF protection.

---

## [0.1.0] — Versión inicial

### Añadido

- Router semántico con embeddings E5 y fallback en cascada.
- API compatible OpenAI y Ollama.
- Sistema de plugins con hooks.
- Rate limiting, SSRF protection, log sanitization.
