---
id: enrutamiento-contextual
title: Enrutamiento Contextual y Auto-Correccion
sidebar_position: 5
description: Enrutamiento en cascada con memoria de conversacion y auto-recuperacion silenciosa ante fallos de expertos.
---

# Enrutamiento Contextual y Auto-Correccion

## Enrutamiento Contextual en Cascada

LEMoE evalua el contexto de la conversacion para mantener la continuidad tematica en chats de varios turnos. Este sistema es 100% sin estado (stateless): no requiere base de datos, ni sesiones, ni uso de RAM por usuario.

Funciona con cualquier numero de usuarios simultaneos porque cada peticion lleva su propio contexto a traves del array estandar `messages` de OpenAI. OpenWebUI, Continue.dev y cualquier otro cliente compatible ya envian el historial completo de la conversacion en cada peticion.

### Flujo de decision

```
Peticion con messages[]
    |
    v
Paso 1: Evaluar ultimo mensaje del usuario
    | confianza >= umbral? --> Usar ese experto
    | confianza < umbral
    v
Paso 2: Concatenar ultimos 2-3 mensajes del usuario
    | confianza >= umbral? --> Usar ese experto
    | confianza < umbral
    v
Paso 3: Modelo fallback
```

### Paso 1: Ultimo mensaje

El router evalua unicamente el ultimo mensaje del usuario. Si la puntuacion de confianza supera el `confidence_threshold` configurado en `config.json`, el experto se selecciona inmediatamente.

Esto permite que el usuario **cambie de tema** en mitad de un chat. Si dice "Redactame un contrato de alquiler" tras 10 mensajes hablando de Python, el router detectara el cambio y enrutara al experto legal.

### Paso 2: Contexto ampliado

Si el ultimo mensaje tiene baja confianza (por ejemplo, "Hazlo mas corto" o "Explicame el segundo punto"), el router concatena los ultimos N mensajes del usuario (configurable con `context_messages`, por defecto 3) y re-evalua.

Al incluir mensajes anteriores como "Hazme un script en Python que lea un CSV", el router obtiene suficiente contexto para deducir que la conversacion sigue siendo sobre programacion.

El texto concatenado se trunca a `context_max_chars` (por defecto 1600 caracteres) para mantenerse dentro de la ventana de 512 tokens del modelo de embeddings.

### Paso 3: Fallback

Si ningun paso produce una coincidencia con suficiente confianza, la peticion se envia al modelo de fallback (ID 0).

### Configuracion

Estos parametros se configuran en la seccion `router` de `config/config.json`:

| Parametro | Tipo | Defecto | Descripcion |
|---|---|---|---|
| `context_messages` | int | `3` | Numero de mensajes recientes del usuario a concatenar en el Paso 2. |
| `context_max_chars` | int | `1600` | Limite de caracteres del texto concatenado. |

### Logs del administrador

La consola muestra que paso de la cascada resolvio cada peticion:

```
INFO - [Cascade] Step 1: 'Hazme un script en Python' -> programador_python (0.92)
INFO - [Cascade] Step 1: 'Hazlo mas corto' -> score 0.15 below threshold (0.4). Escalating to Step 2.
INFO - [Cascade] Step 2: 'Hazme un script...Hazlo mas corto' -> programador_python (0.87)
```

---

## Auto-Correccion Silenciosa

Si un experto falla durante la inferencia por cualquier motivo (timeout, conexion rechazada, API caida, error interno del modelo), el sistema intercepta el error y redirige automaticamente la peticion al modelo de fallback.

### Comportamiento para el usuario final

El usuario recibe una respuesta normal generada por el modelo de fallback. No se muestra ningun mensaje de error ni indicacion de que ocurrio un fallo interno. La experiencia es completamente transparente.

### Comportamiento para el administrador

Los eventos de auto-correccion se registran en la consola y en los logs del servidor con el prefijo `[Auto-Correction]`:

```
ERROR - [Auto-Correction] Routed expert 'programador_python' failed: Connection refused. Redirecting to fallback.
ERROR - [Auto-Correction] Explicit expert 'asesor_legal' failed: Timeout after 30s. Redirecting to fallback.
```

### Cobertura

La auto-correccion cubre todas las fases del enrutamiento:

| Fase | Descripcion |
|---|---|
| Plugin forzado | Si un plugin fuerza una ruta y el experto falla |
| Experto explicito | Si el usuario selecciona un modelo concreto y este falla |
| Router semantico | Si el router elige un experto y este falla |
| Fallback | Si el propio fallback falla, se devuelve un mensaje de error generico |

:::warning
Si el modelo de fallback tambien falla (caso extremadamente raro, por ejemplo un fallo catastrofico de disco o VRAM), el usuario recibira un mensaje de error generico. El detalle del error nunca se expone al usuario final; solo se registra en los logs del servidor.
:::
