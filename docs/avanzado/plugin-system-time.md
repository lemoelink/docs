---
id: plugin-system-time
title: Plugin de Fecha y Hora
sidebar_position: 4
description: Cómo usar el plugin system_time para inyectar automáticamente la fecha y hora local en el contexto del modelo experto de l3mcore.
---

# Plugin de Fecha y Hora del Sistema

El plugin `system_time` inyecta automáticamente un mensaje del sistema al principio de la conversación conteniendo la fecha y hora local del sistema. Esto permite a cualquier modelo experto responder de forma precisa a preguntas que requieran conciencia temporal (ej. *"¿qué día es hoy?"* o *"¿cuánto falta para el fin de semana?"*).

## El problema que resuelve

Por defecto, los modelos de lenguaje (LLM) no tienen conciencia del tiempo real ni acceso al reloj del sistema donde se ejecutan; sus conocimientos temporales están limitados a la fecha de corte de su entrenamiento. 

Al inyectar dinámicamente la fecha y hora del sistema antes de procesar cada petición, l3mcore dota a todos sus expertos de conciencia temporal en tiempo de ejecución.

---

## Cómo funciona

El plugin implementa el hook `override_route`, que se ejecuta milisegundos antes del enrutamiento semántico habitual.

```
Peticion llega a l3mcore
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Inyecta mensaje del sistema en la posicion [0]:
        │   "System Context: The current local date and time is..."
        |
        v
El router semantico (E5) clasifica el prompt normalmente
        |
        v
El experto recibe el historial completo incluyendo el contexto temporal
```

El plugin modifica de forma segura el array de mensajes en memoria y siempre devuelve `None` para permitir que el enrutamiento semántico normal continúe sin interrupciones.

---

## Requisitos y Configuración

### 1. Activar el directorio de plugins

Asegúrate de tener habilitada la carpeta `plugins/` en la raíz de tu proyecto de l3mcore.

### 2. Copiar el archivo del plugin

Copia el fichero `system_time.py` desde el repositorio oficial de plugins en la carpeta `plugins/` de tu instalación:

* **Descarga directa:** [system_time.py](https://github.com/lemoelink/plugins/blob/main/system_time.py)

### 3. Personalizar el formato (Opcional)

Por defecto, el plugin utiliza el formato `"Day, Month Day, Year, HH:MM:SS"` (por ejemplo: `Tuesday, June 02, 2026, 16:22:32`).

Puedes personalizar este formato utilizando la directiva estándar de formateo de tiempo de Python (`strftime`) en tu archivo `config/config.json`. Añade un objeto `"system_time"` con el parámetro `"format"`:

```json
{
  "router": { ... },
  "system_time": {
    "format": "%d/%m/%Y %H:%M:%S"
  }
}
```

*En este ejemplo, la hora se inyectará como: `02/06/2026 16:22:32`.*

---

## Verificar que funciona

Al arrancar el servidor de l3mcore, el log del sistema debe confirmar la carga del plugin:

```
INFO - Loaded plugin: system_time
```

Cuando entra una consulta, el plugin inyecta silenciosamente el mensaje y registra la acción:

```
INFO - system_time: Inyectada fecha y hora actual del sistema (Tuesday, June 02, 2026, 16:22:32) en la peticion.
```

---

## Comportamiento ante distintos inputs

| Entrada | Resultado |
|---|---|
| Lista de mensajes normal | Inyecta el mensaje temporal en el índice `0` de la lista y devuelve `None`. |
| Petición sin historial o vacía | Pasa en silencio y devuelve `None`. |
| Parámetro `messages` malformado (no es lista) | El plugin captura el error de forma segura, registra un aviso y continúa. |
