---
id: plugin-paperless-search
title: Plugin de Busqueda en Paperless-ngx
sidebar_position: 6
description: Como usar el plugin paperless_search para conectar tu gestor documental local con los modelos expertos de l3mcore.
---

# Plugin de Busqueda en Paperless-ngx

El plugin `paperless_search` integra de forma nativa tu gestor documental local Paperless-ngx con l3mcore. Detecta cuando el usuario realiza una consulta sobre sus documentos, extrae y limpia los terminos de busqueda, interroga la base de datos de Paperless-ngx, inyecta el contenido del documento encontrado en el contexto y redirige la consulta de forma segura al experto en documentos (`document-expert`).

## El problema que resuelve

La integracion de asistentes de IA con bases de datos documentales locales a menudo sufre de dos problemas:
1. **Falsos positivos**: Peticiones creativas o de formato (como *"escribe una plantilla de factura..."*) pueden ser clasificadas erroneamente como busquedas documentales, lo que provoca la inyeccion de documentos reales y la consiguiente fuga de informacion privada del usuario en la respuesta generada.
2. **Aislamiento de enrutamiento**: Si el enrutador semantico general tiene palabras clave genericas asignadas al experto de documentos (como *"factura"*), cualquier consulta creativa acabara en el experto de documentos por error.

El plugin `paperless_search` soluciona estos problemas interceptando la consulta mediante una lista de palabras de exclusion (`exclude_words`) antes de evaluar el clasificador semantico, e interactua de forma directa y exclusiva con el experto de documentos tras haber inyectado con exito el contexto.

---

## Como funciona

El plugin implementa el hook `override_route`, ejecutandose antes de las clasificaciones del router semantico general de l3mcore.

```
Peticion llega a l3mcore
        |
        v
Normalizacion de texto y evaluacion de exclude_words
        |
        ├── Si coincide alguna palabra excluida (ej. "plantilla"):
        │   Devuelve None (continua al flujo general creativo/seguro)
        |
        v
Clasificacion semantica de intencion de busqueda (LEMoEppc)
        |
        ├── Si la puntuacion es menor al umbral:
        │   Devuelve None (continua al flujo general)
        |
        v
Destilacion de terminos de busqueda (lemoe-query-distiller)
        |
        v
Consulta a la API local de Paperless-ngx y recuperacion de texto
        |
        v
Inyeccion de contenido de documentos en el historial de mensajes
        |
        v
Devuelve "document-expert" (fuerza la ruta de forma segura)
```

---

## Requisitos y Configuracion

### 1. Activar el directorio de plugins

Asegurate de tener habilitada la carpeta `plugins/` en la raiz de tu proyecto de l3mcore.

### 2. Copiar el archivo del plugin

Copia el fichero `paperless_search.py` en la carpeta `plugins/` de tu instalacion.

### 3. Configuracion de Variables de Entorno (.env)

Para evitar exponer credenciales y tokens de acceso en el codigo o en los archivos de configuracion compartidos, el plugin lee prioritariamente las credenciales desde variables de entorno. Puedes definirlas en tu archivo `.env` en la raiz del proyecto:

```env
# URL de la API interna que usara LeMoE para hacer busquedas
PAPERLESS_API_URL=http://localhost:8000

# URL publica que usara el navegador del usuario para abrir/descargar documentos
PAPERLESS_WEB_URL=http://localhost:8000

# Token de la API generado en el panel de administracion de Paperless
PAPERLESS_API_TOKEN=tu_token_de_api_secreto_aqui
```

*Nota: Si ejecutas LeMoE dentro de un contenedor de Docker y Paperless en otro, la variable `PAPERLESS_API_URL` debera apuntar al contenedor de Paperless (ej. `http://paperless-webserver:8000`), mientras que `PAPERLESS_WEB_URL` debera apuntar a la direccion accesible desde tu navegador (ej. `http://localhost:8000`).*

### 4. Configurar parametros adicionales en config.json

