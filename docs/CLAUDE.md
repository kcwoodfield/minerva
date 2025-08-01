# Minerva Backend - Claude Development Guide

## Project Overview

Minerva is a personal book library management system built with Django. This backend provides a comprehensive API for managing book collections, user authentication, and metadata enrichment through Google Books API integration.

## Development Context

### Current Architecture

- **Django 4.2.21** with Django Ninja API framework
- **SQLite** database (development) with planned PostgreSQL migration
- **JWT authentication** with Django Ninja JWT
- **Google Books API** integration for automatic metadata enrichment
- **Single LibraryEntry model** handling all book data with UUID primary keys
- **LangGraph integration** (planned) for AI-powered book recommendations and intelligent features

### Key Files & Locations

- **Settings**: `src/minervahome/settings.py` (dev), `src/minervahome/settings_prod.py` (prod)
- **Models**: `src/libraries/models.py` - LibraryEntry model with comprehensive book fields
- **API**: `src/libraries/api.py` - Django Ninja API endpoints
- **Utils**: `src/libraries/utils.py` - Google Books API integration functions
- **Schemas**: `src/libraries/schemas.py` - Pydantic schemas for API validation
- **URLs**: `src/minervahome/urls.py` - Main URL configuration
- **Migrations**: `src/libraries/migrations/` - Database evolution history
- **AI Services**: `src/ai_services/` (planned) - LangGraph workflows and AI integrations

### Current API Endpoints

```
GET /api/library/ - List books (paginated, searchable, sortable)
POST /api/library/ - Create book with auto-metadata enrichment
PUT /api/library/{book_id} - Update existing book
DELETE /api/library/{book_id} - Delete book
POST /api/token/pair - Get JWT token pair
POST /api/token/refresh - Refresh access token
GET /api/user - Get current user info
```

### Planned AI API Endpoints (Claude-Powered)

```
POST /api/ai/recommendations - Get Claude-powered book recommendations
POST /api/ai/chat - Conversational book discovery with Claude
POST /api/ai/analyze-reading - Generate reading insights using Claude analytics
POST /api/ai/categorize - Claude-powered book categorization and tagging
POST /api/ai/enhance-metadata - Enhance book descriptions with Claude
GET /api/ai/search/semantic - Semantic search with Claude query understanding
POST /api/ai/reading-coach - Personal reading coaching with Claude insights
```

## Development Guidelines

### Code Style & Conventions

- Follow Django best practices and PEP 8
- Use Django Ninja for all new API endpoints
- Implement proper error handling with appropriate HTTP status codes
- Use Pydantic schemas for request/response validation
- Maintain comprehensive docstrings for all functions and classes

### Testing Requirements

- Write unit tests for all models and utility functions
- Create integration tests for API endpoints
- Use Django's TestCase and APITestCase
- Maintain test fixtures with realistic book data
- Ensure >90% code coverage
- Add AI service mocking for reliable testing

### Database Guidelines

- Always create migrations for model changes
- Use UUID primary keys for new models
- Index frequently queried fields
- Consider performance implications of queries
- Plan for multi-user data isolation

### API Development Standards

- Use Django Ninja's automatic OpenAPI documentation
- Implement proper pagination for list endpoints
- Add comprehensive error responses
- Use appropriate HTTP methods and status codes
- Validate all input data with Pydantic schemas

## LangGraph Integration Guidelines

### AI Service Architecture

When implementing LangGraph features, follow these patterns:

- Create dedicated `ai_services/` directory for LangGraph workflows
- Use environment variables for LLM API keys and configuration
- Implement proper error handling for AI service failures
- Add fallback mechanisms when AI services are unavailable
- Cache AI responses when appropriate to reduce API costs

### LangGraph Workflow Development with Claude

```python
# Example workflow structure using Claude
from langgraph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from typing import TypedDict

class BookRecommendationState(TypedDict):
    user_id: str
    reading_history: list
    preferences: dict
    recommendations: list
    claude_context: str

def create_recommendation_workflow():
    # Initialize Claude model
    claude = ChatAnthropic(
        model="claude-3-5-sonnet-20241022",
        temperature=0.7,
        max_tokens=4096
    )

    workflow = StateGraph(BookRecommendationState)
    workflow.add_node("analyze_preferences", analyze_user_preferences_with_claude)
    workflow.add_node("generate_recommendations", generate_recommendations_with_claude)
    workflow.add_node("explain_recommendations", explain_recommendations_with_claude)

    # Add conditional edges for Claude reasoning
    workflow.add_conditional_edges(
        "analyze_preferences",
        should_generate_more_context,
        {"yes": "generate_recommendations", "no": END}
    )

    return workflow.compile()

def analyze_user_preferences_with_claude(state: BookRecommendationState):
    """Use Claude to analyze user reading patterns and preferences"""
    prompt = f"""
    Analyze this user's reading history and extract their preferences:
    Reading History: {state['reading_history']}

    Provide insights about:
    1. Preferred genres and themes
    2. Reading patterns and habits
    3. Complexity preferences
    4. Author style preferences
    """
    # Claude processing logic here...
    return state
```

