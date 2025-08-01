# Docker Setup for Minerva Backend (Django)

## Overview
This document outlines the complete Docker containerization strategy for the Minerva Django backend, including development, testing, and production configurations.

## Docker Strategy for Multi-Repository Architecture

### Repository Structure Considerations
Since frontend and backend are separate repositories, we'll implement:
- **Individual Dockerfiles** in each repository for service isolation
- **Shared docker-compose** files for local development orchestration
- **Independent deployment** pipelines for production
- **Service discovery** through environment variables and networking

## Implementation Plan

### Phase 1: Backend Dockerfile & Base Configuration (Week 1)
**Priority: High**

#### Production Dockerfile
```dockerfile
# Use Python 3.11 slim for production
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create system user
RUN groupadd -r minerva && useradd -r -g minerva minerva

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt requirements-prod.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

# Copy application code
COPY --chown=minerva:minerva . .

# Run as non-root user
USER minerva

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "minervahome.wsgi:application"]
```

#### Development Dockerfile
```dockerfile
FROM python:3.11-slim as development

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=minervahome.settings

WORKDIR /app

# Install system dependencies including dev tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application code
COPY . .

# Create directories for volumes
RUN mkdir -p /app/media /app/static

EXPOSE 8000

# Use Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

#### Multi-stage Production Build
```dockerfile
# Build stage
FROM python:3.11-slim as builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev

# Copy and install dependencies
COPY requirements.txt requirements-prod.txt ./
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements-prod.txt

# Production stage
FROM python:3.11-slim as production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=minervahome.settings_prod

# Create system user
RUN groupadd -r minerva && useradd -r -g minerva minerva

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels and install
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements-prod.txt .
RUN pip install --no-cache-dir --no-index --find-links /wheels -r requirements-prod.txt \
    && rm -rf /wheels

# Copy application
COPY --chown=minerva:minerva . .

# Collect static files
RUN python manage.py collectstatic --noinput

USER minerva

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "minervahome.wsgi:application"]
```

### Phase 2: Docker Compose Configuration (Week 1)
**Priority: High**

#### Development Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: minerva_dev
      POSTGRES_USER: minerva
      POSTGRES_PASSWORD: minerva_dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U minerva -d minerva_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://minerva:minerva_dev_password@db:5432/minerva_dev
      - REDIS_URL=redis://redis:6379/0
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY:-dev-secret-key}
    volumes:
      - .:/app
      - static_volume:/app/static
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  celery:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: celery -A minervahome worker -l info
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://minerva:minerva_dev_password@db:5432/minerva_dev
      - REDIS_URL=redis://redis:6379/0
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    command: celery -A minervahome worker -l info
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
    volumes:
      - media_volume:/app/media
    depends_on:
      - db
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/var/www/static
      - media_volume:/var/www/media
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### Phase 3: Environment Configuration (Week 1)
**Priority: High**

#### Environment Files Structure
```bash
# .env.example
DEBUG=0
DJANGO_SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@db:5432/minerva
REDIS_URL=redis://redis:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Storage Configuration (for production)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=minerva-media
```

#### Docker Environment Variables
```bash
# .env.docker
COMPOSE_PROJECT_NAME=minerva
COMPOSE_FILE=docker-compose.yml:docker-compose.override.yml
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
```

### Phase 4: Development Workflow Integration (Week 2)
**Priority: High**

#### Makefile for Common Operations
```makefile
# Makefile
.PHONY: build dev prod test clean logs shell migrate

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up --build

dev-detached:
	docker-compose -f docker-compose.dev.yml up -d --build

# Production commands
prod:
	docker-compose -f docker-compose.prod.yml up -d --build

# Testing
test:
	docker-compose -f docker-compose.test.yml run --rm backend python manage.py test

test-coverage:
	docker-compose -f docker-compose.test.yml run --rm backend coverage run --source='.' manage.py test
	docker-compose -f docker-compose.test.yml run --rm backend coverage report

# Database operations
migrate:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

makemigrations:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py makemigrations

# Utility commands
shell:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py shell

logs:
	docker-compose -f docker-compose.dev.yml logs -f backend

clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# Build and push images
build-prod:
	docker build -t minerva-backend:latest .

push:
	docker tag minerva-backend:latest your-registry/minerva-backend:latest
	docker push your-registry/minerva-backend:latest
```

### Phase 5: Production Optimization (Week 2)
**Priority: Medium**

#### Nginx Configuration
```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    client_max_body_size 100M;

    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias /var/www/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### Health Check Endpoint
```python
# Add to api.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

@api.get("/health/")
def health_check(request):
    """Health check endpoint for Docker/Kubernetes"""
    try:
        # Check database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check cache
        cache.set('health_check', 'ok', 30)
        cache_status = cache.get('health_check')
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok',
            'cache': 'ok' if cache_status == 'ok' else 'error',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=503)
```

## Docker Best Practices Implementation

### Security Best Practices
- [ ] Use non-root user in containers
- [ ] Implement multi-stage builds to reduce image size
- [ ] Use specific image tags (not 'latest' in production)
- [ ] Scan images for vulnerabilities
- [ ] Use secrets management for sensitive data
- [ ] Implement proper network segmentation

### Performance Optimization
- [ ] Use .dockerignore to exclude unnecessary files
- [ ] Leverage Docker layer caching
- [ ] Optimize Dockerfile instruction order
- [ ] Use Alpine Linux for smaller images where appropriate
- [ ] Implement health checks for all services
- [ ] Configure resource limits and requests

### Development Experience
- [ ] Hot reloading for development
- [ ] Volume mounting for code changes
- [ ] Easy database reset and seeding
- [ ] Integrated testing environment
- [ ] Clear documentation and scripts

## File Structure
```
minerva-backend/
├── Dockerfile                    # Production Dockerfile
├── Dockerfile.dev               # Development Dockerfile
├── docker-compose.yml           # Base compose file
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.prod.yml      # Production overrides
├── docker-compose.test.yml      # Testing configuration
├── .dockerignore               # Docker ignore file
├── .env.example                # Environment template
├── Makefile                    # Common operations
├── nginx/
│   ├── nginx.conf              # Nginx configuration
│   └── ssl/                    # SSL certificates
├── scripts/
│   ├── entrypoint.sh          # Container entrypoint
│   ├── wait-for-it.sh         # Service dependency script
│   └── backup.sh              # Database backup script
└── requirements-prod.txt       # Production requirements
```

## Testing Strategy

### Test Environment Configuration
```yaml
# docker-compose.test.yml
version: '3.8'

services:
  test-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: test_minerva
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    tmpfs:
      - /var/lib/postgresql/data

  backend-test:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - DJANGO_SETTINGS_MODULE=minervahome.settings_test
      - DATABASE_URL=postgresql://test_user:test_password@test-db:5432/test_minerva
    depends_on:
      - test-db
    command: python manage.py test
```

### CI/CD Integration
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build test image
      run: docker-compose -f docker-compose.test.yml build
    
    - name: Run tests
      run: docker-compose -f docker-compose.test.yml run --rm backend-test
    
    - name: Run linting
      run: docker-compose -f docker-compose.test.yml run --rm backend-test flake8
      
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build production image
      run: docker build -t minerva-backend:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push minerva-backend:${{ github.sha }}
```

This comprehensive Docker setup provides a solid foundation for development, testing, and production deployment of the Minerva Django backend.