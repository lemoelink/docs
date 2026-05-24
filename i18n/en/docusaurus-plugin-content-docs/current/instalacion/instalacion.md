---
id: instalacion
title: Installation
sidebar_position: 2
description: How to install LEMoE step by step.
---

# Installation

## Automatic method (recommended)

```bash
git clone https://github.com/lemoelink/lemoe.git
cd lemoe
chmod +x setup.sh
./setup.sh
```

The interactive script will ask you:
- If you want to install ML dependencies (SentenceTransformers, PyTorch)
- If you want to enable the plugin system
- If you want to install support for local ONNX models

## Manual method

```bash
# 1. Clone
git clone https://github.com/lemoelink/lemoe.git
cd lemoe

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install base dependencies
pip install -r requirements.txt

# 4. (Optional) Install ML dependencies
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install sentence-transformers

# 5. Create initial configuration
cp config/config.example.json config/config.json
cp config/experts.example.json config/experts.json
```

## Project structure

```
lemoe/
├── config/
│   ├── config.json        # Router configuration
│   └── experts.json       # Expert definitions
├── modules/               # Internal modules
├── plugins/               # Your custom plugins
├── logs/                  # Application logs
├── models/                # Local ONNX/GGUF models
├── api_server.py          # Main HTTP server
├── main.py                # Entry point
├── setup.sh               # Installation script
└── start.sh               # Startup script
```

