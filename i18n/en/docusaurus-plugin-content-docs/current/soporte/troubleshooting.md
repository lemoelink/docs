---
id: troubleshooting
title: Troubleshooting
sidebar_position: 1
description: Solutions for the most common issues with LEMoE.
---

# Troubleshooting

## Installation Issues

### `ImportError: transformers/torch are not installed`

**Symptom**: Logs show that `GenericRouter` is disabled upon startup.

**Solution**:
```bash
source venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install sentence-transformers
```

If you do not want to install PyTorch, disable ML:
```json
{ "router": { "model_path": "", "keyword_fallback": true } }
```

---

### `ValueError: Unsafe model label rejected`

**Symptom**: The router fails to load an expert.

**Cause**: The `label` field in `experts.json` contains invalid characters.

**Solution**: Use only alphanumeric characters, hyphens, and underscores:
```
[CORRECT] "programador", "coder-v2", "analista_datos"
[ERROR]   "../evil", "model/sub", "label with spaces"
```

---

## Routing Issues

### The router always uses the fallback

**Possible symptoms and causes**:

| Symptom | Probable cause | Solution |
|---|---|---|
| Score always < 0.3 | `confidence_threshold` too high | Lower it to 0.35–0.45 |
| Score always low | Less than 15 keywords per expert | Add specific keywords |
| Router disabled | Empty `model_path` | Install ML dependencies or adjust keywords |

**Quick diagnosis**:
```bash
tail -f logs/app.log | grep Router
# Search for: [Router] label='...' score=X.XX
```

---

### The router chooses the wrong expert

1. Check if there is keyword overlap between experts
2. Adjust `softmax_temperature` lower (e.g. 0.10) to make the router more decisive
3. Add more specific keywords and remove generic terms
4. Improve expert descriptions (they affect 30% of the score)

---

## Connectivity Issues

### `Error: Blocked network` with Ollama

**Cause**: The Ollama URL points to a cloud metadata IP (SSRF protection).

**Solution**: Use your server's real private IP:
```json
"url": "http://192.168.1.100:11434"  // CORRECT
"url": "http://169.254.169.254"      // ERROR - BLOCKED
```

---

### `Rate limit exceeded` (HTTP 429)

**Cause**: More than 60 requests/minute from the same IP.

**Solutions**:
- Wait a minute
- Adjust the limit in `api_server.py` if you are generating the traffic:
  ```python
  RATE_LIMIT = 200  # requests per minute
  ```

---

## Reading the logs

Clean logs are located in `logs/app.log`:

```
[API]              → Incoming request and sanitized prompt
[Router]           → Routing decision + score
[ExpertDispatcher] → Selected backend
[SpecificModelRunner] → ONNX/GGUF memory management
```

**Healthy session example**:
```
[API] POST /v1/chat/completions — prompt(32 chars) stream=true
[Router] label='programador' score=0.87 (embedding)
[ExpertDispatcher] → ollama @ http://127.0.0.1:11434 model=qwen2.5-coder:7b
[Stream] 247 tokens transmitted in 3.2s
```
