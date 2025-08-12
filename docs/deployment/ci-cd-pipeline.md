# CI/CD Pipeline Guide

## Overview

This guide covers setting up a comprehensive CI/CD pipeline for Minerva using GitHub Actions, automated testing, and deployment workflows. This guide provides general CI/CD principles that can be adapted for different hosting platforms.

## 🎯 CI/CD Goals

### Primary Objectives

- **Automated Testing**: All code changes must pass tests before deployment
- **Continuous Integration**: Frequent code integration with automated builds
- **Continuous Deployment**: Automated deployment to staging and production
- **Quality Gates**: Multiple validation checkpoints before production release
- **Rollback Capability**: Quick recovery from failed deployments

### Success Metrics

- **Deployment Frequency**: Multiple deployments per day
- **Lead Time**: < 1 hour from commit to production
- **Change Failure Rate**: < 5% of deployments cause issues
- **Mean Time to Recovery**: < 30 minutes for failed deployments

## 🏗️ Pipeline Architecture

### Workflow Stages

```
Code Commit → Tests → Build → Staging → Production
     ↓           ↓      ↓       ↓         ↓
   Linting   Unit    Docker   Deploy   Deploy
   Security  Tests    Build    Test     Live
   Coverage  E2E      Image    Verify   Monitor
```

### Environment Strategy

- **Development**: Local development with hot reloading
- **Staging**: Production-like environment for testing
- **Production**: Live application with monitoring

## 🚀 GitHub Actions Setup

### 1. Repository Configuration

#### Secrets Setup

Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_PASSWORD=secure_password

# Docker
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password

# Deployment
PRODUCTION_HOST=your-server-ip
PRODUCTION_USER=deploy_user
PRODUCTION_SSH_KEY=your_private_ssh_key

# AI Integration (if implementing)
ANTHROPIC_API_KEY=your_anthropic_key
LANGCHAIN_API_KEY=your_langsmith_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

#### Environment Protection Rules

- **Staging**: Require pull request reviews
- **Production**: Require pull request reviews + status checks

### 2. Core Workflow Files

#### Main CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.11]
        node-version: [18]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install Python dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Install Node.js dependencies
        run: |
          cd frontend
          npm ci

      - name: Run backend tests
        run: |
          cd backend
          python manage.py test --verbosity=2

      - name: Run frontend tests
        run: |
          cd frontend
          npm run test:ci

      - name: Run linting
        run: |
          cd backend
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          black --check .
          isort --check-only .

          cd ../frontend
          npm run lint

      - name: Check security vulnerabilities
        run: |
          cd backend
          safety check

          cd ../frontend
          npm audit --audit-level=moderate

      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/.coverage
          flags: backend
          name: backend-coverage

      - name: Upload frontend coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage
```

#### Build and Deploy Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      backend-image: ${{ steps.meta.outputs.backend-image }}
      frontend-image: ${{ steps.meta.outputs.frontend-image }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ${{ secrets.DOCKER_USERNAME }}/minerva-backend
            ${{ secrets.DOCKER_USERNAME }}/minerva-frontend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.backend-image }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.frontend-image }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/develop'

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # Add staging deployment logic here

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Add production deployment logic here
```

## 🧪 Testing Strategy

### 1. Testing Pyramid

#### Unit Tests (70% of tests)

**Backend (Django):**

```python
# tests/test_models.py
from django.test import TestCase
from libraries.models import LibraryEntry

class LibraryEntryModelTest(TestCase):
    def setUp(self):
        self.book = LibraryEntry.objects.create(
            title="Test Book",
            author="Test Author",
            isbn="1234567890123"
        )

    def test_book_creation(self):
        self.assertEqual(self.book.title, "Test Book")
        self.assertEqual(self.book.author, "Test Author")

    def test_string_representation(self):
        self.assertEqual(str(self.book), "Test Book by Test Author")
```

**Frontend (React):**

