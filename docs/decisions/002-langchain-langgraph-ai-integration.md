# ADR 002: LangGraph / LangChain for AI features

**Status:** Proposed (not implemented)  
**Date:** 2024

## Context

Future features may include reading recommendations, semantic search, and natural-language queries over the library.

## Decision (proposed)

Use LangGraph (or LangChain) workflows in a dedicated service or API module, called from Minerva with clear boundaries — not embedded in the core CRUD path.

## Consequences

- No AI dependencies in the current dotnet stack.
- Book metadata remains deterministic (Google Books + Open Library).
- Revisit when auth and deployment baseline exist.

See [roadmap](../roadmap.md).
