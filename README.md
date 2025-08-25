# Minerva - Personal Book Library Management System

A modern full-stack book library management application built with Django and Next.js, featuring a clean Shadcn/UI interface, Docker containerization, and planned AI-powered recommendations.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.11+** and **pip**
- **Docker** (for containerized development)
- **PostgreSQL** (for production database)

### Development Setup

#### Option 1: Docker Development (Recommended) ✅ READY

```bash
# Clone repository
git clone https://github.com/kcwoodfield/minerva.git
cd minerva

# Start entire stack with Docker
npm run docker:dev

# View logs (in separate terminal)
docker logs minerva-frontend -f
docker logs minerva-backend -f
```

**All services available:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/library  
- PostgreSQL: localhost:5432
- Redis: localhost:6379

#### Option 2: Local Development

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

#### Option 3: Individual Services

```bash
# Frontend only
cd frontend && npm run dev

# Backend only  
cd backend && python manage.py runserver
```

## 🏗️ Project Structure

```
minerva/
├── backend/                 # Django API with Django Ninja
│   ├── libraries/          # Book management app
│   ├── minervahome/        # Django project settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js React application
│   ├── app/               # Next.js 14 app directory
│   ├── components/        # React components
│   └── package.json       # Node.js dependencies
├── docs/                   # Comprehensive documentation
│   ├── deployment/        # Deployment guides (AWS, Azure, Digital Ocean)
│   ├── features/          # Feature specifications
│   ├── architecture/      # System design docs
│   └── project-plan.md    # Development roadmap
└── README.md              # This file
```

## 🎯 Current Features

### ✅ Implemented

- **Modern Data Table**: Built with Shadcn/UI and TanStack React Table
- **Real-time Search**: Instant filtering across book titles and authors
- **Book Management**: View, sort, and search through library collection
- **Google Books Integration**: Automatic metadata enrichment
- **Theme Switching**: Seamless dark/light mode with next-themes
- **Docker Development**: Full containerization with hot reload
- **Clean Architecture**: Streamlined codebase with modern patterns

### 🚧 Ready to Implement

- **Testing Infrastructure**: Jest + React Testing Library setup
- **AI Integration**: LangChain/LangGraph agents for intelligent recommendations
- **Enhanced Features**: Advanced filtering, bulk operations, drag-and-drop

### 📋 Planned

- **Mobile Optimization**: Enhanced responsive design and PWA features
- **Advanced Analytics**: Reading statistics and insights dashboard
- **Social Features**: Book sharing and recommendations
- **API Marketplace**: Third-party integrations

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 4.2.21 with Django Ninja
- **Database**: PostgreSQL with UUID primary keys  
- **Caching**: Redis for session storage and caching
- **API**: Clean RESTful API with automatic documentation
- **External APIs**: Google Books API integration
- **Architecture**: Streamlined, authentication-ready design

### Frontend

- **Framework**: Next.js 14.1.0 with App Router
- **UI Library**: React 18 with TypeScript
- **Components**: Shadcn/UI with Radix UI primitives
- **Data Tables**: TanStack React Table for advanced functionality
- **Styling**: Tailwind CSS with utility-first approach
- **Icons**: Lucide React icon library
- **Theming**: next-themes for seamless dark/light mode
- **State Management**: React hooks and URL-based state

### Infrastructure

- **Containerization**: Docker with multi-stage builds ✅ OPERATIONAL
- **Development**: Docker Compose with hot reload and health checks
- **Database**: PostgreSQL container with persistent volumes
- **Caching**: Redis container for session management
- **Deployment**: Ready for AWS, Azure, and Digital Ocean

## 📚 Documentation

### Getting Started

- **[Development Setup](docs/development/setup.md)** - Local development environment
- **[Project Plan](docs/project-plan.md)** - Development roadmap and priorities
- **[Architecture Overview](docs/architecture/overview.md)** - System design and components

### Deployment

