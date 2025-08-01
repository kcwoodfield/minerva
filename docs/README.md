# Minerva Documentation

Welcome to the Minerva documentation! This directory contains comprehensive documentation for the personal book library management system.

## 📋 Quick Navigation

### 🚀 Getting Started
- **[Development Setup](development/setup.md)** - Get up and running locally
- **[Project Overview](../README.md)** - High-level project description
- **[Architecture Overview](architecture/overview.md)** - System design and components

### 🏗️ Technical Documentation

#### Architecture & Design
- **[`architecture/`](architecture/)** - System design and technical architecture
  - [System Overview](architecture/overview.md) - High-level architecture and data flow
  - Templates for database design, API specifications, and security architecture

#### Development Guides  
- **[`development/`](development/)** - Setup guides and development practices
  - [Development Setup](development/setup.md) - Local environment configuration
  - [Deployment Guide](development/DEPLOYMENT.md) - Production deployment procedures
  - Templates for testing, coding standards, and CI/CD

#### Architecture Decisions
- **[`decisions/`](decisions/)** - Architecture Decision Records (ADRs)
  - [ADR-001: Unified Repository Structure](decisions/001-unified-repository-structure.md) - Repository consolidation decision
  - Templates and guidelines for documenting technical decisions

### 📝 Development Workflow Documentation

#### Feature Planning
- **[`features/`](features/)** - Feature specifications and planning docs
  - [Docker Containerization](features/docker-containerization.md) - Complete Docker implementation plan
  - Templates for feature documentation and implementation planning

#### Issue Resolution
- **[`bugfixes/`](bugfixes/)** - Bug fix documentation and analysis
  - Templates for root cause analysis and resolution documentation

#### Project Updates
- **[`updates/`](updates/)** - Project updates and architectural changes
  - [Docker Unified Implementation](updates/docker-unified-implementation.md) - Repository unification update
  - [Docker Setup](updates/docker-setup.md) - Original containerization planning
  - [LangGraph Integration](updates/langgraph-agents-integration.md) - AI features planning

### 👥 User Documentation
- **[`user-guides/`](user-guides/)** - End-user documentation (future)
  - Templates for API reference, getting started guides, and feature documentation

## 📁 Directory Structure

```
docs/
├── README.md                    # This navigation guide
├── project-plan.md             # Overall project roadmap
├── architecture/               # System design documentation
│   ├── README.md              # Architecture documentation guide
│   └── overview.md            # High-level system architecture
├── development/               # Developer setup and guides
│   ├── README.md              # Development documentation guide
│   ├── setup.md               # Local development setup
│   └── DEPLOYMENT.md          # Production deployment
├── decisions/                 # Architecture Decision Records
│   ├── README.md              # ADR guidelines and templates
│   └── 001-unified-repository-structure.md
├── features/                  # Feature specifications (workflow-aligned)
│   ├── README.md              # Feature documentation templates
│   └── docker-containerization.md
├── bugfixes/                  # Bug fix documentation (workflow-aligned)
│   └── README.md              # Bug fix documentation templates
├── updates/                   # Project updates (workflow-aligned)
│   ├── README.md              # Update documentation templates
│   ├── docker-setup.md
│   ├── docker-unified-implementation.md
│   └── langgraph-agents-integration.md
└── user-guides/              # End-user documentation
    └── README.md              # User guide templates
```

## 🎯 Documentation Philosophy

### Workflow-Aligned Structure
The `features/`, `bugfixes/`, and `updates/` directories mirror our Git branching strategy:
- **Features**: Documentation for `feature/*` branches and new functionality
- **Bugfixes**: Documentation for `bugfix/*` branches and issue resolutions  
- **Updates**: Documentation for project-wide changes and architectural updates

### Standard Documentation Categories
The `architecture/`, `development/`, `decisions/`, and `user-guides/` directories follow industry-standard patterns:
- **Architecture**: Technical design and system documentation
- **Development**: Setup guides and developer workflows
- **Decisions**: Architecture Decision Records (ADRs) for major technical choices
- **User Guides**: End-user documentation and API references

## 📖 Documentation Types

### Architecture Decision Records (ADRs)
Document significant technical decisions with context, alternatives considered, and consequences. See [`decisions/`](decisions/) for templates and examples.

### Feature Specifications
Comprehensive planning documents for new features, including requirements, implementation plans, and testing strategies. See [`features/`](features/) for templates.

### Development Guides
Step-by-step guides for developers, from initial setup to advanced workflows. See [`development/`](development/) for current guides.

### Update Documentation
Records of major project changes, migrations, and architectural evolution. See [`updates/`](updates/) for examples.

## 🔄 Keeping Documentation Current

### When to Update Documentation

**Architecture Changes**: Update `architecture/` docs and create ADRs in `decisions/`

**New Features**: Create planning docs in `features/` before implementation

**Bug Fixes**: Document significant fixes and root cause analysis in `bugfixes/`

**Project Updates**: Record major changes and migrations in `updates/`

**Development Workflow**: Update `development/` guides when processes change

### Documentation Maintenance
- **Review quarterly** for outdated information
- **Update after major releases** to reflect current state
- **Link related documents** to improve discoverability
- **Keep templates current** with project needs

## 🤝 Contributing to Documentation

1. **Use templates** provided in each directory's README
2. **Follow naming conventions** (especially for ADRs)
3. **Link related documents** for better navigation
4. **Include context** - explain why decisions were made
5. **Keep it current** - update docs when code changes

---

## 📚 Related Resources

- **[Root CLAUDE.md](../CLAUDE.md)** - Comprehensive development guide for Claude Code
- **[Main README](../README.md)** - Project overview and quick start
- **[Package.json](../package.json)** - Available npm scripts and workspace configuration

For questions about documentation structure or content, see the templates in each directory or refer to the ADR guidelines in [`decisions/`](decisions/).
