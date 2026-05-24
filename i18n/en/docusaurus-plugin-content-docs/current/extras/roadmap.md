---
id: roadmap
title: Roadmap / To-Do
sidebar_position: 1
description: Future features and development roadmap for LEMoE.
---

# Roadmap (To-Do)

LEMoE is in continuous development. Below are some of the key features and improvements we plan to incorporate in future versions:

## Plugin System (In progress)
Currently, the plugin system is partially implemented. Our goal is to complete it to allow developers to extend LEMoE's functionality through custom *hooks* that intercept, modify, or analyze requests and responses in real-time, without touching the core source code.

## VRAM Management
One of the major planned improvements is an intelligent VRAM (video memory) management system for local models. The idea is for LEMoE to be able to:
- Unload inactive experts from memory.
- Dynamically load required experts into memory.
- Avoid "Out of Memory" (OOM) errors when quickly switching between multiple heavy models hosted on the same machine.

## Optimized Native Router
Currently, the router is based on standard Python libraries. We want to develop an embeddings router written from scratch and highly optimized for this specific project. This will further reduce decision latency and minimize the impact on CPU/RAM resources, maximizing response speed.

---

*Do you have any other ideas or features you would like to see in LEMoE? Open an Issue in our main GitHub repository: [lemoelink/LeMoE/issues](https://github.com/lemoelink/LeMoE/issues)!*