- **[Deployment Overview](docs/deployment/README.md)** - All deployment options
- **[Hosting Platforms](docs/deployment/hosting-platforms.md)** - Platform comparison
- **[CI/CD Pipeline](docs/deployment/ci-cd-pipeline.md)** - Automated deployment

### Features

- **[Docker Containerization](docs/features/docker-containerization.md)** - Container strategy
- **[AI Integration](docs/features/langchain-langgraph-integration.md)** - AI features specification

## 🔧 Development Commands

### NPM Scripts

```bash
npm run docker:dev       # Start entire stack with Docker (RECOMMENDED)
npm run dev              # Start both frontend and backend locally
npm run install:all      # Install all dependencies
npm run build            # Build frontend for production
npm run lint             # Lint code
npm run test             # Run all tests (when implemented)
```

### Docker Commands

```bash
# Development workflow
npm run docker:dev       # Start all services with hot reload
docker ps                # View running containers
docker logs minerva-backend -f    # Follow backend logs
docker logs minerva-frontend -f   # Follow frontend logs
docker restart minerva-backend    # Restart backend container
```

### Backend Commands

```bash
cd backend
python manage.py runserver    # Start Django dev server
python manage.py migrate      # Run database migrations
python manage.py createsuperuser  # Create admin user
python manage.py collectstatic    # Collect static files
```

### Frontend Commands

```bash
cd frontend
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Lint code
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **Backend**: Follow Django best practices and PEP 8
- **Frontend**: Use TypeScript, follow React best practices
- **Testing**: Write tests for new features
- **Documentation**: Update docs when adding new features

### Current Priorities

1. **Testing Infrastructure** - Jest + React Testing Library setup
2. **AI Integration** - LangChain/LangGraph agents for intelligent features  
3. **Enhanced Features** - Advanced filtering, bulk operations, mobile optimization
4. **CI/CD Pipeline** - Automated testing and deployment

## 📊 Project Status

### Phase 1: Docker Containerization ✅ COMPLETED

- [x] **COMPLETED**: Docker containerization across all services
- [x] **COMPLETED**: Unified development workflow with `npm run docker:dev`
- [x] **COMPLETED**: Health checks and hot reload functionality
- [x] **COMPLETED**: PostgreSQL and Redis containers operational

### Phase 1B: UI Migration & Cleanup ✅ COMPLETED  

- [x] **COMPLETED**: Migration from Chakra UI to Shadcn/UI
- [x] **COMPLETED**: Modern data table with TanStack React Table
- [x] **COMPLETED**: Comprehensive codebase cleanup (329+ lines removed)
- [x] **COMPLETED**: Streamlined architecture with reduced technical debt

### Phase 2: Testing & AI Foundation - 🟡 NEXT

- [x] **READY**: Complete AI integration specification documented
- [ ] **TODO**: Set up Jest and React Testing Library for frontend
- [ ] **TODO**: Implement Django testing framework for backend
- [ ] **TODO**: Install LangChain/LangGraph dependencies
- [ ] **TODO**: Create AI services Django app structure

## 🆘 Getting Help

### Common Issues

- **Database Connection**: Ensure PostgreSQL is running and configured
- **Port Conflicts**: Check if ports 3000 (frontend) or 8000 (backend) are in use
- **Dependencies**: Run `npm run install:all` to install all dependencies

### Resources

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive development guide
- **[Issues](https://github.com/kcwoodfield/minerva/issues)** - Report bugs or request features
- **[Discussions](https://github.com/kcwoodfield/minerva/discussions)** - Ask questions and share ideas

## 🙏 Acknowledgments

- **Django** - Web framework for Python
- **Next.js** - React framework for production
- **Shadcn/UI** - Modern component library with Radix UI
- **TanStack React Table** - Advanced data table functionality
- **Google Books API** - Book metadata and covers
- **LangChain/LangGraph** - AI agent framework (planned)

---

**Development setup?** 🚀

Start with [Development Setup](docs/development/setup.md) or jump straight to [Deployment](docs/deployment/README.md) if you're ready to go live!
