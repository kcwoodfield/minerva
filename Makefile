.PHONY: help install dev prod test clean build logs shell backend-shell frontend-shell db-shell redis-shell

# Default target
help:
	@echo "Minerva Docker Development Commands"
	@echo "=================================="
	@echo ""
	@echo "Development:"
	@echo "  make install    - Install dependencies and build images"
	@echo "  make dev        - Start development environment"
	@echo "  make prod       - Start production environment"
	@echo "  make test       - Run test suite"
	@echo ""
	@echo "Management:"
	@echo "  make build      - Build all Docker images"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Stop and remove all containers/volumes"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell      - Access backend shell"
	@echo "  make backend-shell - Access Django shell"
	@echo "  make frontend-shell - Access frontend shell"
	@echo "  make db-shell   - Access PostgreSQL shell"
	@echo "  make redis-shell - Access Redis shell"
	@echo ""

# Install and build
install:
	@echo "Installing dependencies and building images..."
	docker-compose build
	@echo "Installation complete!"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Test environment
test:
	@echo "Running test suite..."
	docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit

# Build images
build:
	@echo "Building all Docker images..."
	docker-compose build

# View logs
logs:
	@echo "Viewing logs from all services..."
	docker-compose logs -f

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup complete!"

# Shell access
shell:
	docker-compose exec backend bash

backend-shell:
	docker-compose exec backend python manage.py shell

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec db psql -U minerva_user -d minerva

redis-shell:
	docker-compose exec redis redis-cli

# Database operations
migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

# Quick start for new developers
quickstart: install dev
	@echo "Quick start complete! Your Minerva instance is running at:"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"
	@echo "Database: localhost:5432"
	@echo "Redis:    localhost:6379"
