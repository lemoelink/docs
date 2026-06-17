---
id: plugin-telemetry-dashboard
title: Telemetry and Dashboard Plugin
sidebar_position: 6
description: How to use the telemetry_dashboard plugin to monitor expert model usage in real time with an interactive web dashboard.
---

# Telemetry and Dashboard Plugin

The `telemetry_dashboard` plugin records per-expert usage metrics (requests, tokens, latency, costs, success/failure rates) and serves an interactive web dashboard with real-time charts.

## Problem it solves

When running l3mcore with multiple experts, you need to know which one is used most, how much each external API call costs, and whether there are failures. Without visibility, it's hard to optimize expert configuration or detect performance issues.

## How it works

The plugin uses two mechanisms:

1. **`after_generation` hook**: Records metrics after each expert response.
2. **Flask server**: A daemon thread runs a web server on the configured port serving the dashboard.

```
API Request → ExpertDispatcher → Response
                    ↓
        hook_after_generation(response, label)
                    ↓
        record_telemetry(label, latency, tokens, success)
                    ↓
        logs/telemetry.json (persistence)
                    ↓
        Web dashboard (port 8081) ← Reads JSON
```

## Configuration

Add the `"telemetry_dashboard"` section in `config/config.json`:

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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `port` | int | `8081` | Dashboard server port |
| `host` | string | `"127.0.0.1"` | Server bind address |
| `api_key` | string | `""` | API key for authentication (empty = no auth) |
| `cost_per_1m` | dict | `{}` | Custom pricing table per model |

### Authentication

If you configure `api_key`, all requests to the dashboard and metrics API must include the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-secret-key" http://localhost:8081/api/data
```

### Custom pricing table

By default, the plugin uses an internal pricing table for known models (GPT-4o, Claude, Gemini, etc.). You can override it or add your own models:

```json
{
  "telemetry_dashboard": {
    "cost_per_1m": {
      "gpt-4o": [5.0, 15.0],
      "my-local-model": [0.0, 0.0],
      "my-api-model": [2.0, 8.0]
    }
  }
}
```

Values are `[input_cost_per_1M, output_cost_per_1M]` in USD.

## Dashboard Interface (`http://localhost:8081`)

### KPI Cards
- **Total Cost**: Estimated total cost of API calls.
- **Total Tokens**: Total tokens processed.
- **Success Rate**: Percentage of successful requests.

### Expert Table (7 columns)

| Column | Description |
|--------|-------------|
| Expert Router | Expert label |
| Reqs | Processed requests |
| Tokens (In/Out) | Input and output tokens |
| Throughput | Tokens per second |
| Avg Latency | Average latency in ms |
| Cost | Estimated cost (API only) |
| Health | Success rate |

### Charts
- **Timeline**: Request evolution over time (Chart.js bar).
- **Cost Distribution**: Cost distribution by expert (doughnut).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard interface (HTML) |
| GET | `/api/data` | Metrics in JSON format |
| GET | `/api/export` | Export metrics as CSV |

## Behavior

| Scenario | Result |
|----------|--------|
| Normal request | Records requests, tokens, latency, cost |
| Expert failure | Records failure, updates health |
| API experts | Calculates cost from pricing table |
| Local/Ollama experts | Cost shown as `-` |
| Server startup | Starts dashboard daemon thread |

## Verification

When starting l3mcore, the log should show:

```
INFO - Enterprise Telemetry dashboard running on http://127.0.0.1:8081
```

Open `http://localhost:8081` in your browser to view the dashboard.
