---
id: troubleshooting
title: Solución de Problemas
sidebar_position: 1
description: Soluciones para los problemas más comunes con LEMoE.
---

# Solución de Problemas

## Problemas de instalación

### `ImportError: transformers/torch are not installed`

**Síntoma**: Los logs muestran que `GenericRouter` está deshabilitado al arrancar.

**Solución**:
```bash
source venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install sentence-transformers
```

Si no quieres instalar PyTorch, desactiva el ML:
```json
{ "router": { "model_path": "", "keyword_fallback": true } }
```

---

### `ValueError: Unsafe model label rejected`

**Síntoma**: El router falla al cargar un experto.

**Causa**: El campo `label` en `experts.json` contiene caracteres no válidos.

**Solución**: Usa solo alfanumérico, guiones y guiones bajos:
```
✅ "programador", "coder-v2", "analista_datos"
❌ "../evil", "model/sub", "label con espacios"
```

---

## Problemas de enrutamiento

### El router siempre usa el fallback

**Síntomas posibles y causas**:

| Síntoma | Causa probable | Solución |
|---|---|---|
| Score siempre < 0.3 | `confidence_threshold` muy alto | Bájalo a 0.35–0.45 |
| Score siempre bajo | Menos de 15 keywords por experto | Añade keywords específicas |
| Router desactivado | `model_path` vacío | Instala dependencias ML o ajusta keywords |

**Diagnóstico rápido**:
```bash
tail -f logs/app.log | grep Router
# Busca: [Router] label='...' score=X.XX
```

---

### El router elige el experto equivocado

1. Revisa si hay solapamiento de keywords entre expertos
2. Ajusta `softmax_temperature` más bajo (ej. 0.10) para hacer al router más decisivo
3. Añade keywords más específicas y elimina términos genéricos
4. Mejora las descripciones de los expertos (afectan al 30% del score)

---

## Problemas de conectividad

### `Error: Blocked network` con Ollama

**Causa**: La URL de Ollama apunta a una IP de metadatos cloud (protección SSRF).

**Solución**: Usa la IP privada real de tu servidor:
```json
"url": "http://192.168.1.100:11434"  ✅
"url": "http://169.254.169.254"      ❌ BLOQUEADA
```

---

### `Rate limit exceeded` (HTTP 429)

**Causa**: Más de 60 requests/minuto desde la misma IP.

**Soluciones**:
- Espera un minuto
- Ajusta el límite en `api_server.py` si eres tú quien genera el tráfico:
  ```python
  RATE_LIMIT = 200  # requests por minuto
  ```

---

## Leyendo los logs

Los logs limpios están en `logs/app.log`:

```
[API]              → Petición entrante y prompt sanitizado
[Router]           → Decisión de enrutamiento + score
[ExpertDispatcher] → Backend seleccionado
[SpecificModelRunner] → Gestión de memoria ONNX/GGUF
```

**Ejemplo de sesión sana**:
```
[API] POST /v1/chat/completions — prompt(32 chars) stream=true
[Router] label='programador' score=0.87 (embedding)
[ExpertDispatcher] → ollama @ http://127.0.0.1:11434 model=qwen2.5-coder:7b
[Stream] 247 tokens transmitted in 3.2s
```