Los parametros de clasificacion y palabras de exclusion se definen en el archivo `config/config.json`. Si las variables de entorno anteriores no estan definidas, el plugin tambien intentara leerlas desde este archivo de forma opcional:

```json
{
  "paperless_search": {
    "api_url": "http://localhost:8000",
    "api_token": "tu_token_de_api_aqui",
    "use_semantic_router": true,
    "similarity_threshold": 0.45,
    "max_results": 3,
    "exclude_words": ["crea", "inventa", "plantilla", "ficticia", "haz"]
  }
}
```

*Nota: Recuerda definir el experto `document-expert` en tu configuracion `config/experts.json` usando keywords internas privadas para evitar accesos accidentales desde el enrutador general.*

---

## Despliegue con Docker Compose (Pila Completa)

Si deseas desplegar de manera conjunta LeMoE, Ollama (para la ejecucion local del LLM) y Paperless-ngx (con su base de datos y broker local), puedes utilizar el siguiente archivo `docker-compose.yml` de ejemplo.

Crea un archivo llamado `docker-compose-paperless.yml` en la raiz de tu instalacion de l3mcore con el siguiente contenido:

```yaml
version: '3.8'

services:
  l3mcore:
    build:
      context: .
      dockerfile: private/docker/Dockerfile
    container_name: l3mcore
    ports:
      - "11435:11435"
    env_file:
      - .env
    volumes:
      - ./config:/app/config
      - ./plugins:/app/plugins
      - ./logs:/app/logs
    depends_on:
      - ollama
      - paperless-webserver
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  paperless-webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    container_name: paperless-webserver
    restart: unless-stopped
    depends_on:
      - paperless-redis
    ports:
      - "8000:8000"
    volumes:
      - paperless_data:/usr/src/paperless/data
      - paperless_media:/usr/src/paperless/media
      - paperless_export:/usr/src/paperless/export
      - paperless_consume:/usr/src/paperless/consume
    environment:
      - PAPERLESS_REDIS=redis://paperless-redis:6379
      - PAPERLESS_URL=http://localhost:8000
      - PAPERLESS_TIME_ZONE=Europe/Madrid
      - PAPERLESS_OCR_LANGUAGE=spa

  paperless-redis:
    image: redis:7-alpine
    container_name: paperless-redis
    restart: unless-stopped

volumes:
  ollama_data:
  paperless_data:
  paperless_media:
  paperless_export:
  paperless_consume:
```

Para arrancar el despliegue de toda la infraestructura local, crea tu archivo `.env` con las credenciales indicadas en la seccion anterior y ejecuta el comando:

```bash
docker compose -f docker-compose-paperless.yml up -d
```

---

## Verificar que funciona

Al iniciar l3mcore, el log del sistema debe confirmar la carga del plugin:

```
INFO - Loaded plugin: paperless_search
```

Cuando se recibe una consulta valida de busqueda documental, el log registrara la extraccion de terminos y la inyeccion de contexto:

```
INFO - paperless_search: Consulta de busqueda detectada.
INFO - paperless_search: Terminos destilados: factura de shisha
INFO - paperless_search: Encontrados 1 documentos relevantes. Inyectando contexto...
INFO - paperless_search: Enrutando peticion de forma manual al experto document-expert
```

En caso de detectarse una palabra de exclusion, el plugin abortara la busqueda de inmediato de manera segura:

```
INFO - paperless_search: Palabra excluida 'plantilla' detectada. Saltando busqueda en Paperless.
```

---

## Comportamiento ante distintos inputs

| Entrada | Resultado |
|---|---|
| Consulta sobre documentos reales | Valida intencion, extrae terminos, busca en Paperless-ngx, inyecta contexto y devuelve `"document-expert"`. |
| Peticion creativa/plantilla con palabra excluida | Cancela la ejecucion al inicio y devuelve `None`. |
| Peticion general sin relacion con documentos | El clasificador local determina que no hay intencion de busqueda y devuelve `None`. |
