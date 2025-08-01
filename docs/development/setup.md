# Development Environment Setup

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.11 or higher
- **Git**: For version control
- **Docker**: For containerized development (optional but recommended)

### Development Tools (Recommended)
- **Visual Studio Code** with extensions:
  - Python
  - TypeScript and JavaScript
  - Django
  - Docker
- **Database GUI**: pgAdmin, DBeaver, or similar
- **API Testing**: Postman, Insomnia, or Thunder Client

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/kcwoodfield/minerva.git
cd minerva
```

### 2. Install Dependencies
```bash
# Install root dependencies (concurrently for parallel dev servers)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - Database connection (if using PostgreSQL)
# - Google Books API key (if needed)
# - Other service API keys
```

### 4. Database Setup
```bash
# For SQLite (default - simplest for development)
cd backend
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin user

# Load test data (optional)
python manage.py shell < add_test_data.py
cd ..
```

### 5. Start Development Servers
```bash
# Option 1: Start both services with one command
npm run dev

# Option 2: Start services separately
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## Detailed Setup

### Backend Setup (Django)

#### Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Dependencies
```bash
pip install -r requirements.txt
```

#### Database Configuration

**SQLite (Default - Simplest)**
No additional setup required. Database file created automatically.

**PostgreSQL (Production-like)**
1. Install PostgreSQL locally or use Docker:
   ```bash
   docker run --name minerva-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=minerva -p 5432:5432 -d postgres:15
   ```

2. Update backend settings or environment variables:
   ```python
   # In settings.py or via environment
   DATABASE_URL=postgresql://postgres:password@localhost:5432/minerva
   ```

#### Django Setup
```bash
# Apply database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load test data (optional)
python manage.py shell < add_test_data.py

# Test the setup
python manage.py runserver
# Visit http://localhost:8000/api/library/ to see API
```

### Frontend Setup (Next.js)

#### Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
```bash
# Create .env.local for frontend-specific variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

#### Development Server
```bash
npm run dev
# Visit http://localhost:3000 to see the application
```

## Docker Development (Alternative)

### Prerequisites
- Docker Desktop
- Docker Compose V2

### Quick Docker Start
```bash
# Start all services with Docker
npm run docker:dev

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Docker Development Benefits
- **Consistent Environment**: Same setup across all developer machines
- **Service Integration**: Database, cache, and application services
- **Production Parity**: Environment closer to production deployment

## Development Workflow

### Daily Development
1. **Pull latest changes**: `git pull origin main`
2. **Install new dependencies**: `npm run install:all`
3. **Apply migrations**: `npm run backend:migrate`
4. **Start development**: `npm run dev`

### Making Changes

#### Backend Changes
1. **Models**: Update `backend/libraries/models.py`
2. **Create migration**: `npm run backend:makemigrations`
3. **Apply migration**: `npm run backend:migrate`
4. **Update API**: Modify `backend/libraries/api.py`
5. **Update schemas**: Modify `backend/libraries/schemas.py`

#### Frontend Changes
1. **Components**: Add/modify files in `frontend/components/`
2. **Pages**: Update `frontend/app/` directory
3. **Types**: Update `frontend/types/book.ts`
4. **Styling**: Use Chakra UI components and design system

### Testing Changes
```bash
# Backend tests
cd backend && python manage.py test

# Frontend linting
npm run lint

# Full application test
npm run dev  # Start both services and test manually
```

## Common Issues

### Port Conflicts
- **Backend (8000)**: Kill existing Django processes
- **Frontend (3000)**: Kill existing Next.js processes
- **Database (5432)**: Stop PostgreSQL service or Docker containers

### Database Issues
- **Migration conflicts**: `python manage.py migrate --fake-initial`
- **Reset database**: Delete `backend/db.sqlite3` and re-migrate
- **Connection errors**: Check DATABASE_URL in environment

### Dependency Issues
- **Python packages**: Recreate virtual environment
- **Node packages**: Delete `node_modules` and reinstall
- **Version conflicts**: Check Node.js and Python versions

## IDE Configuration

### VS Code Setup
1. **Install recommended extensions**
2. **Configure Python interpreter**: Point to `backend/venv/bin/python`
3. **Configure TypeScript**: Should auto-detect `frontend/tsconfig.json`
4. **Set up debugging**: Use provided launch configurations

### PyCharm Setup
1. **Open backend directory** as Django project
2. **Configure interpreter**: Use virtual environment
3. **Set Django settings**: Point to `minervahome.settings`
4. **Configure run configurations**: Django server and tests

## Next Steps

After successful setup:
1. **Read the CLAUDE.md** for comprehensive development guidance
2. **Explore the codebase** starting with `backend/libraries/` and `frontend/components/`
3. **Run tests** to ensure everything works
4. **Make a small change** to verify the development workflow
5. **Check documentation** in `docs/` for specific features you want to work on

For advanced setup including Docker, production deployment, and CI/CD, see the other guides in this directory.