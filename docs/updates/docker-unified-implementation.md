# Update: Docker Setup for Unified Minerva Repository

## Date
2025-08-01

## Context

Following the successful merger of minerva-backend and minerva-frontend into a unified repository structure, we need to update the Docker containerization strategy to support the new project layout with both services in a single repository.

## Changes Made

### Repository Structure Impact
- **Old Structure**: Separate `minerva-backend/` and `minerva-frontend/` repositories
- **New Structure**: Unified repository with `backend/` and `frontend/` directories
- **Docker Strategy**: Full-stack containerization with service orchestration

### Updated Docker Architecture

#### Service Composition
```yaml
services:
  backend:    # Django API (port 8000)
  frontend:   # Next.js app (port 3000) 
  db:         # PostgreSQL database
  redis:      # Cache and sessions
  nginx:      # Reverse proxy (production)
```

#### File Structure Updates
```
minerva/                           # Root directory (NEW)
├── Dockerfile.backend             # Backend container (UPDATED)
├── Dockerfile.frontend            # Frontend container (NEW)
├── docker-compose.yml             # Base configuration (UPDATED)
├── docker-compose.dev.yml         # Development setup (UPDATED)
├── docker-compose.prod.yml        # Production setup (UPDATED)
├── backend/                       # Django code (MOVED from minerva-backend/src)
├── frontend/                      # Next.js code (MOVED from minerva-frontend/src)
└── nginx/                         # Reverse proxy config (UPDATED)
```

## Impact

### Developer Workflow Changes
**Before (Multi-repo):**
```bash
# Terminal 1 - Backend
cd minerva-backend
docker-compose up

# Terminal 2 - Frontend  
cd minerva-frontend
npm run dev
```

**After (Unified):**
```bash
# Single command for full stack
npm run docker:dev
# or
docker-compose -f docker-compose.dev.yml up
```

### Build Process Changes
- **Single CI/CD pipeline** instead of separate pipelines
- **Coordinated deployments** for frontend/backend changes
- **Shared environment configuration** across services
- **Unified dependency management** at root level

### Development Benefits
1. **Atomic commits** across frontend/backend changes
2. **Simplified environment setup** for new developers
3. **Consistent development/production parity**
4. **Coordinated testing** of full-stack features

## Migration Steps

### 1. Update Existing Docker Configuration
- Modify paths in existing docker-compose files
- Update volume mounts to reflect new directory structure
- Adjust build contexts for unified repository

### 2. Create Frontend Dockerfile
- Multi-stage build for Next.js application
- Development and production targets
- Static file optimization

### 3. Update Root Package.json
- Add Docker-specific npm scripts
- Configure workspace for frontend dependencies
- Include concurrently for parallel service management

### 4. Environment Configuration
- Consolidate environment variables
- Update service discovery between containers
- Configure cross-origin requests for development

## Testing

### Validation Steps
1. **Development Environment**: Verify `npm run docker:dev` starts all services
2. **Service Communication**: Test API calls from frontend to backend
3. **Hot Reloading**: Confirm code changes reflect without rebuild
4. **Database Connectivity**: Validate PostgreSQL connection and migrations
5. **Production Build**: Test optimized production containers

### Regression Testing
- Ensure existing API endpoints work unchanged
- Verify frontend functionality with containerized backend
- Test database migrations in Docker environment
- Validate production deployment process

## Next Steps

### Immediate (Week 1)
1. **Implement core Docker files** following the documented architecture
2. **Update CI/CD pipeline** for unified repository structure
3. **Test development workflow** with full containerization

### Short-term (Week 2)
1. **Production optimization** with multi-stage builds
2. **Security hardening** and vulnerability scanning
3. **Performance monitoring** and health checks

### Long-term (Month 1)
1. **Kubernetes migration** planning
2. **Auto-scaling** configuration
3. **Backup and disaster recovery** strategy

## Documentation Updates

- **CLAUDE.md**: Added Docker development commands
- **README.md**: Updated setup instructions for Docker workflow
- **docs/features/docker-containerization.md**: Comprehensive implementation plan
- **docs/updates/docker-unified-implementation.md**: This migration document

## Rollback Plan

If issues arise during Docker implementation:
1. **Preserve existing npm scripts** for non-Docker development
2. **Keep backend/frontend** runnable independently
3. **Maintain SQLite option** for simple local development
4. **Document manual setup** as fallback option

This update modernizes our containerization strategy for the unified codebase while maintaining development velocity and production reliability.