---
id: docker
title: Despliegue con Docker
sidebar_position: 4
description: Guia para desplegar l3mcore facilmente utilizando contenedores Docker.
---

# Despliegue con Docker

l3mcore puede desplegarse completamente a través de Docker. Este es el método recomendado para servidores y entornos de producción, ya que evita tener que instalar Python y librerías complejas directamente en tu máquina.

Tenemos tres imágenes oficiales disponibles en [Docker Hub (lemoelink/l3mcore)](https://hub.docker.com/r/lemoelink/l3mcore).

## Imágenes Disponibles

### 1. General (Por defecto)
- **Tag:** `lemoelink/l3mcore:general` o `lemoelink/l3mcore:latest`
- **Base:** Debian Slim
- **Descripción:** Es la imagen más ligera y recomendada para la gran mayoría de casos. Viene preconfigurada y optimizada para ejecutar los modelos de enrutamiento utilizando únicamente el procesador (CPU), lo que asegura una compatibilidad casi total con cualquier sistema.

### 2. Debian
- **Tag:** `lemoelink/l3mcore:debian`
- **Base:** Debian Estándar
- **Descripción:** Es idéntica a la versión general, pero incluye todas las librerías base del sistema operativo. Es muy útil si necesitas entrar al contenedor para depurar o instalar herramientas adicionales de red.

### 3. CUDA (Beta)
- **Tag:** `lemoelink/l3mcore:cuda`
- **Base:** Nvidia CUDA Runtime
- **Descripción:** Utiliza esta versión únicamente si vas a cargar modelos locales pesados (como Llama 3) directamente en l3mcore y tienes una tarjeta gráfica Nvidia. Requiere pasar el parámetro `--gpus all` a Docker.

### ·. ROCM (Beta)
- **Tag**: `lemoelink/l3mcore:rocm`
- **Base**: Debian Estándar
- **Descripcion**: Utiliza esta versión únicamente si vas a cargar modelos locales pesados (como Llama 3) directamente en l3mcore y tienes una tarjeta gráfica AMD. Requiere pasar el parámetro `--gpus all` a Docker.

---

## Cómo Ejecutar l3mcore

Puedes arrancar el contenedor con un solo comando. Recomendamos encarecidamente utilizar "volúmenes" para asegurar que tu configuración y los modelos que el sistema descargue no se pierdan si reinicias el contenedor.

Copia y pega este comando en tu terminal:

```bash
docker run -d -p 11435:11435 \
  -v ./config:/app/config \
  -v ./models:/app/models \
  -v ./data:/app/data \
  --name lemoe \
  lemoelink/l3mcore:general
```

### Explicación de los volúmenes

1. **`/app/config`**: Al montar esta carpeta, podrás ver y editar los archivos `config.json` y `experts.json` directamente desde tu ordenador sin necesidad de reconstruir el contenedor. Los cambios se aplicarán automáticamente.
2. **`/app/models`**: Aquí es donde l3mcore guarda los modelos que descarga de internet (como el enrutador semántico). Si no montas este volumen, l3mcore tendrá que descargar cientos de megabytes cada vez que lo enciendas.
3. **`/app/data`**: Mantiene un registro persistente de las métricas de uso y telemetría de tu servidor.

---

## Despliegue con Docker Compose

Si prefieres gestionar tus contenedores de forma declarativa, puedes crear un archivo `docker-compose.yml`. Hemos preparado varias plantillas ("Stacks") para que elijas la que mejor se adapte a tus necesidades. Todos los directorios se mapean automáticamente de forma local.

### 1. Stack Básico: Solo l3mcore
Ideal si ya tienes Ollama u otras APIs instaladas en otro servidor.

```yaml
version: '3.8'

services:
  lemoe:
    image: lemoelink/l3mcore:general
    container_name: lemoe
    ports:
      - "11435:11435"
    volumes:
      - ./lemoe_config:/app/config
      - ./lemoe_models:/app/models
      - ./lemoe_data:/app/data
    restart: unless-stopped
```

### 2. Stack Local: l3mcore + Ollama
Despliega l3mcore junto con un servidor de Ollama local. Todo lo que descargues en Ollama será gestionado por l3mcore.

```yaml
version: '3.8'

services:
  lemoe:
    image: lemoelink/l3mcore:general
    container_name: lemoe
    ports:
      - "11435:11435"
    volumes:
      - ./lemoe_config:/app/config
      - ./lemoe_models:/app/models
      - ./lemoe_data:/app/data
    restart: unless-stopped
    depends_on:
      - ollama
      
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ./ollama_data:/root/.ollama
    restart: unless-stopped
```

### 3. Stack Frontend: l3mcore + Open WebUI
Si usas APIs de pago (como OpenAI o Anthropic) y quieres un chat visual que envíe las peticiones a través del enrutador de l3mcore.

```yaml
version: '3.8'

services:
  lemoe:
    image: lemoelink/l3mcore:general
    container_name: lemoe
    ports:
      - "11435:11435"
    volumes:
      - ./lemoe_config:/app/config
      - ./lemoe_models:/app/models
      - ./lemoe_data:/app/data
    restart: unless-stopped
    
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_BASE_URL=http://lemoe:11435/v1
    volumes:
      - ./webui_data:/app/backend/data
    restart: unless-stopped
    depends_on:
      - lemoe
```

### 4. Stack Completo: l3mcore + Ollama + Open WebUI
El entorno definitivo. Tienes los modelos locales (Ollama), el enrutador inteligente (l3mcore) y la interfaz gráfica de chat (Open WebUI), todo conectado entre sí automáticamente.

```yaml
version: '3.8'

services:
  lemoe:
    image: lemoelink/l3mcore:general
    container_name: lemoe
    ports:
      - "11435:11435"
    volumes:
      - ./lemoe_config:/app/config
      - ./lemoe_models:/app/models
      - ./lemoe_data:/app/data
    restart: unless-stopped
    depends_on:
      - ollama
      
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ./ollama_data:/root/.ollama
    restart: unless-stopped
    
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_BASE_URL=http://lemoe:11435/v1
    volumes:
      - ./webui_data:/app/backend/data
    restart: unless-stopped
    depends_on:
      - lemoe
```

Para iniciar cualquiera de estos stacks, guarda el código en un archivo llamado `docker-compose.yml` en una carpeta vacía y ejecuta:

```bash
docker compose up -d
```

## Actualizar a una nueva versión

Cuando salga una nueva versión de l3mcore, actualizar tu nodo es tan sencillo como ejecutar:

```bash
docker pull lemoelink/l3mcore:general
docker stop l3mcore
docker rm l3mcore
# Y vuelves a ejecutar el comando "docker run" de arriba
```
