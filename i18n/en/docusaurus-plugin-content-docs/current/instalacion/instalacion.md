---
id: instalacion
title: Installation
sidebar_position: 2
description: How to install l3mcore step by step.
---

# Installation

## Automatic method (one-liner)

The fastest and recommended method is to run our automated installer. This will download the repository, check dependencies, create the virtual environment, and set up the entire project in one step:

**Using wget:**
```bash
wget -qO- https://raw.githubusercontent.com/lemoelink/LeMoE/master/setup.sh | bash
```

**Using curl:**
```bash
curl -sSL https://raw.githubusercontent.com/lemoelink/LeMoE/master/setup.sh | bash
```

The interactive script will ask you:
- If you want to automatically install Ollama
- If you want to enable the semantic router (recommended)
- If you want to enable the plugin system and download the generic fallback model

## Classic clone method

If you prefer to download the repository yourself and run the script locally:

```bash
git clone https://github.com/lemoelink/l3mcore.git
cd lemoe
chmod +x setup.sh
./setup.sh
```

## Manual method

```bash
# 1. Clone
git clone https://github.com/lemoelink/l3mcore.git
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

