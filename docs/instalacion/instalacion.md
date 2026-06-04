---
id: instalacion
title: Instalación
sidebar_position: 2
description: Cómo instalar l3mcore paso a paso.
---

# Instalación

## Método automático (recomendado)

```bash
git clone https://github.com/lemoelink/l3mcore.git
cd lemoe
chmod +x setup.sh
./setup.sh
```

El script interactivo te preguntará:
- Si quieres instalar dependencias ML (SentenceTransformers, PyTorch)
- Si quieres habilitar el sistema de plugins
- Si quieres instalar soporte para modelos ONNX locales

## Método manual

```bash
# 1. Clonar
git clone https://github.com/lemoelink/l3mcore.git
cd lemoe

# 2. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependencias base
pip install -r requirements.txt

# 4. (Opcional) Instalar dependencias ML
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install sentence-transformers

# 5. Crear configuración inicial
cp config/config.example.json config/config.json
cp config/experts.example.json config/experts.json
```

## Estructura del proyecto

```
lemoe/
├── config/
│   ├── config.json        # Configuración del router
│   └── experts.json       # Definición de expertos
├── modules/               # Módulos internos
├── plugins/               # Tus plugins personalizados
├── logs/                  # Logs de la aplicación
├── models/                # Modelos locales ONNX/GGUF
├── api_server.py          # Servidor HTTP principal
├── main.py                # Punto de entrada
├── setup.sh               # Script de instalación
└── start.sh               # Script de arranque
```

