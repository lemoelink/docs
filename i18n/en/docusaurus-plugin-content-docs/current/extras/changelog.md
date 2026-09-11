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

## [1.0.0] — 2026-09-11

### Changed

- **Radical simplification:** Removed plugin system, tool calling, experimental endpoints (`/v1/route`, `/v1/discover`), sync_modules, and commercial licensing. The project is now 100% free and open-source, focusing exclusively on intelligent routing.

---

## [0.5.0] — 2026-06-17

### Security Fixes

- **Rate Limiter**: Periodic cleanup of inactive IPs to prevent unbounded memory growth. Removed `X-Forwarded-For` dependency that allowed rate limiting bypass.
- **CORS**: Default origin changed from `*` to `http://localhost` to prevent unauthorized access.
- **Health endpoint**: `auth_required` is now `true` by default to prevent internal state information disclosure.
- **Race conditions**: Fixed 4 critical race conditions in ConfigManager, AIEngine, ExpertDispatcher, and session_store.

### Bug Fixes

- **SERVER_VERSION**: Updated from `0.1.0` to `0.4.0` to reflect the actual project version.
- **Token counts**: OpenAI responses now return `0` instead of `-1` for unavailable token counts.
- **Logger rotation**: Logger now uses `RotatingFileHandler` (10MB, 5 backups) instead of unrotated `FileHandler`.

### Documentation

- **doc.md**: Completely rewritten with updated directory structure, corrected endpoints, and inference flow.
- **CHANGELOG.md**: Synchronized with complete version history (v0.1.0 → v0.5.0).

---

## [0.4.0] — 2026-06-04

### Added

- Docker: 4 images published (latest, debian, cuda, rocm) under `lemoelink/l3mcore`.
- Hot-reload of `experts.json` every 2 seconds.

### Changed

- Experts configured for low-resource systems (CPU-only).
- Setup.sh translated to English with compiler verification.

### Fixed

- Auto-detection and cleanup of corrupted venv.

---

## [0.3.0] — 2026-05-29

### Added

- Thread safety in ConfigManager, GenericRouter, DecisionRouter.

### Fixed

- 12 security audit findings (race conditions, softmax overflow, path traversal, etc.).

---

## [0.1.0] — Initial Release

### Added

- Semantic router with E5 embeddings and cascading fallback.
- OpenAI and Ollama compatible API.
- Rate limiting, SSRF protection, log sanitization.
