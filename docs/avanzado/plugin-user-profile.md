---
id: plugin-user-profile
title: Plugin de Perfil de Usuario
sidebar_position: 5
description: Cómo usar el plugin user_profile para personalizar dinámicamente las respuestas de todos los expertos en LEMoE con tus datos e instrucciones.
---

# Plugin de Perfil de Usuario

El plugin `user_profile` inyecta automáticamente un bloque de información del usuario (nombre, preferencias generales de conversación e instrucciones personalizadas) como un mensaje del sistema al principio de la conversación. Esto permite a cualquier experto de LEMoE adaptar su tono, formato y estilo de respuesta para alinearse con tus preferencias personales.

## El problema que resuelve

En un sistema multi-experto, configurar instrucciones personalizadas globales (*custom instructions*) de forma individual para cada uno de los 15+ expertos puede ser repetitivo y propenso a errores. 

El plugin `user_profile` resuelve esto centralizando tu identidad y preferencias de usuario en un solo lugar. Cualquier experto asignado por el enrutador recibirá automáticamente tu perfil de usuario al inicio del contexto, logrando una personalización unificada de todo el sistema.

---

## Cómo funciona

El plugin implementa el hook `override_route`, que se ejecuta milisegundos antes del enrutamiento semántico habitual.

```
Peticion llega a LEMoE
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Lee la configuracion en config.json (user_profile)
        ├── Construye bloque formateado:
        │   "System Context (User Profile):
        │    - User Name: ...
        │    - User Preferences: ...
        │    - Custom Instructions: ..."
        ├── Inyecta mensaje del sistema en la posicion [0]
        |
        v
El router semantico (E5) clasifica el prompt normalmente
        |
        v
El experto recibe las instrucciones del perfil de usuario y adapta su respuesta
```

El plugin modifica de forma segura el array de mensajes en memoria y siempre devuelve `None` para permitir que el enrutamiento semántico normal continúe sin interrupciones.

---

## Requisitos y Configuración

### 1. Activar el directorio de plugins

Asegúrate de tener habilitada la carpeta `plugins/` en la raíz de tu proyecto de LEMoE.

### 2. Copiar el archivo del plugin

Copia el fichero `user_profile.py` desde el repositorio oficial de plugins en la carpeta `plugins/` de tu instalación:

* **Descarga directa:** [user_profile.py](https://github.com/lemoelink/plugins/blob/main/user_profile.py)

### 3. Declarar tu Perfil en config.json

Añade un objeto `"user_profile"` a tu archivo `config/config.json` con los campos deseados:

```json
{
  "router": { ... },
  "user_profile": {
    "name": "Gerardo",
    "preferences": "Prefiero respuestas concisas, estructuradas y con explicaciones tecnicas si es necesario.",
    "custom_instructions": "Usa Python para todos los ejemplos de codigo y responde siempre en español de forma profesional."
  }
}
```

#### Campos soportados (todos opcionales):

| Campo | Tipo | Descripción |
|---|---|---|
| `"name"` | `string` | Tu nombre de usuario para que el modelo pueda dirigirse a ti de forma directa. |
| `"preferences"` | `string` | Preferencias generales de estilo (ej. respuestas breves, bullet points, tono alegre, etc.). |
| `"custom_instructions"` | `string` | Reglas o restricciones específicas obligatorias para el desarrollo o la interacción con el código. |

*Si no declaras el objeto `"user_profile"` o todos los campos están vacíos, el plugin pasará en silencio sin alterar la petición.*

---

## Verificar que funciona

Al arrancar el servidor de LEMoE, el log del sistema debe confirmar la carga del plugin:

```
INFO - Loaded plugin: user_profile
```

Cuando entra una consulta, el plugin inyecta silenciosamente tu perfil y registra la acción (mostrando tu nombre si está configurado):

```
INFO - user_profile: Inyectadas preferencias de usuario (Gerardo) en la peticion.
```

---

## Comportamiento ante distintos inputs

| Entrada | Resultado |
|---|---|
| Petición con perfil configurado | Inyecta el perfil formateado en el índice `0` de la lista y devuelve `None`. |
| Petición sin perfil configurado | Pasa en silencio sin modificar nada de la lista y devuelve `None`. |
| Parámetro `messages` malformado (no es lista) | El plugin captura el error de forma segura, registra un aviso y continúa. |
