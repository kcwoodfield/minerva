# Docker Development Setup

This guide covers setting up and using Docker for local Minerva development.

## Prerequisites

- **Docker Desktop** (v20.10+) or **Docker Engine** (v20.10+)
- **Docker Compose** (v2.0+)
- **Make** (optional, for using Makefile commands)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/kcwoodfield/minerva.git
cd minerva

# Copy environment file
cp env.example .env

# Edit .env with your preferences
nano .env
```

### 2. Start Development Environment

```bash
# Using npm scripts (recommended)
npm run docker:dev

# Or using Makefile
make dev

# Or using Docker Compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Available Commands

### NPM Scripts

```bash
# Development
npm run docker:dev          # Start development environment
npm run docker:prod         # Start production environment
npm run docker:test         # Run test suite

# Management
npm run docker:build        # Build all images
npm run docker:clean        # Clean up containers/volumes
npm run docker:logs         # View logs

# Shell Access
npm run docker:shell        # Backend shell
npm run docker:backend-shell # Django shell
npm run docker:frontend-shell # Frontend shell
npm run docker:db-shell     # PostgreSQL shell
npm run docker:redis-shell  # Redis shell

# Database Operations
npm run docker:migrate      # Run migrations
npm run docker:makemigrations # Create migrations
npm run docker:createsuperuser # Create admin user
npm run docker:collectstatic # Collect static files
```

### Makefile Commands

```bash
# Show all available commands
make help

# Quick start (install + dev)
make quickstart

# Development
make dev
make prod
make test

# Management
make build
make clean
make logs

# Shell access
make shell
make backend-shell
make frontend-shell
make db-shell
make redis-shell

# Database operations
make migrate
make makemigrations
make createsuperuser
make collectstatic
```

## Development Workflow

### 1. Daily Development

```bash
# Start the environment
npm run docker:dev

# In another terminal, view logs
npm run docker:logs

# Make changes to your code (hot reloading enabled)
# Frontend changes auto-reload at http://localhost:3000
# Backend changes auto-reload at http://localhost:8000
```

### 2. Database Operations

```bash
# Create new migrations
npm run docker:makemigrations

# Apply migrations
npm run docker:migrate

# Create superuser
npm run docker:createsuperuser

# Access database shell
npm run docker:db-shell
```

### 3. Testing

```bash
# Run full test suite
npm run docker:test

# Or using Makefile
make test
```

## Configuration

### Environment Variables

The `.env` file contains all necessary configuration:

```env
# Database
DATABASE_URL=postgresql://minerva_user:minerva_password@db:5432/minerva
POSTGRES_DB=minerva
POSTGRES_USER=minerva_user
POSTGRES_PASSWORD=minerva_password

# Redis
REDIS_URL=redis://redis:6379/0

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Docker Compose Files

- **`docker-compose.yml`**: Base configuration with all services
- **`docker-compose.dev.yml`**: Development overrides (hot reloading, debugging)
- **`docker-compose.prod.yml`**: Production overrides (optimized, secure)
- **`docker-compose.test.yml`**: Testing environment (isolated, fast)

## Troubleshooting

### Quick Reference

| Issue                 | Solution                               | Section                                            |
| --------------------- | -------------------------------------- | -------------------------------------------------- |
| Port conflicts        | Check with `lsof -i :PORT`             | [Port Conflicts](#1-port-conflicts)                |
| Package lock mismatch | `cd frontend && npm install`           | [Package Lock Issues](#5-package-lock-file-issues) |
| Host header errors    | Update `ALLOWED_HOSTS` in `.env`       | [Host Header Issues](#6-django-host-header-issues) |
| 404 API errors        | Check URL patterns (no trailing slash) | [URL Pattern Issues](#7-django-url-pattern-issues) |
| Database connection   | Check service status and logs          | [Database Issues](#3-database-connection-issues)   |
| Migration warnings    | Run `python manage.py migrate`         | [Migration Issues](#8-database-migration-issues)   |

### Common Issues

#### 1. Port Conflicts

```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.yml
```

#### 2. Permission Issues

```bash
# If you get permission errors
sudo chown -R $USER:$USER .

# Or run Docker commands with sudo
sudo docker-compose up
```

#### 3. Database Connection Issues

```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database service
docker-compose restart db
```

#### 4. Build Failures

```bash
# Clean and rebuild
npm run docker:clean
npm run docker:build

# Or force rebuild
docker-compose build --no-cache
```

#### 5. Package Lock File Issues

```bash
# If you get "npm ci" errors about package-lock.json mismatch
cd frontend
npm install  # Syncs package.json with package-lock.json
cd ..

# Or force clean install
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

#### 6. Django Host Header Issues

```bash
# If you see "Invalid HTTP_HOST header" errors
# Check that ALLOWED_HOSTS includes the right values in your .env file:
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,*

# Restart Docker environment after changing environment variables
npm run docker:clean
npm run docker:dev
```

#### 7. Django URL Pattern Issues

```bash
# If you get 404 errors for API endpoints
# Check the correct URL patterns (Django is strict about trailing slashes):

# ✅ Correct URLs:
http://localhost:8000/api/library      # Main endpoint
http://localhost:8000/api/docs         # API documentation
http://localhost:8000/api/openapi.json # OpenAPI schema

# ❌ Common mistakes:
http://localhost:8000/api/library/     # Trailing slash may cause issues
```

#### 8. Database Migration Issues

```bash
# If Django shows "unapplied migration(s)" warnings
docker-compose exec backend python manage.py migrate

# Check migration status
docker-compose exec backend python manage.py showmigrations

# Create new migrations if needed
docker-compose exec backend python manage.py makemigrations
```

### Debugging

#### 1. Access Container Shells

```bash
# Backend shell
npm run docker:shell

# Frontend shell
npm run docker:frontend-shell

# Database shell
npm run docker:db-shell
```

#### 2. View Logs

```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

#### 3. Check Service Status

```bash
# Service status
docker-compose ps

# Health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

## Production Deployment

### 1. Build Production Images

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Or using npm
npm run docker:prod
```

### 2. Environment Setup

```env
# Production .env
DEBUG=False
DJANGO_SETTINGS_MODULE=minervahome.settings_prod
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
SECRET_KEY=your-production-secret-key
```

### 3. Deploy

```bash
# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

## Performance Tips

### 1. Development

- Use volume mounts for hot reloading
- Disable Redis persistence in development
- Use SQLite for faster development startup

### 2. Production

- Enable Redis persistence
- Use PostgreSQL with optimized settings
- Implement proper health checks
- Use multi-stage builds for smaller images

### 3. Build Optimization

```bash
# Use build cache
docker-compose build --parallel

# Clean up unused images
docker system prune -f

# Use .dockerignore files to reduce build context
```

## Next Steps

1. **Customize Environment**: Edit `.env` file for your needs
2. **Add Services**: Extend docker-compose.yml with additional services
3. **CI/CD Integration**: Set up automated testing and deployment
4. **Monitoring**: Add Prometheus, Grafana, or other monitoring tools
5. **Security**: Implement secrets management and security scanning

## Support

- **Documentation**: Check `docs/deployment/` for deployment guides
- **Issues**: Report problems on GitHub
- **Discussions**: Ask questions in GitHub Discussions