### AI Integration Best Practices

- Implement rate limiting for LLM API calls
- Add cost monitoring and budgets for AI services
- Use structured prompts with consistent formatting
- Validate and sanitize AI-generated content
- Implement A/B testing for AI feature effectiveness
- Store AI-generated data with confidence scores
- Provide transparency about AI-powered features to users

### LangGraph Environment Setup

```bash
# Install LangGraph with Anthropic integration
pip install langgraph[anthropic]

# Environment variables for Anthropic Claude integration
export ANTHROPIC_API_KEY=your_anthropic_key
export CLAUDE_MODEL=claude-3-5-sonnet-20241022
export AI_CACHE_TTL=3600
export AI_RATE_LIMIT=100
export ANTHROPIC_MAX_TOKENS=4096
export ANTHROPIC_TEMPERATURE=0.7
```

## Common Development Tasks

### Adding New API Endpoints

1. Define Pydantic schemas in `schemas.py`
2. Implement view logic in `api.py`
3. Add proper error handling and validation
4. Update URL routing if needed
5. Write comprehensive tests
6. Update API documentation

### Adding LangGraph Workflows

1. Create workflow class in `ai_services/workflows/`
2. Define state schema and node functions
3. Implement error handling and fallbacks
4. Add workflow to API endpoint
5. Create tests with mocked LLM responses
6. Document workflow behavior and costs

### Database Model Changes

1. Modify model in `models.py`
2. Create migration: `python manage.py makemigrations`
3. Review generated migration file
4. Apply migration: `python manage.py migrate`
5. Update corresponding schemas and API endpoints
6. Write tests for new functionality

### Google Books API Integration

- Use existing utility functions in `utils.py`
- Handle API rate limits and errors gracefully
- Cache responses when appropriate
- Validate and clean external data before database storage

## Testing Commands

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test libraries.tests

# Run AI service tests (mocked)
python manage.py test ai_services.tests

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Development Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install LangGraph with Anthropic Claude integration
pip install langgraph[anthropic]

# Run migrations
python manage.py migrate

# Add test data
python manage.py shell < src/add_test_data.py

# Start development server
python manage.py runserver
```

## Important Notes

### Multi-User Migration Planning

The system is currently single-user but designed for multi-user conversion:

- LibraryEntry model needs user ForeignKey
- API endpoints need user filtering
- Authentication is already JWT-based
- Database migration strategy is documented in project plan

### AI Service Considerations

- Monitor API costs and usage patterns
- Implement circuit breakers for AI service failures
- Cache expensive AI operations (recommendations, categorization)
- Provide non-AI fallbacks for core functionality
- Consider running local models for privacy-sensitive operations

### Performance Considerations

- Use `select_related()` and `prefetch_related()` for query optimization
- Consider database indexing for search fields
- Plan for pagination on large datasets
- Monitor API response times
- Cache AI responses to reduce latency and costs

### Security Reminders

- Never commit API keys or secrets to version control
- Use environment variables for sensitive configuration
- Validate all user input thoroughly
- Implement proper CORS configuration
- Follow Django security best practices
- Sanitize AI-generated content before storage

## Useful Django Commands

```bash
# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Check for model issues
python manage.py check

# Show migrations
python manage.py showmigrations

# Generate requirements.txt
pip freeze > requirements.txt

# Test AI workflows (planned)
python manage.py test_ai_workflows
```

## Current Development Priorities

1. **Testing Infrastructure** - Set up comprehensive test suite
2. **Multi-User Support** - Plan and implement user model integration
3. **Performance Optimization** - Database indexing and query optimization
4. **Enhanced Search** - Full-text search and advanced filtering
5. **Reading Analytics** - Statistics and progress tracking features
6. **LangGraph AI Integration** - Intelligent recommendations and conversational features

Refer to `project-plan.md` for detailed development roadmap and feature specifications.
