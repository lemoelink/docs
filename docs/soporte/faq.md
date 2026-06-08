---
id: faq
title: FAQ
sidebar_position: 2
description: Preguntas frecuentes sobre l3mcore.
---

# Preguntas Frecuentes (FAQ)

## General

### ¿l3mcore es gratuito?
Sí, l3mcore es open source y gratuito para uso no comercial. Los costes vienen de los backends que configures (ej. API de OpenAI) o del hardware para modelos locales.

### ¿Necesito GPU para usar l3mcore?
No. El router ML de l3mcore corre en CPU. Los backends que uses (Ollama, vLLM) pueden o no necesitar GPU según los modelos que elijas.

### ¿l3mcore guarda mis conversaciones?
No. l3mcore es un middleware sin estado. Los prompts pasan a través y se loguea un resumen sanitizado en `logs/app.log`, pero no hay almacenamiento de conversaciones.

---

## Configuración

### ¿Cuántos expertos puedo tener?
El límite está en `max_experts` en `experts.json` (por defecto 15). Técnicamente puedes subir este número, pero con muchos expertos el tiempo de vectorización al arrancar aumenta (ocurre una sola vez).

### ¿Puedo cambiar los expertos sin reiniciar?
Actualmente no. Los expertos se cargan al arranque. Debes reiniciar l3mcore para que los cambios en `experts.json` surtan efecto.

### ¿Puedo cambiar el modelo del router?
Sí. Puedes cambiar el modelo de embeddings modificando el parámetro `model_path` en `config/config.json`. Por defecto usa `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Puedes apuntar a cualquier otro modelo compatible con SentenceTransformers de Hugging Face, a una ruta local en disco, o dejarlo vacío `""` para desactivar el enrutamiento ML y usar únicamente keywords (lo cual reduce a cero el consumo de RAM/CPU del router).

### ¿Cómo sé si el router está funcionando bien?
Revisa los logs: `tail -f logs/app.log | grep Router`. Deberías ver scores > 0.6 para prompts claros.

---

## Compatibilidad

### ¿Funciona con Continue (plugin de IDE)?
Sí. En Continue, configura el proveedor OpenAI con URL base `http://tu-ip:11435/v1`.

### ¿Funciona con LiteLLM?
Sí. l3mcore expone una API compatible con OpenAI, por lo que LiteLLM puede apuntar a él como proveedor.

### ¿Funciona con Langchain / LlamaIndex?
Sí. Usa el cliente OpenAI de Langchain/LlamaIndex apuntando a `http://tu-ip:11435/v1`.

---

## Rendimiento

### ¿Cuánto tarda el router en decidir?
Con `paraphrase-multilingual-MiniLM-L12-v2`: ~10-20ms. Con solo keywords: < 1ms. El tiempo de inferencia del modelo experto domina el tiempo total.

### ¿Qué pasa si un backend externo (OpenAI) falla?
El Expert Dispatcher devuelve un error HTTP 502/503 al cliente. No hay reintentos automáticos actualmente. Puedes implementar retry logic en un plugin `after_generation`.

---

## Seguridad

### ¿Puedo exponer l3mcore a internet?
No directamente. Ponlo detrás de un proxy reverso (Nginx/Caddy) con autenticación. l3mcore está diseñado para redes internas y homelabs.

### ¿l3mcore filtra contenido?
No por defecto. Puedes implementar filtros de contenido usando el sistema de [plugins](/avanzado/plugins).
