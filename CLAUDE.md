# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minerva is a full-stack personal book library management system with:

- **Backend**: Django 4.2.21 with Django Ninja API framework (`backend/`)
- **Frontend**: Next.js 14.1.0 React application with Chakra UI (`frontend/`)

## Development Commands

### Full Stack Development

```bash
npm run dev                    # Start both frontend and backend concurrently
npm run install:all           # Install dependencies for both projects
```

### Frontend (Next.js)

```bash
npm run dev:frontend          # Start frontend development server
npm run build:frontend        # Build frontend for production
npm run start:frontend        # Start frontend production server
npm run lint                  # Run ESLint on frontend
cd frontend && npm run dev    # Alternative: run from frontend directory
```

### Backend (Django)

```bash
npm run dev:backend           # Start Django development server
npm run backend:migrate       # Apply database migrations
npm run backend:makemigrations # Create database migrations
npm run backend:shell         # Open Django shell

# Alternative: run from backend directory
cd backend && rav server      # Start server using rav
cd backend && python manage.py runserver 8000  # Direct Django command
```

### Setup Commands

```bash
# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install

# Root level setup
npm install  # Install concurrently for running both services
```

## Architecture Overview

### Backend Architecture

- **Framework**: Django with Django Ninja for modern API development
- **Database**: SQLite (development) with UUID primary keys for multi-user readiness
- **Authentication**: JWT-based with Django Ninja JWT (currently disabled in frontend)
- **External APIs**: Google Books API integration for automatic metadata enrichment
- **Planned**: LangGraph integration for AI-powered book recommendations

### Frontend Architecture

- **Framework**: Next.js 14 with App Router and TypeScript
- **UI Library**: Chakra UI as primary design system
- **State Management**: URL-based state with React hooks
- **Theming**: next-themes for dark/light mode support
- **Animations**: Framer Motion

### Key Data Model

The core `LibraryEntry` model (`backend/libraries/models.py`) includes:

- UUID primary keys for multi-user readiness
- Comprehensive book metadata (title, author, ISBN-13/10, publisher, genre, etc.)
- Progress tracking with percentage-based completion (completed field)
- Automatic metadata enrichment via Google Books API on save
- JSON field for flexible tagging system
- Additional metadata fields: translator, edition, cover_image_url, summary
- Automatic timestamp tracking (date_added, timestamp)

## API Endpoints

### Current Endpoints

```
GET    /api/library/          # List books (paginated, searchable, sortable)
POST   /api/library/          # Create book with auto-metadata enrichment
PUT    /api/library/{id}      # Update existing book
DELETE /api/library/{id}      # Delete book
POST   /api/token/pair        # JWT authentication
POST   /api/token/refresh     # Refresh access token
```

### Frontend API Integration

Frontend connects to backend at `http://localhost:8000` (development) or `https://minerva-api.kevinwoodfield.com` (production).

## Key File Locations

### Backend Key Files

- **Models**: `backend/libraries/models.py`
- **API**: `backend/libraries/api.py`
- **Utils**: `backend/libraries/utils.py` (Google Books integration)
- **Schemas**: `backend/libraries/schemas.py` (Pydantic validation)
- **Settings**: `backend/minervahome/settings.py`
- **URLs**: `backend/minervahome/urls.py`
- **Requirements**: `backend/requirements.txt`
- **Scripts**: `backend/rav.yaml`

### Frontend Key Files

- **App Structure**: `frontend/app/` (Next.js App Router)
- **Components**: `frontend/components/` (BookTable, SearchWrapper, AddBookDrawer, etc.)
- **Types**: `frontend/types/book.ts`
- **Config**: `frontend/next.config.mjs`, `frontend/tsconfig.json`
- **Dependencies**: `frontend/package.json`
- **Public Assets**: `frontend/public/`

### Documentation

- **Project Docs**: `docs/` with structured directories:
  - `architecture/` - System architecture and overview
  - `decisions/` - Architectural decision records (ADRs)
  - `deployment/` - AWS, Azure, CI/CD, hosting platforms
  - `development/` - Setup and development guides
  - `features/` - Feature documentation and specifications
  - `updates/` - Development updates and progress logs
  - `user-guides/` - End-user documentation
