---
id: plugin-telemetry-dashboard
title: Plugin de Telemetría y Dashboard
sidebar_position: 8
description: Cómo usar el plugin telemetry_dashboard para monitorear solicitudes, tokens, latencias promedio y costes estimados de API en tiempo real.
---

# Plugin de Telemetría y Dashboard

El plugin `telemetry_dashboard` proporciona una interfaz web en tiempo real para monitorear el rendimiento de los expertos de l3mcore, incluyendo métricas clave como solicitudes procesadas, estimación de tokens consumidos, latencia media de respuesta y coste acumulado (en USD) para los expertos basados en API.

El dashboard ejecuta su propio servidor web Flask en segundo plano, permitiendo el acceso independiente sin interferir en el tráfico de inferencia.

---

## Características Principales

1. **Dashboard en Tiempo Real**: Gráfico de solicitudes por hora y métricas clave actualizadas automáticamente mediante `fetch` asíncrono cada 5 segundos (sin recargar la página).
2. **Medición de Latencia**: Registra el tiempo exacto que tarda cada experto en responder a través de `time.monotonic()` en el Core.
3. **Seguimiento de Costes**: Estima el gasto en USD basado en una tabla de precios interna (`_COST_PER_1M`) para proveedores de API (GPT-4o, Claude, Gemini, etc.).
4. **Persistencia y Control**: Guarda los datos en `logs/telemetry.json` y permite reiniciar las métricas mediante un botón de confirmación en la interfaz.

---

## Cómo Funciona

El plugin aprovecha hooks internos y comunicación lateral para capturar datos precisos:

- **Medición de Latencia**: Cuando el Core (`ExpertDispatcher`) procesa una solicitud, mide la latencia física del backend y la envía al plugin usando `record_latency(label, latency_ms)`.
- **after_generation Hook**: Consume la latencia pendiente asociada a esa inferencia, calcula los tokens estimados (usando una aproximación de `longitud_palabras * 1.3`), resuelve el coste si el experto es de tipo `api`, e incrementa el contador del experto en `logs/telemetry.json`.
- **Servidor Flask Independiente**: Levanta un servidor web ligero en el puerto `11436`.

---

## Instalación y Configuración

### 1. Activar el plugin
Simplemente copia el archivo `telemetry_dashboard.py` en la carpeta `plugins/` de tu instalación de l3mcore. El plugin se cargará de forma automática en el próximo arranque.

Verás la siguiente confirmación en la terminal:
```bash
[Plugin] Telemetry Dashboard → http://0.0.0.0:11436
```

### 2. Parámetros de Coste
El plugin calcula costes únicamente para los expertos definidos con `"type": "api"`. Utiliza la tabla interna de costes por millón de tokens de salida. Puedes ampliar o modificar estos precios modificando la variable `_COST_PER_1M` dentro del plugin.

---

## Interfaz del Dashboard (`http://localhost:11436`)

El dashboard web muestra un diseño moderno y minimalista con soporte para:
- **Tarjetas de KPI**: Total de solicitudes, total de tokens estimados, expertos activos y el experto más consultado.
- **Gráfico de Barras**: Historial de solicitudes agregadas por hora en las últimas 24 horas.
- **Tabla Detallada por Experto**:
  - **Experto**: Nombre/etiqueta del modelo especialista.
  - **Solicitudes**: Número total de llamadas dirigidas al experto.
  - **Tokens**: Estimación de tokens generados.
  - **Latencia Promedio**: Tiempo medio de respuesta (formateado en `ms` o `s`).
  - **Coste Estimado**: Coste total acumulado (solo para modelos API, en formato `$X.XXXX`).
  - **Distribución de Uso**: Gráfico de barra horizontal con el porcentaje relativo de uso del experto.

---

## Reiniciar Estadísticas
En la parte inferior de la interfaz, el dashboard incluye un botón **Reset Data**. Al hacer clic y confirmar en la ventana modal emergente, se vaciará el historial y se generará un archivo `telemetry.json` en blanco sin necesidad de reiniciar el servidor l3mcore.
