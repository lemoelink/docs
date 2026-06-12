---
id: tool-calendar-smart
title: Tool Calendar Smart
sidebar_position: 10
description: Connects l3mcore with your Google Calendar to manage meetings and agenda intentions.
---

# Tool Calendar Smart

The `calendar_smart` tool connects l3mcore with the Google Calendar API to automatically list and schedule events using Tool Calling.

## Creating an application in Google Cloud Console

To use this tool, you must configure an application in the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Calendar API** from the APIs & Services section.
4. Go to the **OAuth consent screen** tab, select external user type, and configure your email. Add the `.../auth/calendar` scope if necessary.
5. Go to **Credentials**, click on *Create credentials* and select *OAuth client ID* (Type: Desktop app).
6. Download the credentials JSON file and save it as `config/google_credentials.json`.
7. When running the first calendar request, l3mcore will open the web browser to perform the initial one-time local authentication and generate the persistent token file at `config/google_token.json`.

---

## Dependencies

Install the official Google packages:

```bash
pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
```

---

## Configuration

Configure the files and durations in `config/config.json`:

```json
{
  "calendar_smart": {
    "enabled": true,
    "credentials_file": "config/google_credentials.json",
    "token_file": "config/google_token.json",
    "calendar_id": "primary",
    "max_events": 10,
    "default_duration_minutes": 60
  }
}
```

---

## Available Tools

The tool exposes the following functions to the LLM:

1. `list_calendar_events(days_ahead)`: Lists the upcoming events in the agenda.
2. `create_calendar_event(summary, start_time, duration_minutes)`: Schedules a new event with the specified date, time, and duration.
