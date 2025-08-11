## UPDATE
Dont forget to update this file whenever the content is wrong or becomes wrong from your change

# Copilot Instructions for Nuxt Memo App

## Project Overview
This is a Japanese educational web app built with Nuxt 3 for learning SQL, quizzes, and games. The app features a complete user authentication system with database persistence, in-browser SQL execution via AlaSQL, and integrates OpenAI for SQL assistance.

## Architecture & Data Flow

### Core Structure
- **Pages**: File-based routing with `/sql/[[id]].vue` for dynamic SQL questions, `/quiz.vue`, `/janken.vue`, `/login.vue`, `/register.vue`, `/profile.vue`
- **Composables**: State management via `useSqlQuiz()`, `useSqlDb()`, `useAuth()`, `useUserProgress()` - prefer these over stores
- **Data**: Static JSON files in `/data/` drive content (questions, databases, explanations)
- **Components**: Reusable UI components follow `PascalCase.vue` naming
- **Database**: SQLite database with abstraction layer for user data and progress tracking

### User Authentication System
Complete user authentication with database persistence:

#### Database Abstraction Layer
- `DatabaseAdapter` interface ensures consistent API across database implementations
- `DatabaseFactory` enables easy switching between SQLite/MySQL/PostgreSQL via `DATABASE_TYPE` environment variable
- SQLite adapter with automatic schema migrations and session management
- Database path handling for both development (`/data/users.db`) and serverless production (`/tmp/users.db`)

#### Authentication Flow
```typescript
// useAuth.ts - Database-backed authentication
const { isLoggedIn, userProfile, username, checkAuth, login, register, logout } = useAuth();

// User registration with validation
const result = await register(email, password, username);

// Session-based login with secure cookies
const result = await login(email, password);
```

#### User Progress Tracking
```typescript
// useUserProgress.ts - Server-synchronized progress tracking
const { progress, recordCorrectAnswer, isQuestionAnsweredCorrectly, clearProgress } = useUserProgress();

// Progress automatically syncs between server database and local storage
await recordCorrectAnswer(questionId, genre, subgenre, level);
```

### SQL Learning System
Questions are organized by `genre` → `subgenre` → `level` hierarchy:
```typescript
// useSqlQuiz.ts pattern - always sort by genre, subgenre, level
questions.value = loaded.sort((a, b) => {
    if (a.genre !== b.genre) return (a.genre || '').localeCompare(b.genre || '')
    if ((a.subgenre || '') !== (b.subgenre || '')) return (a.subgenre || '').localeCompare(b.subgenre || '')
    return (a.level || 0) - (b.level || 0)
})
```

#### Question Types
The system supports two types of SQL questions:

1. **Execution Questions** (`type: "execution"` or undefined):
   - Traditional SQL questions where users write and execute queries
   - Have `answer` field with correct SQL
   - Use `SqlExecutionPanel` component

2. **Analysis Questions** (`type: "analysis"`):
   - Code analysis questions for advanced concepts
   - Have `analysisCode` field with SQL to analyze
   - Support specialized genres: `PERFORMANCE`, `TRANSACTION`, `DEADLOCK`
   - Use `SqlAnalysisPanel` component with user answer input

### In-Browser SQL Execution
AlaSQL plugin (`/plugins/alasql.ts`) initializes memory databases on app start:
- Tables from `sqlDatabases.json` are auto-created
- Use `$alasql` injection or direct import for SQL execution
- Client-side execution for learning exercises (separate from user data database)

## Development Patterns

### Database Operations
```typescript
// Database abstraction usage
import { database } from '~/server/utils/database-factory';

// User operations
const user = database.createUser(email, username, passwordHash);
const user = database.getUserByEmail(email);

// Progress operations
database.saveProgress(userId, questionId, genre, subgenre, level);
const progress = database.getUserProgress(userId);

// Session management
database.createSession(sessionId, userId);
const session = database.getSession(sessionId);
```

### Styling Conventions
- TailwindCSS with custom gradient utilities in `/assets/main.css`
- Use `.btn-gradient` for primary actions, `.btn-sql-question` for secondary
- Consistent purple/indigo/pink gradient theme throughout

### Component Communication
```vue
<!-- Prefer props/emits over complex state management -->
<SqlEditor v-model="sql" @execute="executeUserSQL" @ask-ai="askAI" />
<SqlAnalysisPanel :analysisCode="code" @submit-answer="submitAnalysisAnswer" />
```

