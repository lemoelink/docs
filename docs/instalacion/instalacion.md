---
id: instalacion
title: Instalación
sidebar_position: 2
description: Cómo instalar l3mcore paso a paso.
---

# Instalación

## Método automático (one-liner)

El método más rápido y recomendado es ejecutar nuestro instalador automatizado. Esto descargará el repositorio, comprobará dependencias, creará el entorno virtual y configurará todo el proyecto en un solo paso:

**Usando wget:**
```bash
wget -qO- https://raw.githubusercontent.com/lemoelink/LeMoE/master/setup.sh | bash
```

**Usando curl:**
```bash
curl -sSL https://raw.githubusercontent.com/lemoelink/LeMoE/master/setup.sh | bash
```

El script interactivo te preguntará:
- Si quieres instalar Ollama automáticamente
- Si quieres habilitar el enrutador semántico (recomendado)
- Si quieres habilitar el sistema de plugins y descargar el modelo genérico de fallback

## Método de clonado clásico

Si prefieres descargar el repositorio tú mismo y ejecutar el script localmente:

```bash
git clone https://github.com/lemoelink/l3mcore.git
cd l3mcore
chmod +x setup.sh
./setup.sh
```

## Método manual

```bash
# 1. Clonar
git clone https://github.com/lemoelink/l3mcore.git
cd l3mcore

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
l3mcore/
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

