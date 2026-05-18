# ADR 001: Unified repository structure

**Status:** Accepted  
**Date:** 2024

## Context

Frontend and backend lived in separate repositories, complicating coordinated releases and documentation.

## Decision

Single monorepo with shared docs, Docker compose, and root-level tooling.

## Consequences

- One PR can span API and client changes.
- `docs/` and `README.md` describe the whole system.
- Stack has since changed (see [ADR 003](003-dotnet-react-rebuild.md)); layout remains `src/Minerva.Api` + `src/Minerva.Client`.
