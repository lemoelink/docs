---
id: faq
title: FAQ
sidebar_position: 2
description: Frequently asked questions about l3mcore.
---

# Frequently Asked Questions (FAQ)

## General

### Is l3mcore free?
Yes, l3mcore is open source. Costs come from the backends you configure (e.g., OpenAI API) or the hardware for local models.

### Do I need a GPU to use l3mcore?
No. l3mcore's ML router runs on CPU. The backends you use (Ollama, vLLM) may or may not need a GPU depending on the models you choose.

### Does l3mcore save my conversations?
No. l3mcore is stateless middleware. Prompts pass through and a sanitized summary is logged in `logs/app.log`, but there is no conversation storage.

---

## Configuration

### How many experts can I have?
The limit is set by `max_experts` in `experts.json` (default 15). Technically, you can increase this number, but with many experts, the vectorization time on startup increases (happens only once).

### Can I change experts without restarting?
Currently no. Experts are loaded on startup. You must restart l3mcore for changes in `experts.json` to take effect.

### Can I change the router model?
Yes. You can change the embeddings model by modifying the `model_path` parameter in `config/config.json`. By default it uses `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. You can point to any other model compatible with Hugging Face SentenceTransformers, to a local disk path, or leave it empty `""` to disable ML routing and use only keywords (which reduces the router's RAM/CPU consumption to zero).

### How do I know if the router is working well?
Check the logs: `tail -f logs/app.log | grep Router`. You should see scores > 0.6 for clear prompts.

---

## Compatibility

### Does it work with Continue (IDE plugin)?
Yes. In Continue, configure the OpenAI provider with the base URL `http://your-ip:11435/v1`.

### Does it work with LiteLLM?
Yes. l3mcore exposes an OpenAI-compatible API, so LiteLLM can point to it as a provider.

### Does it work with Langchain / LlamaIndex?
Yes. Use the Langchain/LlamaIndex OpenAI client pointing to `http://your-ip:11435/v1`.

---

## Performance

### How long does the router take to decide?
With `paraphrase-multilingual-MiniLM-L12-v2`: ~10-20ms. With keywords only: < 1ms. The expert model's inference time dominates the total time.

### What happens if an external backend (OpenAI) fails?
The Expert Dispatcher returns an HTTP 502/503 error to the client. There are no automatic retries currently. You can implement retry logic in an `after_generation` plugin.

---

## Security

### Can I expose l3mcore to the internet?
Not directly. Put it behind a reverse proxy (Nginx/Caddy) with authentication. l3mcore is designed for internal networks and homelabs.

### Does l3mcore filter content?
Not by default. You can implement content filters using the [plugin](/avanzado/plugins) system.
