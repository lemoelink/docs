---
id: primer-arranque
title: Primer Arranque
sidebar_position: 3
description: Cómo arrancar l3mcore y verificar que funciona correctamente.
---

# Primer Arranque

## Iniciar el servidor

```bash
./start.sh
```

O manualmente:

```bash
source venv/bin/activate
python main.py
```

## Verificar que funciona

Abre otra terminal y ejecuta:

```bash
# Verificar que el servidor responde
curl http://localhost:11435/api/version

# Listar expertos cargados
curl http://localhost:11435/v1/models
```

Deberías ver una respuesta JSON con tus expertos listados.

## Logs en tiempo real

Los logs se guardan en `logs/app.log`. Para seguirlos en tiempo real:

```bash
tail -f logs/app.log
```

### Ejemplo de log de arranque exitoso

```
[INFO] l3mcore API Server starting...
[INFO] GenericRouter initialized with embedding model: intfloat/multilingual-e5-small
[INFO] Loaded 3 experts from config/experts.json
[INFO] Expert 'programador' → ollama @ http://127.0.0.1:11434
[INFO] Expert 'escritor' → api (openai/gpt-4o)
[INFO] Expert 'analista' → local (onnx)
[INFO] Server listening on http://0.0.0.0:11435
```

## Hacer tu primera petición

```bash
curl http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "¿Cómo hago un bucle en Python?"}
    ],
    "stream": false
  }'
```

Revisa los logs — verás algo como:

```
[Router] label='programador' score=0.94 (embedding match)
[ExpertDispatcher] Routing to ollama @ http://127.0.0.1:11434 model=qwen2.5-coder:7b
```

:::tip ¡Funciona!
Si ves el log de enrutamiento y recibes respuesta, l3mcore está funcionando correctamente. Ahora puedes conectar Open WebUI, Continue, o cualquier cliente compatible con OpenAI.
:::
