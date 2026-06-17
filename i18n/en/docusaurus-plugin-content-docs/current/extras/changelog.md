---
id: changelog
title: Changelog — Release History
sidebar_position: 1
description: Complete history of changes, improvements, and fixes in l3mcore.
---

# Changelog

All notable changes to l3mcore are documented on this page.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [0.5.0] — 2026-06-17

### Plugin Improvements

#### system_time
- **Configurable timezone**: You can now specify the timezone in `config.json` via `"system_time": {"timezone": "Europe/Madrid"}`. If not configured, it uses the system's local timezone.
- **Anti-duplicate**: The plugin detects if a date/time message already exists in the first 3 messages and avoids injecting duplicates.

#### user_profile
- **Configurable max lengths**: Character limits for `name`, `preferences`, and `custom_instructions` are now configurable via `"user_profile": {"max_lengths": {"name": 200, "preferences": 1000}}`.
- **Multi-line instructions**: `custom_instructions` now preserves line breaks (previously stripped them).
- **Anti-duplicate**: Detects and avoids duplicate profile messages.

#### image_router
- **Configurable expert label**: The image expert name is now configurable via `"image_router": {"expert_label": "my-vision-expert"}` (default: `image-expert`).
- **Configurable limits**: `max_messages`, `max_parts_per_msg` and `max_url_len` are now configurable.
- **SSRF Protection**: External URLs now validate that the resolved IP doesn't belong to private networks (10.x, 192.168.x, etc.).
- **Magic bytes validation**: Base64 image MIME types are now validated by checking magic bytes (PNG, JPEG, GIF, WebP).

#### pii_masker
- **Luhn validation**: Credit cards are now verified with the Luhn algorithm before masking, reducing false positives on 16-digit sequences that aren't real cards.
- **IPv4 validation**: IP addresses now validate that each octet is in the 0-255 range.
- **Custom patterns**: New option `"pii_masker": {"custom_patterns": [{"pattern": "...", "replacement": "..."}]}` to add custom regex patterns.

#### routing_transparency
- **Configurable footer template**: New option `"routing_transparency": {"footer_template": "{separator}\nExpert: {expert} | Confidence: {score}"}` to fully customize the response footer format.
- **Cache refresh**: Configuration now auto-reloads every 60 seconds (previously only loaded once at startup).

#### telemetry_dashboard
- **API key authentication**: New parameter `"telemetry_dashboard": {"api_key": "your-secret-key"` to protect the dashboard and metrics API.
- **Configurable port**: `"telemetry_dashboard": {"port": 8081, "host": "127.0.0.1"}`.
- **Configurable costs**: The model pricing table is now configurable via `"telemetry_dashboard": {"cost_per_1m": {"my-model": [input, output]}}`.
- **Experts cache**: Expert configuration lookup is now cached (60s TTL) to avoid disk I/O on the hot path.

#### license_manager
- **Configurable paths**: All paths (license, grace file, Business plugin directories) are now configurable via `"license_manager": {"license_file": "config/licencia.asc", ...}`.
- **Retry logic**: GPG server verification now retries up to 3 times with configurable delay before failing.

### Tool Improvements

#### calendar_smart
- **Configurable timezone**: `"calendar_smart": {"timezone": "Europe/Madrid"}` (default: `Europe/Madrid`).
- **Configurable target expert**: `"calendar_smart": {"target_expert": "my-expert"}` (default: `document-expert`).
- **Improved date parsing**: Supports "in 2 hours", "in 30 minutes", "day after tomorrow", and weekday names ("Monday at 10am").
- **Configurable browser**: `"calendar_smart": {"open_browser": false}` for headless servers.

#### paperless_search
- **DRY refactor**: Multi-strategy search logic is now extracted into `_execute_multi_strategy_search()`, shared between `override_route` and `execute_tool`. This eliminates ~100 lines of duplicated code and ensures consistent behavior.

### Security Fixes

- **Rate Limiter**: Periodic cleanup of inactive IPs to prevent unbounded memory growth. Removed `X-Forwarded-For` dependency that allowed rate limiting bypass.
- **SSRF in /v1/discover**: Ollama discovery endpoint now validates that resolved IPs don't belong to blocked networks (cloud metadata, link-local).
- **CORS**: Default origin changed from `*` to `http://localhost` to prevent unauthorized access.
- **Health endpoint**: `auth_required` is now `true` by default to prevent internal state information disclosure.
- **Race conditions**: Fixed 4 critical race conditions in ConfigManager, AIEngine, ExpertDispatcher, and session_store.

### Bug Fixes

- **SERVER_VERSION**: Updated from `0.1.0` to `0.4.0` to reflect the actual project version.
- **Token counts**: OpenAI responses now return `0` instead of `-1` for unavailable token counts.
- **Deprecated datetime**: `calendar_smart` now uses `datetime.now(timezone.utc)` instead of the deprecated `datetime.utcnow()`.
- **License manager import**: Fixed import order that could cause `NameError` if `pgpy` failed to import.
- **Logger rotation**: Logger now uses `RotatingFileHandler` (10MB, 5 backups) instead of unrotated `FileHandler`.

### Documentation

- **doc.md**: Completely rewritten with updated directory structure, corrected endpoints (12 endpoints), inference flow with tool calling, and documented plugin system.
- **CHANGELOG.md**: Synchronized with complete version history (v0.1.0 → v0.5.0).
- **Plugin docs**: Updated system_time, image_router, pii_masker, routing_transparency, telemetry_dashboard, calendar_smart and paperless_search with new configuration options.

---

## [0.4.0] — 2026-06-04

### Added

- Docker: 4 images published (latest, debian, cuda, rocm) under `lemoelink/l3mcore`.
- Hot-reload of `experts.json` every 2 seconds.
- Plugin `system_time`: date/time injection.
- Plugin `user_profile`: user profile injection.
- `GET /v1/discover`: Ollama model discovery.
- `GET /v1/route`: routing diagnostic endpoint.
- Keyword enrichment background task.

### Changed

- Experts configured for low-resource systems (CPU-only).
- Setup.sh translated to English with compiler verification.

### Fixed

- Auto-detection and cleanup of corrupted venv.
- False update notification due to branch name.

---

## [0.3.0] — 2026-05-29

### Added

- Thread safety in PluginManager, ConfigManager, GenericRouter, DecisionRouter.
- Isolated plugin namespace in `sys.modules`.
- Filename validation for plugins (`^[a-zA-Z0-9_-]+$`).
- Pre-computed signature flags for hooks.

### Fixed

- 12 security audit findings (race conditions, softmax overflow, path traversal, etc.).

---

## [0.2.0] — 2026-05-29

### Added

- Plugin `image_router`: inspection window, type guards, URL validation, SSRF protection.

---

## [0.1.0] — Initial Release

### Added

- Semantic router with E5 embeddings and cascading fallback.
- OpenAI and Ollama compatible API.
- Plugin system with hooks.
- Rate limiting, SSRF protection, log sanitization.
