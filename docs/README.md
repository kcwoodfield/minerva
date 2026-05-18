# Minerva documentation

Documentation for the **ASP.NET Core + React (Vite)** stack. For a quick local run, start with the [root README](../README.md).

## Getting started

| Doc | Description |
|-----|-------------|
| [Development setup](development/setup.md) | Prerequisites, database, API, client |
| [Configuration](development/configuration.md) | Ports, secrets, environment variables |

## Architecture

| Doc | Description |
|-----|-------------|
| [System overview](architecture/overview.md) | Components, data flow, API surface |
| [Data model](architecture/data-model.md) | `Book` entity and client types |

## Features

| Doc | Description |
|-----|-------------|
| [Library UI](features/library-ui.md) | List/grid, modals, state, theming |
| [ISBN lookup](features/isbn-lookup.md) | Google Books + Open Library, merge & sanitization |

## Decisions & planning

| Doc | Description |
|-----|-------------|
| [Architecture decisions](decisions/README.md) | ADR index |
| [Roadmap](roadmap.md) | Planned work (auth, AI, deployment) |

## Legacy note

The `main` branch and older commits contain docs for the **Django + Next.js** stack (Chakra UI, `/api/library/`, Celery, etc.). Those files were removed from the dotnet rebuild branch and are **not** maintained here.
