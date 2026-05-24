---
id: roadmap
title: Roadmap / To-Do
sidebar_position: 1
description: Funciones futuras y hoja de ruta de desarrollo de LEMoE.
---

# Hoja de Ruta (To-Do)

LEMoE se encuentra en continuo desarrollo. A continuación se detallan algunas de las características y mejoras clave que tenemos planeado incorporar en futuras versiones:

## 🔌 Sistema de Plugins (En progreso)
Actualmente el sistema de plugins está parcialmente implementado. Nuestro objetivo es completarlo para permitir a los desarrolladores extender la funcionalidad de LEMoE mediante *hooks* personalizados que intercepten, modifiquen o analicen las peticiones y respuestas en tiempo real, sin tocar el código fuente del núcleo.

## 💾 Gestión de VRAM
Una de las grandes mejoras planificadas es un sistema inteligente de gestión de VRAM (memoria de video) para modelos locales. La idea es que LEMoE sea capaz de:
- Descargar de la memoria (unload) a los expertos inactivos.
- Cargar en memoria de forma dinámica a los expertos requeridos.
- Evitar los errores de "Out of Memory" (OOM) al cambiar rápidamente entre múltiples modelos pesados alojados en la misma máquina.

## 🚀 Router nativo optimizado
Actualmente el enrutador se basa en librerías estándar en Python. Queremos desarrollar un router de embeddings escrito desde cero y altamente optimizado para este proyecto específico. Esto reducirá aún más la latencia de decisión y minimizará el impacto en los recursos de CPU/RAM, maximizando la velocidad de respuesta.

---

*¿Tienes alguna otra idea o característica que te gustaría ver en LEMoE? ¡Abre un Issue en nuestro repositorio de GitHub!*