```typescript
// __tests__/BookTable.test.tsx
import { render, screen } from '@testing-library/react';
import BookTable from '../components/BookTable';

describe('BookTable', () => {
  it('renders book table with data', () => {
    const mockBooks = [{ id: '1', title: 'Test Book', author: 'Test Author' }];

    render(<BookTable books={mockBooks} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
});
```

#### Integration Tests (20% of tests)

**API Endpoints:**

```python
# tests/test_api.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from libraries.models import LibraryEntry

class LibraryAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.book = LibraryEntry.objects.create(
            title="API Test Book",
            author="API Test Author"
        )

    def test_get_books_list(self):
        response = self.client.get(reverse('api:library-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_create_book(self):
        data = {
            'title': 'New Book',
            'author': 'New Author'
        }
        response = self.client.post(reverse('api:library-list'), data)
        self.assertEqual(response.status_code, 201)
```

#### End-to-End Tests (10% of tests)

**Cypress E2E Tests:**

```typescript
// cypress/e2e/book-management.cy.ts
describe('Book Management', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should add a new book', () => {
    cy.get('[data-testid="add-book-button"]').click();
    cy.get('[data-testid="book-title-input"]').type('Cypress Test Book');
    cy.get('[data-testid="book-author-input"]').type('Cypress Test Author');
    cy.get('[data-testid="save-book-button"]').click();

    cy.get('[data-testid="book-table"]').should('contain', 'Cypress Test Book');
  });

  it('should search for books', () => {
    cy.get('[data-testid="search-input"]').type('Test Book');
    cy.get('[data-testid="book-table"]').should('contain', 'Test Book');
  });
});
```

### 2. Test Configuration

#### Backend Testing (`backend/pytest.ini`)

```ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = minervahome.settings_test
python_files = tests.py test_*.py *_tests.py
addopts =
    --strict-markers
    --strict-config
    --cov=libraries
    --cov=minervahome
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

#### Frontend Testing (`frontend/jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## 🔄 Deployment Workflows

### 1. Staging Deployment

#### Staging Environment Setup

```yaml
# .github/workflows/staging-deploy.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/minerva-staging
            git pull origin develop
            docker-compose -f docker-compose.staging.yml down
            docker-compose -f docker-compose.staging.yml up -d --build
            docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate
            docker-compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput
```

#### Staging Docker Compose (`docker-compose.staging.yml`)

```yaml
version: '3.8'

services:
  backend:
    image: ${{ secrets.DOCKER_USERNAME }}/minerva-backend:develop
    environment:
      - DJANGO_SETTINGS_MODULE=minervahome.settings_staging
      - DATABASE_URL=postgresql://staging_user:pass@db:5432/minerva_staging
    volumes:
      - ./logs:/app/logs

  frontend:
    image: ${{ secrets.DOCKER_USERNAME }}/minerva-frontend:develop
    environment:
      - NEXT_PUBLIC_API_URL=http://staging.yourdomain.com/api

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=minerva_staging
      - POSTGRES_USER=staging_user
      - POSTGRES_PASSWORD=staging_password
    volumes:
      - staging_data:/var/lib/postgresql/data

volumes:
  staging_data:
```

### 2. Production Deployment

#### Production Deployment Workflow

```yaml
# .github/workflows/production-deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/minerva
            git pull origin main

            # Backup database before deployment
            docker-compose -f docker-compose.prod.yml exec db pg_dump -U minerva_user minerva > backup_$(date +%Y%m%d_%H%M%S).sql

            # Deploy new version
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d --build

            # Run migrations
            docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

            # Collect static files
            docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

            # Health check
            sleep 30
            curl -f http://localhost/health/ || exit 1

            # Cleanup old images
            docker image prune -f
```

## 🚨 Rollback Procedures

### 1. Automated Rollback Triggers

```yaml
# Add to production deployment workflow
- name: Health check and rollback if needed
  run: |
    # Wait for deployment to stabilize
    sleep 60

    # Check health endpoint
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health/)

    if [ "$HEALTH_CHECK" != "200" ]; then
      echo "Health check failed, triggering rollback..."
      # Trigger rollback workflow
      gh workflow run rollback.yml --ref main
      exit 1
    fi
```

