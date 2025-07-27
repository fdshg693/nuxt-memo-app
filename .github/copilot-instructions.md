# Copilot Instructions - Nuxt SQL Learning App

## Architecture Overview
This is a **Nuxt 3-based interactive SQL learning platform** with three main features: rock-paper-scissors game, programming quiz, and SQL training system. The app uses in-browser AlaSQL database for real-time SQL execution and OpenAI API for AI-powered question generation.

### Core Data Flow Pattern
- **JSON-driven content**: All questions, databases, and explanations stored in `/data/` as JSON files
- **Composable-based state**: Business logic isolated in `/composables/` using Vue 3 composition API
- **In-memory SQL database**: AlaSQL tables initialized from JSON via `/plugins/alasql.ts` on app startup
- **Component composition**: Reusable UI components in `/components/` handle specific concerns (SqlEditor, DatabaseTable, etc.)

## Critical Development Patterns

### SQL Learning System Architecture
The SQL learning system follows this data relationship:
```
sqlQuestions.json (question, answer, DbName) 
    ↓ references
sqlDatabases.json (table definitions & data)
    ↓ loaded by
plugins/alasql.ts (creates in-memory tables)
    ↓ used by
pages/sql/[[id]].vue (dynamic question pages)
```

### Question Navigation Pattern
Questions are categorized by `genre`, `subgenre`, and `level` fields. The index page groups questions hierarchically for navigation. SQL questions reference databases by `DbName` field to display relevant table schemas.

### Composable Responsibilities
- `useSqlQuiz()`: Question loading, sorting by genre→subgenre→level
- `useSqlDb()`: Database schema management, table lookups by name
- `useSqlTableUtils()`: Table creation/manipulation utilities for AlaSQL
- `useAuth()`: Cookie-based authentication state (protects `/janken` routes)

### Component Communication
Components use v-model and emit patterns. Key examples:
- `SqlEditor`: Emits 'execute' and 'ask-ai' events, receives sql v-model
- `AiPromptModal`: Handles OpenAI integration within SqlEditor
- `DatabaseTable`: Displays table schema from database objects

## Development Workflows

### Adding SQL Questions
1. Add question object to `/data/sqlQuestions.json` with required fields: `id`, `question`, `answer`, `DbName`, `genre`, `level`
2. Ensure referenced `DbName` exists in `/data/sqlDatabases.json`
3. Questions auto-appear on index page, accessible via `/sql/{id}` routes

### Adding Database Tables
1. Add table definition to `/data/sqlDatabases.json` with `name`, `columns`, `rows` structure
2. Table automatically created in AlaSQL on app restart via plugin
3. Reference table by `name` field in question's `DbName` property

### AI Integration
Server endpoint `/server/api/openai.post.ts` handles OpenAI requests. Requires `OPENAI_API_KEY` in environment. AI prompts are contextual to current SQL question and database schema.

## Project-Specific Conventions

### File Organization
- **Dynamic routes**: `[[id]].vue` for catch-all SQL question pages
- **Explanation system**: JSON files in `/data/sqlExplanation/` provide educational content by SQL keyword
- **Development tools**: `/developmentKit/` contains HTML utilities for JSON-to-table visualization

### Styling Approach
Uses **Tailwind CSS** with consistent gradient classes:
- `.btn-gradient`: Primary button styling
- `.btn-sql-question`: Question navigation buttons
- Gradient backgrounds: `from-indigo-X via-purple-X to-pink-X` pattern throughout

### Environment Configuration
- `OPENAI_API_KEY`: Server-side OpenAI integration
- `NUXT_PUBLIC_API_KEY`: Client-side public API key
- Authentication uses `useCookie('auth_token')` for persistence

## Key Integration Points

### AlaSQL Database Plugin
The `/plugins/alasql.ts` plugin is critical - it transforms JSON data into queryable SQL tables. All SQL execution happens in-browser via AlaSQL, not a real database server.

### Question-Database Linking
Questions link to databases via the `DbName` field. The system automatically loads and displays relevant table schemas when viewing questions. Multiple tables can be referenced for complex join exercises.

### Answer Validation
SQL answers are validated by executing both user input and expected answer, then comparing result sets using lodash's `isEqual()` for deep object comparison.

### Error Handling
- SQL errors from AlaSQL are caught and displayed in UI
- OpenAI API errors are handled gracefully with fallback messages
- Missing database references are handled with "データベースが見つかりません" messaging
