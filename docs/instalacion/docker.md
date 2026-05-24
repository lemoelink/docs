---
id: docker
title: Despliegue con Docker
sidebar_position: 4
description: Guia para desplegar LEMoE facilmente utilizando contenedores Docker.
---

# Despliegue con Docker

LEMoE puede desplegarse completamente a través de Docker. Este es el método recomendado para servidores y entornos de producción, ya que evita tener que instalar Python y librerías complejas directamente en tu máquina.

Tenemos tres imágenes oficiales disponibles en Docker Hub bajo el repositorio `lemoelink/lemoe`.

## Imágenes Disponibles

### 1. General (Por defecto)
- **Tag:** `lemoelink/lemoe:general` o `lemoelink/lemoe:latest`
- **Base:** Debian Slim
- **Descripción:** Es la imagen más ligera y recomendada para la gran mayoría de casos. Viene preconfigurada y optimizada para ejecutar los modelos de enrutamiento utilizando únicamente el procesador (CPU), lo que asegura una compatibilidad casi total con cualquier sistema.

### 2. Debian
- **Tag:** `lemoelink/lemoe:debian`
- **Base:** Debian Estándar
- **Descripción:** Es idéntica a la versión general, pero incluye todas las librerías base del sistema operativo. Es muy útil si necesitas entrar al contenedor para depurar o instalar herramientas adicionales de red.

### 3. CUDA (Beta)
- **Tag:** `lemoelink/lemoe:cuda`
- **Base:** Nvidia CUDA Runtime
- **Descripción:** Utiliza esta versión únicamente si vas a cargar modelos locales pesados (como Llama 3) directamente en LEMoE y tienes una tarjeta gráfica Nvidia. Requiere pasar el parámetro `--gpus all` a Docker.

---

## Cómo Ejecutar LEMoE

Puedes arrancar el contenedor con un solo comando. Recomendamos encarecidamente utilizar "volúmenes" para asegurar que tu configuración y los modelos que el sistema descargue no se pierdan si reinicias el contenedor.

Copia y pega este comando en tu terminal:

```bash
docker run -d -p 11435:11435 \
  -v ./config:/app/config \
  -v ./models:/app/models \
  -v ./data:/app/data \
  --name lemoe \
  lemoelink/lemoe:general
```

### Explicación de los volúmenes

1. **`/app/config`**: Al montar esta carpeta, podrás ver y editar los archivos `config.json` y `experts.json` directamente desde tu ordenador sin necesidad de reconstruir el contenedor. Los cambios se aplicarán automáticamente.
2. **`/app/models`**: Aquí es donde LEMoE guarda los modelos que descarga de internet (como el enrutador semántico). Si no montas este volumen, LEMoE tendrá que descargar cientos de megabytes cada vez que lo enciendas.
3. **`/app/data`**: Mantiene un registro persistente de las métricas de uso y telemetría de tu servidor.

## Actualizar a una nueva versión

Cuando salga una nueva versión de LEMoE, actualizar tu nodo es tan sencillo como ejecutar:

```bash
docker pull lemoelink/lemoe:general
docker stop lemoe
docker rm lemoe
# Y vuelves a ejecutar el comando "docker run" de arriba
```
