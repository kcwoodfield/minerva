# Minerva - Personal Book Library Management System

A full-stack book library management application built with Django and Next.js, featuring AI-powered book recommendations and intelligent library curation.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.11+** and **pip**
- **Docker** (for containerized development)
- **PostgreSQL** (for production database)

### Development Setup

#### Option 1: Unified Development (Recommended)

```bash
# Clone repository
git clone https://github.com/kcwoodfield/minerva.git
cd minerva

# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

#### Option 2: Individual Services

```bash
# Frontend only
cd frontend && npm run dev

# Backend only
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

#### Option 3: Docker Development

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
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

- **Book Management**: Add, edit, delete, and view book details
- **Library Interface**: Responsive table with sorting and pagination
- **Real-time Search**: Search across books and authors
- **Google Books Integration**: Automatic metadata enrichment
- **Theme Switching**: Dark/light mode support
- **Responsive Design**: Mobile-friendly interface
- **Newsletter Signup**: Email collection with cookie tracking

### 🚧 In Development

- **AI Integration**: LangChain/LangGraph agents for intelligent recommendations
- **Docker Containerization**: Production-ready containerization
- **Testing Infrastructure**: Comprehensive testing framework
- **CI/CD Pipeline**: Automated testing and deployment

### 📋 Planned

- **Mobile App**: Progressive Web App (PWA) features
- **Advanced Analytics**: Reading statistics and insights
- **Social Features**: Book sharing and recommendations
- **API Marketplace**: Third-party integrations

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 4.2.21 with Django Ninja
- **Database**: PostgreSQL with UUID primary keys
- **Caching**: Redis for session storage and caching
- **Authentication**: JWT-based authentication
- **API**: RESTful API with automatic documentation
- **External APIs**: Google Books API integration

### Frontend

- **Framework**: Next.js 14.1.0 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Chakra UI with Framer Motion animations
- **State Management**: React hooks and context
- **Theming**: next-themes for dark/light mode
- **Analytics**: Google Analytics integration

### Infrastructure

- **Containerization**: Docker with multi-stage builds
- **Deployment**: Support for AWS, Azure, and Digital Ocean
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Health checks and performance monitoring

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
npm run dev              # Start both frontend and backend
npm run install:all      # Install all dependencies
npm run build            # Build frontend for production
npm run test             # Run all tests
npm run lint             # Lint code
npm run docker:dev       # Start with Docker (when implemented)
npm run docker:build     # Build Docker images (when implemented)
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

1. **Docker Implementation** - Containerization for consistent environments
2. **AI Integration** - LangChain/LangGraph agents for intelligent features
3. **Testing Infrastructure** - Comprehensive testing framework
4. **CI/CD Pipeline** - Automated testing and deployment

## 📊 Project Status

### Phase 1: Docker Containerization (Weeks 1-2) - 🔴 CRITICAL

- [x] **COMPLETED**: Comprehensive Docker strategy documented
- [ ] **TODO**: Implement Docker containerization across all services
- [ ] **TODO**: Set up unified development workflow

### Phase 2: AI Agent Integration (Weeks 3-5) - 🟡 HIGH

- [x] **COMPLETED**: Complete AI integration specification
- [ ] **TODO**: Install LangChain/LangGraph dependencies
- [ ] **TODO**: Implement core AI agents

### Phase 3: Testing Infrastructure (Weeks 6-7) - 🟡 HIGH

- [ ] **TODO**: Set up Jest and React Testing Library
- [ ] **TODO**: Implement Django testing framework
- [ ] **TODO**: Add CI/CD with GitHub Actions

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
- **Chakra UI** - Accessible component library
- **Google Books API** - Book metadata and covers
- **LangChain/LangGraph** - AI agent framework

---

**Development setup?** 🚀

Start with [Development Setup](docs/development/setup.md) or jump straight to [Deployment](docs/deployment/README.md) if you're ready to go live!
