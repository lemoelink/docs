---
id: plugin-telemetry-dashboard
title: Plugin de Dashboard de Telemetría
sidebar_position: 6
description: Cómo usar el plugin telemetry_dashboard para monitorizar el uso de modelos expertos en tiempo real con un panel web interactivo.
---

# Plugin de Dashboard de Telemetría

El plugin `telemetry_dashboard` registra métricas de uso por experto (peticiones, tokens, latencia, costos, éxitos/fallos) y sirve un panel web interactivo con gráficas en tiempo real.

## El problema que resuelve

Cuando ejecutas l3mcore con múltiples expertos, necesitas saber cuál se usa más, cuánto cuesta cada llamada a APIs externas, y si hay fallos. Sin visibilidad, es difícil optimizar la configuración de expertos o detectar problemas de rendimiento.

## Cómo funciona

El plugin implementa dos mecanismos:

1. **Hook `after_generation`**: Registra métricas después de cada respuesta del experto.
2. **Servidor Flask**: Un hilo daemon ejecuta un servidor web en el puerto configurado con el dashboard.

```
Petición API → ExpertDispatcher → Respuesta
                    ↓
        hook_after_generation(response, label)
                    ↓
        record_telemetry(label, latency, tokens, success)
                    ↓
        logs/telemetry.json (persistencia)
                    ↓
        Dashboard web (puerto 8081) ← Lectura del JSON
```

## Configuración

Añade la sección `"telemetry_dashboard"` en `config/config.json`:

```json
{
  "telemetry_dashboard": {
    "port": 8081,
    "host": "127.0.0.1",
    "api_key": "",
    "cost_per_1m": {}
  }
}
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `port` | int | `8081` | Puerto del servidor del dashboard |
| `host` | string | `"127.0.0.1"` | Dirección de bind del servidor |
| `api_key` | string | `""` | Clave de API para autenticación (vacía = sin auth) |
| `cost_per_1m` | dict | `{}` | Tabla de precios personalizada por modelo |

### Autenticación

Si configuras `api_key`, todas las peticiones al dashboard y a la API de métricas deben incluir la cabecera `X-API-Key`:

```bash
curl -H "X-API-Key: tu-clave-secreta" http://localhost:8081/api/data
```

### Tabla de precios personalizada

Por defecto, el plugin usa una tabla de precios interna para modelos conocidos (GPT-4o, Claude, Gemini, etc.). Puedes sobreescribirla o agregar modelos propios:

```json
{
  "telemetry_dashboard": {
    "cost_per_1m": {
      "gpt-4o": [5.0, 15.0],
      "mi-modelo-local": [0.0, 0.0],
      "mi-modelo-api": [2.0, 8.0]
    }
  }
}
```

Los valores son `[costo_input_por_1M, costo_output_por_1M]` en USD.

## Panel de telemetría

### Tarjetas KPI
- **Total Cost**: Costo estimado total de llamadas a APIs.
- **Total Tokens**: Tokens totales procesados.
- **Success Rate**: Porcentaje de peticiones exitosas.

### Tabla de expertos (7 columnas)

| Columna | Descripción |
|---------|-------------|
| Expert Router | Etiqueta del experto |
| Reqs | Peticiones procesadas |
| Tokens (In/Out) | Tokens de entrada y salida |
| Throughput | Tokens por segundo |
| Avg Latency | Latencia promedio en ms |
| Cost | Costo estimado (solo APIs) |
| Health | Tasa de éxito |

### Gráficas
- **Timeline**: Evolución temporal de peticiones (Chart.js bar).
- **Cost Distribution**: Distribución de costos por experto (doughnut).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Interfaz del dashboard (HTML) |
| GET | `/api/data` | Métricas en formato JSON |
| GET | `/api/export` | Exportar métricas como CSV |

## Comportamiento

| Escenario | Resultado |
|-----------|-----------|
| Petición normal | Registra peticiones, tokens, latencia, costo |
| Fallo del experto | Registra el fallo, actualiza health |
| Expertos tipo API | Calcula costo según tabla de precios |
| Expertos locales/Ollama | Costo mostrado como `-` |
| Arranque del servidor | Inicia hilo daemon del dashboard |

## Verificar que funciona

Al arrancar l3mcore, el log debe mostrar:

```
INFO - Enterprise Telemetry dashboard running on http://127.0.0.1:8081
```

Abre `http://localhost:8081` en tu navegador para ver el panel.
