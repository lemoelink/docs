---
id: docker
title: Docker Deployment
sidebar_position: 4
description: Guide to easily deploy LEMoE using Docker containers.
---

# Docker Deployment

LEMoE can be fully deployed via Docker. This is the recommended method for servers and production environments, as it avoids having to install Python and complex libraries directly on your machine.

We have three official images available on [Docker Hub (lemoelink/lemoe)](https://hub.docker.com/r/lemoelink/lemoe).

## Available Images

### 1. General (Default)
- **Tag:** `lemoelink/lemoe:general` or `lemoelink/lemoe:latest`
- **Base:** Debian Slim
- **Description:** This is the lightest and recommended image for the vast majority of cases. It comes preconfigured and optimized to run the routing models using only the processor (CPU), which ensures almost total compatibility with any system.

### 2. Debian
- **Tag:** `lemoelink/lemoe:debian`
- **Base:** Standard Debian
- **Description:** It is identical to the general version, but includes all the base operating system libraries. It is very useful if you need to enter the container to debug or install additional network tools.

### 3. CUDA (Beta)
- **Tag:** `lemoelink/lemoe:cuda`
- **Base:** Nvidia CUDA Runtime
- **Description:** Use this version only if you are going to load heavy local models (like Llama 3) directly into LEMoE and you have an Nvidia graphics card. It requires passing the `--gpus all` parameter to Docker.

---

## How to Run LEMoE

You can start the container with a single command. We highly recommend using "volumes" to ensure that your configuration and the models the system downloads are not lost if you restart the container.

Copy and paste this command into your terminal:

```bash
docker run -d -p 11435:11435 \
  -v ./config:/app/config \
  -v ./models:/app/models \
  -v ./data:/app/data \
  --name lemoe \
  lemoelink/lemoe:general
```

### Volumes explanation

1. **`/app/config`**: By mounting this folder, you will be able to view and edit the `config.json` and `experts.json` files directly from your computer without needing to rebuild the container. Changes will be applied automatically.
2. **`/app/models`**: This is where LEMoE saves the models it downloads from the internet (like the semantic router). If you don't mount this volume, LEMoE will have to download hundreds of megabytes every time you start it.
3. **`/app/data`**: Maintains a persistent record of usage metrics and telemetry of your server.

---

## Docker Compose Deployment

If you prefer to manage your containers declaratively, you can create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  lemoe:
    image: lemoelink/lemoe:general
    container_name: lemoe
    ports:
      - "11435:11435"
    volumes:
      - ./config:/app/config
      - ./models:/app/models
      - ./data:/app/data
    restart: unless-stopped
```

To start it, simply run:

```bash
docker compose up -d
```

## Update to a new version

When a new version of LEMoE is released, updating your node is as simple as running:

```bash
docker pull lemoelink/lemoe:general
docker stop lemoe
docker rm lemoe
# And you run the "docker run" command from above again
```
