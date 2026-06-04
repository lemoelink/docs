---
id: plugin-system-time
title: System Time Plugin
sidebar_position: 4
description: How to use the system_time plugin to automatically inject the local date and time into the context of l3mcore's expert models.
---

# System Time Plugin

The `system_time` plugin automatically injects a system message at the beginning of the conversation containing the system's local date and time. This allows any expert model to respond accurately to queries requiring temporal awareness (e.g. *"what day is today?"* or *"how long until the weekend?"*).

## The problem it solves

By default, Large Language Models (LLMs) have no awareness of real time or access to the system clock of the machine they run on; their temporal knowledge is strictly limited to the training cutoff date. 

By dynamically injecting the system date and time before processing each request, l3mcore equips all its experts with runtime temporal awareness.

---

## How it works

The plugin implements the `override_route` hook, which runs milliseconds before the normal semantic routing logic.

```
Request arrives at l3mcore
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Injects a system message at position [0]:
        │   "System Context: The current local date and time is..."
        |
        v
Semantic router (E5) classifies the prompt normally
        |
        v
The selected expert receives the full history including the temporal context
```

The plugin securely modifies the messages array in memory and always returns `None` to allow the normal semantic routing to proceed uninterrupted.

---

## Requirements and Configuration

### 1. Enable the plugins directory

Ensure you have the `plugins/` folder enabled in the root of your l3mcore project.

### 2. Copy the plugin file

Copy the `system_time.py` file from the official plugins repository into the `plugins/` folder of your installation:

* **Direct download:** [system_time.py](https://github.com/lemoelink/plugins/blob/main/system_time.py)

### 3. Customize the format (Optional)

By default, the plugin uses the `"Day, Month Day, Year, HH:MM:SS"` format (for example: `Tuesday, June 02, 2026, 16:22:32`).

You can customize this format using Python's standard time formatting tokens (`strftime`) in your `config/config.json` file. Add a `"system_time"` object with the `"format"` parameter:

```json
{
  "router": { ... },
  "system_time": {
    "format": "%Y-%m-%d %H:%M:%S"
  }
}
```

*In this example, the time will be injected as: `2026-06-02 16:22:32`.*

---

## Verifying it works

When starting the l3mcore server, the system log should confirm that the plugin loaded successfully:

```
INFO - Loaded plugin: system_time
```

When a query enters, the plugin silently injects the message and logs the action:

```
INFO - system_time: Inyectada fecha y hora actual del sistema (Tuesday, June 02, 2026, 16:22:32) en la peticion.
```

---

## Behavior with different inputs

| Input | Result |
|---|---|
| Normal messages list | Injects the temporal message at index `0` of the list and returns `None`. |
| Empty or missing history | Bypasses silently and returns `None`. |
| Malformed `messages` parameter (not a list) | The plugin catches the error gracefully, logs a warning, and continues. |
