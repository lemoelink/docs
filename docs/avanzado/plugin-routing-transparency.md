---
id: plugin-routing-transparency
title: Plugin de Transparencia de Enrutamiento
sidebar_position: 7
description: Cómo usar el plugin routing_transparency para mostrar al usuario qué experto procesó su solicitud y con qué nivel de confianza.
---

# Plugin de Transparencia de Enrutamiento

El plugin `routing_transparency` añade automáticamente una pequeña nota al final de cada respuesta indicando qué experto procesó la solicitud y qué porcentaje de confianza tuvo el router al tomar esa decisión.

Parece algo menor, pero en la práctica transforma la experiencia de uso: el usuario deja de ver el sistema como una caja negra y empieza a entender por qué recibe ciertas respuestas.

```
---
 Routed to: **programador** (confidence: 87%)
```

---

## El problema que resuelve

l3mcore enruta cada mensaje al experto más adecuado de forma automática, pero esa decisión es completamente invisible para el usuario. Cuando alguien pregunta algo y recibe una respuesta buena, no sabe si fue suerte o si el sistema eligió correctamente. Cuando recibe una respuesta mala, tampoco sabe si el problema fue el experto equivocado o el modelo en sí.

La transparencia de enrutamiento convierte esa lógica interna en algo tangible. Es especialmente útil durante la configuración inicial, cuando estás ajustando los expertos y las keywords y necesitas saber si el router está tomando las decisiones que esperas.

---

## Cómo funciona

El plugin implementa el hook `after_generation`, que se ejecuta justo después de que el experto genera su respuesta, antes de enviarla al cliente.

```
Solicitud llega a l3mcore
        │
        v
Router semántico elige experto (ej: "programador", score: 0.87)
        │
        v
El experto genera la respuesta
        │
        v
Plugin hook: after_generation(response, expert_label)
        │
        ├── Añade footer al final del texto
        │   "---  Routed to: **programador** (confidence: 87%)"
        │
        v
La respuesta final llega al cliente con el footer incluido
```

El footer nunca modifica el contenido de la respuesta; únicamente lo añade al final. Si el plugin falla por cualquier motivo, la respuesta original llega sin cambios.

---

## Instalación

1. Copia el fichero `routing_transparency.py` en la carpeta `plugins/` de tu instalación de l3mcore.
2. Reinicia el servidor.

Al arrancar verás en el log:

```
INFO - Loaded plugin: routing_transparency
```

No requiere ninguna dependencia adicional.

---

## Configuración

Toda la configuración vive en `config/config.json` bajo la clave `routing_transparency`. Si no añades nada, el plugin funciona con los valores por defecto.

```json
{
  "routing_transparency": {
    "enabled":     true,
    "show_score":  true,
    "show_method": false,
    "separator":   "---",
    "label":       " Routed to"
  }
}
```

| Clave | Valor por defecto | Descripción |
|---|---|---|
| `enabled` | `true` | Interruptor principal. Ponlo a `false` para desactivar el footer sin quitar el plugin. |
| `show_score` | `true` | Muestra el porcentaje de confianza junto al nombre del experto. |
| `show_method` | `false` | Reservado para uso futuro. Mostrará si la decisión fue por embedding o por keyword fallback. |
| `separator` | `"---"` | Línea separadora antes del footer. Máximo 80 caracteres. |
| `label` | `" Routed to"` | Texto que precede al nombre del experto. Máximo 60 caracteres. |

### Desactivar en producción

Si estás usando l3mcore en un entorno de producción donde no quieres que los usuarios vean la información de enrutamiento, simplemente desactiva el plugin:

```json
{
  "routing_transparency": {
    "enabled": false
  }
}
```

El cambio en `config.json` se detecta en el siguiente reinicio del servidor.

---

## Seguridad

El plugin aplica las siguientes medidas antes de escribir cualquier dato en la respuesta:

- El `expert_label` se valida contra una expresión regular estricta (`^[a-zA-Z0-9_\-]{1,64}$`) antes de incluirlo en el footer. Si el valor no pasa la validación, se sustituye por `"unknown"`.
- Los valores `separator` y `label` leídos desde `config.json` se sanean eliminando caracteres de control y se truncan a su longitud máxima.
- El hook está envuelto en un bloque `try/except` completo: cualquier error devuelve la respuesta original sin modificar, sin propagarse al servidor.

---

## Comportamiento ante distintos escenarios

| Situación | Resultado |
|---|---|
| Enrutamiento normal por embedding | Footer con nombre del experto y confianza. |
| Ruta forzada por plugin (p.ej. image_router) | Footer muestra el experto con confianza del 100%. |
| Ruta explícita por el cliente (`model: "programador"`) | Footer muestra el experto con confianza del 100%. |
| Fallback (router por debajo del umbral) | Footer muestra `fallback`. |
| Plugin desactivado (`enabled: false`) | Respuesta sin modificar. |
| Error interno del plugin | Respuesta sin modificar. El error queda registrado en el log. |

---

## Descarga

- **Repositorio oficial de plugins:** [github.com/lemoelink/plugins](https://github.com/lemoelink/plugins)
- **Descarga directa:** [routing_transparency.py](https://github.com/lemoelink/plugins/blob/main/routing_transparency.py)