### AI Integration
OpenAI API calls go through `/server/api/openai.post.ts` with built-in prompt injection protection:
- Only SQL-related prompts are allowed
- System prompt restricts responses to SQL education
- **Specialized Analysis Prompts**: Different AI strategies based on question genre:
  - `PERFORMANCE`: Focus on execution plans, indexing, scalability
  - `TRANSACTION`: Cover isolation levels, concurrency control, ACID properties
  - `DEADLOCK`: Examine resource ordering and prevention strategies
- Configure `OPENAI_API_KEY` in runtime config

### Route Protection
Global middleware (`/middleware/auth.global.ts`) protects routes starting with `/janken`:
```typescript
if (!isLoggedIn.value && to.path.startsWith('/janken')) {
    return navigateTo('/login');
}
```

## File Organization

### Server Structure
- `/server/api/`: Authentication endpoints (`login.post.ts`, `register.post.ts`, `logout.post.ts`, `me.get.ts`)
- `/server/api/user/`: User-specific endpoints (`progress.get.ts`, `progress.post.ts`, `reset.post.ts`)
- `/server/utils/`: Database abstraction layer and session management

### Database Schema
```sql
-- Users table with secure password storage
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User progress tracking
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answered_at TEXT NOT NULL,
  genre TEXT,
  subgenre TEXT,
  level INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, question_id)
);

-- Session management
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Data Structure
- `sqlQuestions.json`: Question bank with id, genre, subgenre, level, answer/analysisCode
- `sqlDatabases.json`: Table schemas and seed data for AlaSQL
- `sqlExplanation/*.json`: Educational content for each SQL concept

**Analysis Question Structure:**
```json
{
  "id": 20,
  "level": 1,
  "genre": "PERFORMANCE", 
  "question": "以下のSQLクエリのパフォーマンスを分析し、改善点があれば提案してください",
  "analysisCode": "SELECT * FROM users WHERE name LIKE '%田%' ORDER BY age DESC",
  "type": "analysis",
  "DbName": "users"
}
```

### Key Components
- `SqlExecutionPanel.vue`: For traditional SQL execution questions
- `SqlAnalysisPanel.vue`: For code analysis questions with user answer input
- `SqlQuestionContent.vue`: Question display and navigation
- `SqlAiAssistant.vue`: AI response display

### Key Composables
- `useSqlQuiz()`: Question management and loading
- `useSqlDb()`: Database schema access via `getDatabaseByName()`
- `useAuth()`: Complete authentication system with server session management
- `useUserProgress()`: Server-synchronized progress tracking with local storage fallback

## Development Workflow

### Adding New SQL Questions

#### Execution Questions
1. Add to `sqlQuestions.json` with proper genre/subgenre/level
2. Include `answer` field with correct SQL
3. Ensure referenced `DbName` exists in `sqlDatabases.json`

#### Analysis Questions
1. Add to `sqlQuestions.json` with `type: "analysis"`
2. Include `analysisCode` field with SQL to analyze
3. Use genre: `PERFORMANCE`, `TRANSACTION`, or `DEADLOCK` for specialized AI prompts
4. Questions auto-appear on index page grouped by taxonomy

### Testing Authentication Features
- Test user registration at `/register`
- Test login/logout flow with session persistence
- Verify progress tracking across logout/login cycles
- Test both legacy test users (1@gmail.com/1234) and new registrations

### Testing SQL Features
- Use browser devtools to inspect AlaSQL state: `window.alasql.databases`
- SQL errors display in red bordered sections
- AI responses appear in purple bordered sections
- Analysis questions allow user input before AI feedback

### Environment Setup
```bash
npm run dev  # Standard Nuxt development
# Requires OPENAI_API_KEY for AI features
# Optional: DATABASE_TYPE=sqlite|mysql|postgresql (defaults to sqlite)
```

### Database Deployment Notes
- **Development**: Uses `/data/users.db` for persistence
- **Production/Serverless**: Uses `/tmp/users.db` with automatic directory creation
- **Future scaling**: Ready for MySQL/PostgreSQL via DATABASE_TYPE environment variable

## Project-Specific Notes

- All UI text is in Japanese - maintain consistency
- Question navigation uses array indices, not database IDs
- File naming: `[[id]].vue` for catch-all dynamic routes
- TypeScript is configured with interfaces for user data and progress tracking
- Database-first approach ensures data persistence across sessions and devices
- Backward compatibility maintained for existing test users
- Analysis questions provide educational experience for theoretical concepts
- User answers in analysis questions are saved and displayed alongside AI feedback
- Secure authentication with bcrypt password hashing and HttpOnly session cookies
