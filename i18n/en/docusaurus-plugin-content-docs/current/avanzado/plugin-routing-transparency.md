---
id: plugin-routing-transparency
title: Routing Transparency Plugin
sidebar_position: 7
description: How to use the routing_transparency plugin to show the user which expert processed their request and with what confidence level.
---

# Routing Transparency Plugin

The `routing_transparency` plugin automatically appends a small note to the end of each response indicating which expert processed the request and what confidence score the router had when making that decision.

It might seem like a minor addition, but in practice, it transforms the user experience: the user stops seeing the system as a black box and starts understanding why they receive certain responses.

```
---
 Routed to: **programmer** (confidence: 87%)
```

---

## The Problem It Solves

l3mcore automatically routes each message to the most suitable expert, but this decision is completely invisible to the user. When someone asks a question and gets a good response, they don't know if it was luck or if the system made the correct choice. When they get a bad response, they also don't know if the issue was the wrong expert or the model itself.

Routing transparency makes this internal logic tangible. It is especially useful during initial setup when you are tuning experts and keywords and need to know if the router is making the decisions you expect.

---

## How It Works

The plugin implements the `after_generation` hook, which runs right after the expert generates its response, before it is sent to the client.

```
Request arrives at l3mcore
        │
        v
Semantic Router chooses expert (e.g., "programmer", score: 0.87)
        │
        v
The expert generates the response
        │
        v
Plugin hook: after_generation(response, expert_label)
        │
        ├── Appends footer to the end of the text
        │   "---  Routed to: **programmer** (confidence: 87%)"
        │
        v
Final response arrives at the client with the footer included
```

The footer never modifies the content of the response itself; it only appends it to the end. If the plugin fails for any reason, the original response is delivered without changes.

---

## Installation

1. Copy the `routing_transparency.py` file into the `plugins/` folder of your l3mcore installation.
2. Restart the server.

Upon startup, you will see in the logs:

```
INFO - Loaded plugin: routing_transparency
```

It does not require any additional dependencies.

---

## Configuration

All configuration lives in `config/config.json` under the `routing_transparency` key. If you do not add anything, the plugin works with the default values.

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

| Key | Default Value | Description |
|---|---|---|
| `enabled` | `true` | Main switch. Set to `false` to disable the footer without removing the plugin file. |
| `show_score` | `true` | Shows the confidence percentage next to the expert's name. |
| `show_method` | `false` | Reserved for future use. Will display whether the decision was made via embedding or keyword fallback. |
| `separator` | `"---"` | Separator line before the footer. Maximum 80 characters. |
| `label` | `" Routed to"` | Text preceding the expert name. Maximum 60 characters. |

### Disabling in Production

If you are using l3mcore in a production environment where you do not want users to see routing information, simply disable the plugin:

```json
{
  "routing_transparency": {
    "enabled": false
  }
}
```

Changes in `config.json` are detected upon the next server restart.

---

## Security

The plugin applies the following measures before writing any data to the response:

- The `expert_label` is validated against a strict regular expression (`^[a-zA-Z0-9_\-]{1,64}$`) before being included in the footer. If the value fails validation, it is replaced with `"unknown"`.
- The `separator` and `label` values read from `config.json` are sanitized by removing control characters and are truncated to their maximum length.
- The hook is fully wrapped in a `try/except` block: any error returns the original unmodified response, preventing server crashes.

---

## Behavior under Different Scenarios

| Situation | Result |
|---|---|
| Normal routing via embedding | Footer with expert name and confidence. |
| Forced routing by plugin (e.g. image_router) | Footer shows expert with 100% confidence. |
| Explicit route by client (`model: "programmer"`) | Footer shows expert with 100% confidence. |
| Fallback (router below threshold) | Footer shows `fallback`. |
| Disabled plugin (`enabled: false`) | Response unmodified. |
| Internal plugin error | Response unmodified. The error is logged. |

---

## Download

- **Official Plugins Repository:** [github.com/lemoelink/plugins](https://github.com/lemoelink/plugins)
- **Direct Download:** [routing_transparency.py](https://github.com/lemoelink/plugins/blob/main/routing_transparency.py)
