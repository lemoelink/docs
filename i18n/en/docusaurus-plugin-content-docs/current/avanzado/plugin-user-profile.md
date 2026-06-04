---
id: plugin-user-profile
title: User Profile Plugin
sidebar_position: 5
description: How to use the user_profile plugin to dynamically customize the responses of all experts in l3mcore with your data and instructions.
---

# User Profile Plugin

The `user_profile` plugin automatically injects a block of user information (name, general conversational preferences, and custom instructions) as a system message at the beginning of the conversation. This allows any l3mcore expert to adapt their tone, format, and style to align with your personal preferences.

## The problem it solves

In a multi-expert system, configuring custom instructions individually for each of the 15+ experts can be repetitive and error-prone. 

The `user_profile` plugin solves this by centralizing your identity and user preferences in a single place. Any expert assigned by the router will automatically receive your user profile at the start of the context, achieving unified customization across the entire system.

---

## How it works

The plugin implements the `override_route` hook, which runs milliseconds before the normal semantic routing logic.

```
Request arrives at l3mcore
        |
        v
Plugin hook: override_route(messages)
        |
        ├── Reads configuration in config.json (user_profile)
        ├── Builds formatted block:
        │   "System Context (User Profile):
        │    - User Name: ...
        │    - User Preferences: ...
        │    - Custom Instructions: ..."
        ├── Injects a system message at position [0]
        |
        v
Semantic router (E5) classifies the prompt normally
        |
        v
The selected expert receives the user profile instructions and adapts its response
```

The plugin securely modifies the messages array in memory and always returns `None` to allow the normal semantic routing to proceed uninterrupted.

---

## Requirements and Configuration

### 1. Enable the plugins directory

Ensure you have the `plugins/` folder enabled in the root of your l3mcore project.

### 2. Copy the plugin file

Copy the `user_profile.py` file from the official plugins repository into the `plugins/` folder of your installation:

* **Direct download:** [user_profile.py](https://github.com/lemoelink/plugins/blob/main/user_profile.py)

### 3. Declare your Profile in config.json

Add a `"user_profile"` object to your `config/config.json` file with the desired fields:

```json
{
  "router": { ... },
  "user_profile": {
    "name": "Gerardo",
    "preferences": "I prefer concise, structured responses with technical explanations when necessary.",
    "custom_instructions": "Use Python for all code examples and always respond in a professional tone."
  }
}
```

#### Supported fields (all optional):

| Field | Type | Description |
|---|---|---|
| `"name"` | `string` | Your username so the model can address you directly. |
| `"preferences"` | `string` | General style preferences (e.g. short replies, bullet points, cheerful tone, etc.). |
| `"custom_instructions"` | `string` | Specific rules or mandatory constraints for coding or interaction. |

*If you do not declare the `"user_profile"` object or all fields are empty, the plugin will silently bypass without altering the request.*

---

## Verifying it works

When starting the l3mcore server, the system log should confirm that the plugin loaded successfully:

```
INFO - Loaded plugin: user_profile
```

When a query enters, the plugin silently injects your profile and logs the action (showing your name if configured):

```
INFO - user_profile: Inyectadas preferencias de usuario (Gerardo) en la peticion.
```

---

## Behavior with different inputs

| Input | Result |
|---|---|
| Request with configured profile | Injects the formatted profile at index `0` of the list and returns `None`. |
| Request without configured profile | Bypasses silently without modifying the list and returns `None`. |
| Malformed `messages` parameter (not a list) | The plugin catches the error gracefully, logs a warning, and continues. |
