# Minerva - Personal Book Library Management System

A full-stack book library management application built with Django and Next.js.

## Quick Start

### Development (Both Services)
```bash
npm run install:all    # Install all dependencies
npm run dev            # Start both frontend and backend
```

### Individual Services
```bash
# Frontend only
cd frontend && npm run dev

# Backend only (requires Python venv setup)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
rav server
```

## Project Structure

- `backend/` - Django API with Django Ninja
- `frontend/` - Next.js React application
- `docs/` - Project documentation and specifications

## Tech Stack

**Backend:** Django 4.2.21, Django Ninja, JWT Auth, Google Books API  
**Frontend:** Next.js 14, React 18, TypeScript, Chakra UI, Framer Motion

## Documentation

See `CLAUDE.md` for comprehensive development guidance.