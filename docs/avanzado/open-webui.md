---
id: open-webui
title: Integración con Open WebUI
sidebar_position: 1
description: Cómo conectar Open WebUI a l3mcore para usar todos tus expertos desde una interfaz gráfica.
---

# Integración con Open WebUI

l3mcore es completamente compatible con [Open WebUI](https://openwebui.com/), la interfaz web más popular para modelos de IA auto-hospedados.

## Configuración

**Opción A: Conexión tipo Ollama (Recomendada)**
1. Abre Open WebUI y ve a **Settings → Connections**
2. En la sección **Ollama API**:
   - **URL Base**: `http://tu-ip-de-lemoe:11435`
3. Haz clic en **Save** y recarga la página. En el selector de modelos verás todos tus expertos.

**Opción B: Conexión tipo OpenAI**
1. Abre Open WebUI y ve a **Settings → Connections**
2. En la sección **OpenAI API**:
   - **URL Base**: `http://tu-ip-de-lemoe:11435/v1`
   - **API Key**: cualquier valor (l3mcore la ignora)
3. Haz clic en **Save** y recarga la página.

## Comportamiento del enrutamiento

| Configuración en Open WebUI | Comportamiento en l3mcore |
|---|---|
| Modelo: `l3mcore Default` (o cualquier nombre genérico) | El router ML elige automáticamente el mejor experto |
| Modelo: `programador` (etiqueta exacta) | Va directo al experto `programador`, sin router |
| Modelo: `escritor_creativo` | Va directo al experto `escritor_creativo` |

:::tip Usa enrutamiento automático
Para sacar el máximo partido de l3mcore, selecciona un modelo genérico y deja que el router elija. Verás en los logs cómo decide en tiempo real.
:::

## Ejemplo de log con Open WebUI

```
[API] POST /v1/chat/completions from 192.168.1.50
[API] model=gpt-4, messages=1, stream=true
[Router] Prompt: "¿Puedes escribirme un poema sobre el mar?"
[Router] label='escritor_creativo' score=0.89 (embedding match)
[ExpertDispatcher] → api (anthropic/claude-3-5-sonnet)
[Stream] Sending tokens to client...
```

## Solución de problemas

**No aparecen modelos en Open WebUI:**
- Verifica que l3mcore está corriendo: `curl http://tu-ip:11435/api/version`
- Comprueba que la URL Base es correcta (sin `/v1` para Ollama, o con `/v1` para OpenAI).

**Error de conexión:**
- Asegúrate de que el firewall permite el puerto 11435
- En Docker, usa la IP del host, no `localhost`
