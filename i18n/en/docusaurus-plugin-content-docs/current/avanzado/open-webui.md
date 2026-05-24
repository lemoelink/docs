---
id: open-webui
title: Open WebUI Integration
sidebar_position: 1
description: How to connect Open WebUI to LEMoE to use all your experts from a graphical interface.
---

# Open WebUI Integration

LEMoE is fully compatible with [Open WebUI](https://openwebui.com/), the most popular web interface for self-hosted AI models.

## Configuration

**Option A: Ollama type connection (Recommended)**
1. Open Open WebUI and go to **Settings → Connections**
2. In the **Ollama API** section:
   - **Base URL**: `http://your-lemoe-ip:11435`
3. Click on **Save** and reload the page. In the model selector you will see all your experts.

**Option B: OpenAI type connection**
1. Open Open WebUI and go to **Settings → Connections**
2. In the **OpenAI API** section:
   - **Base URL**: `http://your-lemoe-ip:11435/v1`
   - **API Key**: any value (LEMoE ignores it)
3. Click on **Save** and reload the page.

## Routing behavior

| Configuration in Open WebUI | Behavior in LEMoE |
|---|---|
| Model: `LEMoE Default` (or any generic name) | The ML router automatically chooses the best expert |
| Model: `programador` (exact label) | Goes straight to the `programador` expert, bypassing the router |
| Model: `escritor_creativo` | Goes straight to the `escritor_creativo` expert |

:::tip Use automatic routing
To get the most out of LEMoE, select a generic model and let the router choose. You will see in the logs how it decides in real time.
:::

## Example log with Open WebUI

```
[API] POST /v1/chat/completions from 192.168.1.50
[API] model=gpt-4, messages=1, stream=true
[Router] Prompt: "Can you write me a poem about the sea?"
[Router] label='escritor_creativo' score=0.89 (embedding match)
[ExpertDispatcher] → api (anthropic/claude-3-5-sonnet)
[Stream] Sending tokens to client...
```

## Troubleshooting

**No models appear in Open WebUI:**
- Verify that LEMoE is running: `curl http://your-ip:11435/api/version`
- Check that the Base URL is correct (without `/v1` for Ollama, or with `/v1` for OpenAI).

**Connection error:**
- Make sure the firewall allows port 11435
- In Docker, use the host IP, not `localhost`
