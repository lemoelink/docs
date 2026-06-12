---
id: tool-calendar-smart
title: Tool Calendar Smart
sidebar_position: 10
description: Conecta l3mcore con tu Google Calendar para gestionar reuniones e intenciones de agenda.
---

# Tool Calendar Smart

La herramienta `calendar_smart` conecta l3mcore con la API de Google Calendar para listar y programar eventos de forma automatica mediante Tool Calling.

## Creacion de aplicacion en Google Cloud Console

Para poder utilizar esta herramienta, es necesario configurar una aplicacion en Google Cloud Console:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto.
3. Habilita la **Google Calendar API** desde la seccion de APIs y Servicios.
4. Ve a la pestaña **Pantalla de consentimiento de OAuth** (OAuth consent screen), selecciona tipo de usuario externo y configura tu email. Añade el scope `.../auth/calendar` si es necesario.
5. Ve a **Credenciales**, haz clic en *Crear credenciales* e indica *ID de cliente de OAuth* (Tipo: Aplicacion de escritorio).
6. Descarga el archivo JSON de credenciales y guardalo en `config/google_credentials.json`.
7. Al ejecutar la primera peticion al calendario, l3mcore abrira el navegador web para realizar la autenticacion local inicial de un solo uso y generara el archivo de token persistente en `config/google_token.json`.

---

## Dependencias

Instala los paquetes oficiales de Google:

```bash
pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
```

---

## Configuracion

Configura los archivos y duraciones en `config/config.json`:

```json
{
  "calendar_smart": {
    "enabled": true,
    "credentials_file": "config/google_credentials.json",
    "token_file": "config/google_token.json",
    "calendar_id": "primary",
    "max_events": 10,
    "default_duration_minutes": 60
  }
}
```

---

## Herramientas Disponibles

La herramienta expone las siguientes funciones al LLM:

1. `list_calendar_events(days_ahead)`: Lista los proximos eventos de la agenda.
2. `create_calendar_event(summary, start_time, duration_minutes)`: Programa un nuevo evento con fecha, hora y duracion indicados.
