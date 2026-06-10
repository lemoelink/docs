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

### 3. Configurar parametros en config.json

Añade la seccion `paperless_search` en tu archivo de configuracion general `config/config.json`:

```json
{
  "paperless_search": {
    "paperless_url": "http://127.0.0.1:8000",
    "paperless_token": "tu_token_de_api_aqui",
    "use_semantic_router": true,
    "similarity_threshold": 0.45,
    "max_results": 3,
    "exclude_words": ["crea", "inventa", "plantilla", "ficticia", "haz"]
  }
}
```

*Nota: Recuerda definir el experto `document-expert` en tu configuracion `config/experts.json` usando keywords internas privadas para evitar accesos accidentales.*

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