### 2. Rollback Workflow

```yaml
# .github/workflows/rollback.yml
name: Rollback Production

on:
  workflow_dispatch:
  workflow_run:
    workflows: ['Deploy to Production']
    types: [failed]

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Rollback to previous version
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /var/www/minerva

            # Get previous commit
            PREVIOUS_COMMIT=$(git log --oneline -2 | tail -1 | awk '{print $1}')

            # Checkout previous version
            git checkout $PREVIOUS_COMMIT

            # Restart with previous version
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d

            # Verify rollback
            sleep 30
            curl -f http://localhost/health/ || echo "Rollback health check failed"
```

## 📊 Monitoring & Alerting

### 1. Deployment Monitoring

```yaml
# Add to deployment workflows
- name: Notify deployment status
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    text: |
      Minerva deployment to ${{ github.ref_name }} ${{ job.status }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}
  if: always()
```

### 2. Performance Monitoring

```yaml
# Add performance testing to CI
- name: Performance testing
  run: |
    cd frontend
    npm run build
    npm run lighthouse -- --output=json --output-path=./lighthouse-report.json

- name: Upload performance report
  uses: actions/upload-artifact@v3
  with:
    name: lighthouse-report
    path: frontend/lighthouse-report.json
```

## 🔧 Pipeline Optimization

### 1. Caching Strategies

```yaml
# Add to CI workflow
- name: Cache Python dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: frontend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('frontend/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. Parallel Testing

```yaml
# Split tests into parallel jobs
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      # Backend testing steps

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      # Frontend testing steps

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      # E2E testing steps
```

## 🎯 Platform-Specific Deployment

### Digital Ocean Deployment

For Digital Ocean deployment, use the SSH-based deployment workflows shown above. The deployment process involves:

1. Building Docker images
2. Pushing to Docker Hub
3. SSH into Digital Ocean droplet
4. Pull latest code and restart services

### AWS Deployment

For AWS deployment using ECS Fargate and managed services:

- **[AWS Deployment Guide](aws/README.md)** - Complete AWS deployment strategy
- Use AWS CLI or Terraform for infrastructure management
- Deploy to ECS using GitHub Actions
- Monitor with CloudWatch

### Azure Deployment

For Azure deployment using AKS and Azure services:

- **[Azure Deployment Guide](azure/README.md)** - Complete Azure deployment strategy
- Use Azure CLI or Bicep/ARM templates for infrastructure
- Deploy to AKS using GitHub Actions
- Monitor with Application Insights

## 📋 CI/CD Checklist

### Pre-Pipeline Setup

- [ ] GitHub repository configured with branch protection
- [ ] Required secrets added to repository
- [ ] Environment protection rules configured
- [ ] Testing frameworks configured and working
- [ ] Docker images building successfully

### Pipeline Validation

- [ ] All tests passing consistently
- [ ] Code coverage above thresholds
- [ ] Security scans passing
- [ ] Performance benchmarks met
- [ ] Deployment to staging successful

### Production Readiness

- [ ] Staging environment validated
- [ ] Rollback procedures tested
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Team trained on deployment procedures

---

## 📚 Next Steps

After setting up the CI/CD pipeline:

1. **Configure monitoring and alerting** (see [monitoring-logging.md](monitoring-logging.md))
2. **Set up backup and recovery** (see [backup-recovery.md](backup-recovery.md))
3. **Implement performance optimization** (see [performance-optimization.md](performance-optimization.md))
4. **Configure security scanning** and vulnerability management

### Platform-Specific Next Steps

- **For Digital Ocean**: Continue with the general deployment workflows
- **For AWS**: Follow the [AWS Deployment Guide](aws/README.md) for AWS-specific CI/CD
- **For Azure**: Follow the [Azure Deployment Guide](azure/README.md) for Azure-specific CI/CD

For additional CI/CD guidance, refer to the other documents in this directory or consult the platform-specific guides.
