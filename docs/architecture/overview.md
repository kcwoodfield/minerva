# System Architecture Overview

## Overview

Minerva is a full-stack personal book library management system built with a modern web architecture supporting both web and API access patterns.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │    │   (Django)      │    │   Services      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ React App   │ │    │ │ Django API  │ │    │ │ Google      │ │
│ │ Chakra UI   │ │◄──►│ │ Ninja REST  │ │◄──►│ │ Books API   │ │
│ │ TypeScript  │ │    │ │ PostgreSQL  │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Static      │ │    │ │ Background  │ │    │ │ Future:     │ │
│ │ Assets      │ │    │ │ Tasks       │ │    │ │ LangGraph   │ │
│ │ (Images)    │ │    │ │ (Celery)    │ │    │ │ AI Services │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Details

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **UI Library**: Chakra UI for consistent design system
- **State Management**: URL-based state with React hooks
- **Features**: Responsive design, dark/light themes, real-time search

### Backend (Django)
- **Framework**: Django 4.2.21 with Django Ninja for modern APIs
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT-based authentication (currently disabled in frontend)
- **API Style**: RESTful APIs with automatic OpenAPI documentation
- **Background Tasks**: Celery for async processing (planned)

### Data Layer
- **Primary Database**: PostgreSQL with UUID primary keys
- **Caching**: Redis for session storage and API response caching
- **File Storage**: Local filesystem (development), AWS S3 (production planned)

## Data Flow

### Book Creation Flow
1. User submits book information through frontend form
2. Frontend sends POST request to `/api/library/`
3. Backend validates data using Pydantic schemas
4. Backend enriches metadata via Google Books API
5. Backend saves to PostgreSQL database
6. Backend returns complete book data to frontend
7. Frontend updates UI with new book

### Search Flow
1. User types in search interface
2. Frontend debounces input and constructs query parameters
3. Frontend sends GET request to `/api/library/?search=...`
4. Backend performs database query with filters
5. Backend returns paginated results
6. Frontend updates book list display

## Security Architecture

### Authentication (Future)
- JWT tokens for API authentication
- Refresh token rotation for security
- User session management through Django

### API Security
- CORS configuration for cross-origin requests
- Input validation through Pydantic schemas
- SQL injection prevention through Django ORM

### Data Security
- Environment variable management for secrets
- Database connection security
- HTTPS enforcement in production

## Performance Characteristics

### Frontend Performance
- **Static Generation**: Next.js static optimization
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Browser caching of static assets

### Backend Performance
- **Database Optimization**: Indexed fields for common queries
- **API Response Caching**: Redis caching for expensive operations
- **Connection Pooling**: Database connection management
- **Async Processing**: Background tasks for heavy operations

## Scalability Considerations

### Current Scale
- Single-user application
- SQLite database suitable for personal use
- Simple deployment model

### Future Scale Planning
- **Multi-user Support**: User isolation and data segregation
- **Database Migration**: PostgreSQL for production workloads
- **Horizontal Scaling**: Load balancing and container orchestration
- **Caching Layer**: Redis for improved response times

## Technology Decisions

### Why Django + Django Ninja?
- **Rapid Development**: Django's batteries-included approach
- **Modern APIs**: Django Ninja provides FastAPI-like experience
- **Type Safety**: Pydantic integration for request/response validation
- **Ecosystem**: Rich ecosystem of Django packages

### Why Next.js + Chakra UI?
- **Full-Stack React**: Server-side rendering and static generation
- **Type Safety**: TypeScript integration throughout
- **Design System**: Chakra UI provides consistent, accessible components
- **Performance**: Built-in optimizations and best practices

### Why PostgreSQL?
- **Reliability**: ACID compliance and data integrity
- **Features**: Advanced querying capabilities and JSON support
- **Scalability**: Handles growth from single-user to multi-user
- **Ecosystem**: Excellent Django integration and tooling

## Future Architecture Evolution

### Planned Enhancements
1. **AI Integration**: LangGraph workflows for intelligent recommendations
2. **Real-time Features**: WebSocket support for live updates
3. **Mobile Support**: React Native or PWA implementation
4. **Microservices**: Service decomposition as complexity grows

### Migration Paths
- **Database**: SQLite → PostgreSQL migration strategy
- **Authentication**: Single-user → Multi-user conversion
- **Deployment**: Simple hosting → Container orchestration
- **Monitoring**: Basic logging → Comprehensive observability