- **Main README**: `docs/README.md`
- **Project Plan**: `docs/project-plan.md`

## Development Guidelines

### Backend Development

- Use Django Ninja for all new API endpoints
- Implement Pydantic schemas for request/response validation
- Follow Django best practices and PEP 8
- Use UUID primary keys for new models
- Test coverage should exceed 90%

### Frontend Development

- Use TypeScript for all new components
- Follow Chakra UI design system and responsive breakpoints
- Implement URL-based state management for shareable states
- Use React functional components with hooks
- Follow mobile-first responsive design approach

### Database Changes

1. Modify model in `backend/libraries/models.py`
2. Run `npm run backend:makemigrations` or `cd backend && rav makemigrations`
3. Review generated migration file
4. Run `npm run backend:migrate` or `cd backend && rav migrate`
5. Update corresponding schemas and API endpoints

## Testing

### Backend Testing

```bash
cd backend
python manage.py test                    # Run all tests
python manage.py test libraries.tests   # Run specific test file
```

### Frontend Testing

No test framework currently configured. Recommended: Jest with React Testing Library.

## Project Structure

```
minerva/
├── package.json              # Root workspace management with concurrently
├── CLAUDE.md                 # This file - unified development guide
├── .gitignore               # Unified git ignore rules
├── backend/                  # Django backend
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Python dependencies
│   ├── rav.yaml            # Development scripts
│   ├── libraries/          # Main app for book management
│   │   ├── models.py       # LibraryEntry model
│   │   ├── api.py          # Django Ninja API endpoints
│   │   ├── utils.py        # Google Books API integration
│   │   └── schemas.py      # Pydantic validation schemas
│   └── minervahome/        # Django project settings
├── frontend/                # Next.js frontend
│   ├── package.json        # Frontend dependencies
│   ├── next.config.mjs     # Next.js configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── types/              # TypeScript type definitions
│   └── public/             # Static assets
└── docs/                   # Project documentation and specs
```

## Current Status

### Authentication

- JWT authentication implemented but **disabled** in frontend
- System designed for easy multi-user conversion
- Login page exists but not enforced

### Deployment

- **Production Frontend**: https://minerva.kevinwoodfield.com/
- **Production API**: https://minerva-api.kevinwoodfield.com/api/library
- CORS configured for cross-origin requests

### Planned Features

- AI Integration with LangGraph workflows for intelligent recommendations
- Multi-user support with data isolation
- Enhanced search with semantic capabilities
- Reading analytics and progress insights

## Important Notes

- This project was recently unified from two separate repositories
- The system is single-user but architected for multi-user conversion
- Google Books API integration provides automatic metadata enrichment
- Both backend and frontend have comprehensive documentation in `docs/`
- Use `npm run dev` to start both services concurrently for full-stack development

## Development Best Practices

### Code Quality
- Always use descriptive variable names
- Write self-documenting code with clear function and class names
- Keep functions small and focused on a single responsibility
- Use meaningful commit messages following conventional commits format
- Add docstrings for complex functions and classes

### Security
- Never commit API keys, secrets, or credentials to version control
- Use environment variables for sensitive configuration
- Sanitize user inputs and validate data at API boundaries
- Follow OWASP security guidelines for web applications

### Error Handling
- Implement comprehensive error handling with meaningful error messages
- Use try-catch blocks appropriately and avoid silent failures
- Log errors with appropriate detail for debugging
- Return consistent error response formats from APIs

### Performance
- Optimize database queries to avoid N+1 problems
- Use pagination for large data sets
- Implement appropriate caching strategies
- Optimize images and static assets

### Testing
- Write tests before fixing bugs (test-driven bug fixes)
- Maintain high test coverage (>90% target)
- Use meaningful test names that describe the behavior being tested
- Test edge cases and error conditions

### Code Organization
- Follow consistent file and folder naming conventions
- Group related functionality together
- Keep components and modules loosely coupled
- Use dependency injection where appropriate
