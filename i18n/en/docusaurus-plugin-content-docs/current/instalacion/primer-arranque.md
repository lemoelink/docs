---
id: primer-arranque
title: First Startup
sidebar_position: 3
description: How to start l3mcore and verify that it works correctly.
---

# First Startup

## Start the server

```bash
./start.sh
```

Or manually:

```bash
source venv/bin/activate
python main.py
```

## Verify that it works

Open another terminal and run:

```bash
# Verify that the server responds
curl http://localhost:11435/api/version

# List loaded experts
curl http://localhost:11435/v1/models
```

You should see a JSON response with your experts listed.

## Real-time logs

Logs are saved in `logs/app.log`. To tail them in real-time:

```bash
tail -f logs/app.log
```

### Successful startup log example

```
[INFO] l3mcore API Server starting...
[INFO] GenericRouter initialized with embedding model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
[INFO] Loaded 3 experts from config/experts.json
[INFO] Expert 'programmer' → ollama @ http://127.0.0.1:11434
[INFO] Expert 'writer' → api (openai/gpt-4o)
[INFO] Expert 'analyst' → local (onnx)
[INFO] Server listening on http://0.0.0.0:11435
```

## Make your first request

```bash
curl http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "How do I make a loop in Python?"}
    ],
    "stream": false
  }'
```

Check the logs — you will see something like:

```
[Router] label='programmer' score=0.94 (embedding match)
[ExpertDispatcher] Routing to ollama @ http://127.0.0.1:11434 model=qwen2.5-coder:7b
```

:::tip It works!
If you see the routing log and receive a response, l3mcore is working correctly. You can now connect Open WebUI, Continue, or any OpenAI-compatible client.
:::
