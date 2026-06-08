---
id: plugin-telemetry-dashboard
title: Telemetry and Dashboard Plugin
sidebar_position: 8
description: How to use the telemetry_dashboard plugin to monitor requests, tokens, average latencies, and estimated API costs in real time.
---

# Telemetry and Dashboard Plugin

The `telemetry_dashboard` plugin provides a real-time web interface to monitor the performance of l3mcore experts, including key metrics such as processed requests, estimated tokens consumed, average response latency, and accumulated cost (in USD) for API-based experts.

The dashboard runs its own Flask web server in the background, allowing independent access without interfering with inference traffic.

---

## Key Features

1. **Real-time Dashboard**: Hourly requests chart and key metrics automatically updated via asynchronous `fetch` every 5 seconds (without full page reloads).
2. **Latency Measurement**: Tracks the exact time each expert takes to respond using `time.monotonic()` in the Core.
3. **Cost Tracking**: Estimates USD spend based on an internal price table (`_COST_PER_1M`) for API providers (GPT-4o, Claude, Gemini, etc.).
4. **Persistence and Control**: Saves data in `logs/telemetry.json` and allows resetting metrics via a confirmation button in the UI.

---

## How It Works

The plugin leverages internal hooks and side-channel communication to capture accurate data:

- **Latency Measurement**: When the Core (`ExpertDispatcher`) processes a request, it measures the physical latency of the backend and sends it to the plugin using `record_latency(label, latency_ms)`.
- **after_generation Hook**: Consumes the pending latency associated with that inference, calculates estimated tokens (using a word_count * 1.3 approximation), resolves the cost if the expert is of type `api`, and increments the expert's counter in `logs/telemetry.json`.
- **Independent Flask Server**: Starts a lightweight web server on port `11436`.

---

## Installation and Configuration

### 1. Enable the plugin
Simply copy the `telemetry_dashboard.py` file into the `plugins/` directory of your l3mcore installation. The plugin will load automatically upon the next startup.

You will see the following confirmation in the terminal:
```bash
[Plugin] Telemetry Dashboard → http://0.0.0.0:11436
```

### 2. Cost Parameters
The plugin calculates costs only for experts defined with `"type": "api"`. It uses the internal output token price table. You can extend or modify these prices by updating the `_COST_PER_1M` variable inside the plugin file.

---

## Dashboard Interface (`http://localhost:11436`)

The web dashboard features a modern and minimalist design with support for:
- **KPI Cards**: Total requests, total estimated tokens, active experts, and most-called expert.
- **Bar Chart**: Hourly aggregated requests history over the last 24 hours.
- **Detailed Table by Expert**:
  - **Expert**: Name/label of the specialist model.
  - **Requests**: Total number of calls routed to the expert.
  - **Tokens**: Estimated generated tokens.
  - **Average Latency**: Mean response time (formatted in `ms` or `s`).
  - **Estimated Cost**: Total accumulated cost (API models only, formatted as `$X.XXXX`).
  - **Usage Distribution**: Horizontal bar chart showing the relative usage percentage of the expert.

---

## Resetting Statistics
At the bottom of the interface, the dashboard includes a **Reset Data** button. Clicking and confirming in the popup modal will clear the history and generate a blank `telemetry.json` file without requiring a restart of the l3mcore server.
