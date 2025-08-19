## UPDATE
Dont forget to update this file whenever the content is wrong or becomes wrong from your change

# Copilot Instructions for Nuxt Memo App

## Project Overview
This is a comprehensive Japanese educational web app built with Nuxt 3 for learning SQL, featuring advanced user authentication, subscription management, AI-powered learning assistance, and secure code execution. The app includes database persistence, in-browser SQL execution via AlaSQL, and integrates OpenAI for intelligent learning support.

## Architecture & Data Flow

### Core Structure
- **Pages**: File-based routing with comprehensive page coverage:
  - `/sql/[[id]].vue` for dynamic SQL questions
  - `/admin.vue` for administrative dashboard
  - `/playground.vue` for secure JavaScript execution
  - `/subscription.vue` for Stripe payment management
  - `/profile.vue` for user profile management
  - `/quiz.vue`, `/janken.vue` for interactive learning
  - `/login.vue`, `/register.vue` for authentication
- **Composables**: Advanced state management via multiple specialized composables
- **Data**: Static JSON files in `/data/` drive educational content
- **Components**: Reusable UI components with security-focused design
- **Database**: SQLite database with production-ready abstraction layer
- **DOCS**: Organized documentation under `/DOCS/` directory for project maintenance

### User Authentication & Management System
Complete enterprise-grade authentication with database persistence:

#### Database Abstraction Layer
- `DatabaseAdapter` interface ensures consistent API across database implementations
- `DatabaseFactory` enables easy switching between SQLite/MySQL/PostgreSQL via `DATABASE_TYPE` environment variable
- SQLite adapter with automatic schema migrations and session management
- Database path handling for both development (`/data/users.db`) and serverless production (`/tmp/users.db`)
- Comprehensive user management with admin role support

#### Authentication Flow
```typescript
// useAuth.ts - Database-backed authentication with session management
const { isLoggedIn, userProfile, username, checkAuth, login, register, logout } = useAuth();

// User registration with validation and secure password hashing
const result = await register(email, password, username);

// Session-based login with secure HttpOnly cookies
const result = await login(email, password);
```

#### Admin Dashboard Features
- User statistics and management interface
- Role-based access control (admin vs regular users)
- User creation and management capabilities
- Progress monitoring across all users
- AI question generation administration

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

### AI Integration & Question Generation
Advanced AI features powered by OpenAI API with specialized services for each use case:

#### AI Architecture Overview
The AI system is now organized into specialized services for different use cases:

```
composables/ai/
├── types.ts                       # TypeScript interfaces for AI system
├── configs.ts                    # AI prompt configurations for each use case  
├── base-service.ts               # Base AI service factory
├── use-sql-quiz-assistant.ts     # SQL quiz Q&A service
├── use-sql-analysis-assistant.ts # SQL analysis service (PERFORMANCE/TRANSACTION/DEADLOCK)
├── use-sql-question-generator.ts # SQL question generation service
└── index.ts                      # Exports all AI services
```

#### Specialized AI Services

**1. SQL Quiz Assistant** (`useSqlQuizAssistant`)
- Used in `pages/sql/[[id]].vue` for general SQL learning questions
- Context-aware prompt building with database information
- Validates SQL-related prompts with built-in security

**2. SQL Analysis Assistant** (`useSqlAnalysisAssistant`)
- Genre-specific analysis for PERFORMANCE, TRANSACTION, DEADLOCK
- Each genre has specialized system prompts:
  - `PERFORMANCE`: Focus on execution plans, indexing, scalability
  - `TRANSACTION`: Cover isolation levels, concurrency control, ACID properties
  - `DEADLOCK`: Examine resource ordering and prevention strategies
- Intelligent service selection based on question genre

**3. SQL Question Generator** (`useSqlQuestionGenerator`)
- Used in `server/api/generate-question.post.ts` for AI-powered question creation
- Database schema-aware generation with validation
- Validates table existence and generates appropriate questions
- JSON response parsing with fallback handling

#### AI Learning Assistant Configuration
All AI services go through centralized prompt configurations with built-in security:
- Only SQL-related prompts are allowed
- System prompts restrict responses to SQL education context
- Prompt injection protection across all services
- Configure `OPENAI_API_KEY` in runtime config

#### Usage Examples

```typescript
// SQL Quiz Questions
const { askSqlQuestion } = useSqlQuizAssistant()
const response = await askSqlQuestion(
  'このクエリは正しいですか？',
  'SELECT * FROM users',
  '問題文',
  'データベース情報'
)

// SQL Analysis
const { analyzeSql } = useSqlAnalysisAssistant()
const analysis = await analyzeSql(
  'パフォーマンスを分析してください',
  'PERFORMANCE',
  'SELECT * FROM users WHERE name LIKE "%john%"',
  'パフォーマンス問題の特定'
)

// Question Generation
const { generateQuestion } = useSqlQuestionGenerator()
const question = await generateQuestion('SELECT', 2, 'users')
```

### Subscription & Payment System
Complete Stripe integration for monetization:

#### Stripe Integration
```typescript
// server/api/stripe/ - Payment processing endpoints
// create-checkout-session.post.ts - Secure payment initiation
// subscription-status.get.ts - Real-time subscription status
// webhook.post.ts - Stripe webhook handling
```

#### Subscription Management
- Three-tier pricing: Basic, Pro, Enterprise
- Real-time subscription status monitoring
- Secure payment processing with Stripe
- Subscription status affects feature access

### Secure JavaScript Execution Environment
Advanced security features for code playground:

#### Security Implementation
```typescript
// useSecureJavaScriptExecution.ts - Isolated code execution
// Comprehensive sandboxing with:
// - Network access blocking
// - DOM manipulation prevention
// - Dangerous API restrictions
// - Rate limiting (10 executions per minute)
// - Execution timeout (5 seconds)
```

#### Playground Features
- `/playground` page with secure code editor
- Real-time syntax highlighting
- Safe execution environment
- Educational examples and documentation

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

// User operations with admin support
const user = database.createUser(email, username, passwordHash, isAdmin);
const user = database.getUserByEmail(email);
const users = database.getAllUsers(); // Admin function

// Progress operations
database.saveProgress(userId, questionId, genre, subgenre, level);
const progress = database.getUserProgress(userId);

// Session management with automatic cleanup
database.createSession(sessionId, userId);
const session = database.getSession(sessionId);
database.cleanupExpiredSessions();
```

### Advanced Composables
```typescript
// useAI.ts - Centralized AI service
const { callOpenAI, callOpenAIWithMock } = useAI();

// useDatabaseValidation.ts - Schema validation for AI generation
const { validateTable, getAvailableTables, getDatabaseSchemaForPrompt } = useDatabaseValidation();

// useSecureJavaScriptExecution.ts - Safe code execution
const { executeCode, stopExecution, clearResults } = useSecureJavaScriptExecution();

// useUserProgress.ts - Enhanced progress tracking
const { progress, recordCorrectAnswer, isQuestionAnsweredCorrectly, clearProgress } = useUserProgress();
```

### Styling Conventions
- TailwindCSS with custom gradient utilities in `/assets/main.css`
- Use `.btn-gradient` for primary actions, `.btn-sql-question` for secondary
- Consistent purple/indigo/pink gradient theme throughout
- Security-focused UI indicators (green for safe, red for dangerous)

### Component Communication
```vue
<!-- Enhanced component patterns -->
<SqlEditor v-model="sql" @execute="executeUserSQL" @ask-ai="askAI" />
<SqlAnalysisPanel :analysisCode="code" @submit-answer="submitAnalysisAnswer" />
<SecureJavaScriptEditor v-model="code" @execute="executeSecurely" />
<AdminUserManager :users="users" @create-user="createUser" @toggle-admin="toggleAdmin" />
```

### Route Protection
Enhanced middleware protection (`/middleware/auth.global.ts`):
```typescript
// Protect admin routes
if (to.path.startsWith('/admin') && !userIsAdmin) {
    return navigateTo('/login');
}

// Protect premium features based on subscription
if (to.path.startsWith('/janken') && !isLoggedIn.value) {
    return navigateTo('/login');
}

// Subscription-based access control
if (isPremiumFeature(to.path) && !hasActiveSubscription) {
    return navigateTo('/subscription');
}
```

## File Organization

### Server Structure
- `/server/api/`: Comprehensive API endpoints
  - `admin/`: Administrative functions (user management, question generation)
  - `stripe/`: Payment processing and subscription management
  - `user/`: User-specific endpoints (progress, preferences)
  - `openai.post.ts`: AI integration with security controls
  - `generate-question.post.ts`: AI-powered content generation
- `/server/utils/`: Server utilities
  - `database-factory.ts`: Database abstraction layer
  - `auth.ts`: Authentication helpers and session management

### Enhanced Database Schema
```sql
-- Users table with admin role support
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User progress tracking with enhanced metadata
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answered_at TEXT NOT NULL,
  genre TEXT,
  subgenre TEXT,
  level INTEGER,
  execution_time INTEGER,
  attempts INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, question_id)
);

-- Session management with enhanced security
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscription tracking (if using local subscription management)
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Data Structure
- `sqlQuestions.json`: Question bank with id, genre, subgenre, level, answer/analysisCode
- `sqlDatabases.json`: Table schemas and seed data for AlaSQL
- `sqlExplanation/*.json`: Educational content for each SQL concept

**Enhanced Question Structure:**
```json
{
  "id": 20,
  "level": 1,
  "genre": "PERFORMANCE", 
  "subgenre": "INDEX_OPTIMIZATION",
  "question": "以下のSQLクエリのパフォーマンスを分析し、改善点があれば提案してください",
  "analysisCode": "SELECT * FROM users WHERE name LIKE '%田%' ORDER BY age DESC",
  "type": "analysis",
  "DbName": "users",
  "difficulty": "intermediate",
  "estimatedTime": 300,
  "prerequisites": ["basic_select", "where_clause"]
}
```

### Key Components
- `SqlExecutionPanel.vue`: For traditional SQL execution questions
- `SqlAnalysisPanel.vue`: For code analysis questions with user answer input
- `SqlQuestionContent.vue`: Question display and navigation
- `SqlAiAssistant.vue`: AI response display
- `SecureJavaScriptEditor.vue`: Safe code execution environment
- `AdminUserManager.vue`: User management interface
- `SubscriptionManager.vue`: Payment and subscription handling

### Key Composables
- `useSqlQuiz()`: Question management and loading
- `useSqlDb()`: Database schema access via `getDatabaseByName()`
- `useAuth()`: Complete authentication system with server session management
- `useUserProgress()`: Server-synchronized progress tracking with local storage fallback
- `useAI()`: Base AI service for OpenAI API integration
- `useSqlQuizAssistant()`: Specialized AI service for SQL quiz questions
- `useSqlAnalysisAssistant()`: Specialized AI service for SQL analysis (PERFORMANCE/TRANSACTION/DEADLOCK)
- `useSqlQuestionGenerator()`: Specialized AI service for question generation
- `useSecureJavaScriptExecution()`: Safe code execution with security controls
- `useDatabaseValidation()`: Schema validation for AI question generation

## Development Workflow

### Adding New SQL Questions

#### Execution Questions
1. Add to `sqlQuestions.json` with proper genre/subgenre/level
2. Include `answer` field with correct SQL
3. Ensure referenced `DbName` exists in `sqlDatabases.json`
4. Test with actual database schemas

#### Analysis Questions
1. Add to `sqlQuestions.json` with `type: "analysis"`
2. Include `analysisCode` field with SQL to analyze
3. Use genre: `PERFORMANCE`, `TRANSACTION`, or `DEADLOCK` for specialized AI prompts
4. Questions auto-appear on index page grouped by taxonomy

#### AI-Generated Questions
1. Use admin dashboard to access question generation
2. Specify genre, level, and target database
3. AI validates against actual database schemas using `useSqlQuestionGenerator` service
4. Generated questions require admin review before publishing

#### AI Services Development
1. Use specialized AI services for different contexts:
   - `useSqlQuizAssistant` for general SQL questions
   - `useSqlAnalysisAssistant` for performance/transaction/deadlock analysis
   - `useSqlQuestionGenerator` for creating new questions
2. Each service has dedicated prompt configurations in `composables/ai/configs.ts`
3. Centralized validation and error handling
4. Mock response support for development without API keys

### Testing Authentication Features
- Test user registration at `/register`
- Test login/logout flow with session persistence
- Verify progress tracking across logout/login cycles
- Test admin functions with appropriate permissions
- Verify subscription-based feature access

### Testing SQL Features
- Use browser devtools to inspect AlaSQL state: `window.alasql.databases`
- SQL errors display in red bordered sections
- AI responses appear in purple bordered sections
- Analysis questions allow user input before AI feedback

### Testing Security Features
- Verify JavaScript playground isolation
- Test rate limiting on code execution
- Confirm dangerous APIs are blocked
- Validate session security and expiration

### Environment Setup
```bash
npm run dev  # Standard Nuxt development

# Required for full functionality:
# OPENAI_API_KEY for AI features
# STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET for payments
# DATABASE_TYPE=sqlite|mysql|postgresql (defaults to sqlite)
```

### Database Deployment Notes
- **Development**: Uses `/data/users.db` for persistence
- **Production/Serverless**: Uses `/tmp/users.db` with automatic directory creation
- **Scaling**: Ready for MySQL/PostgreSQL via DATABASE_TYPE environment variable
- **Backup**: Implement regular backup strategy for production user data

## Testing & Quality Assurance

### Testing Stack
- **Unit Tests**: Vitest for composables and utilities
- **E2E Tests**: Playwright for full user workflows
- **Coverage**: Comprehensive test coverage tracking
- **CI/CD**: Automated testing in GitHub Actions

### Test Development
- Follow patterns in `/test/` directory
- Create tests for new composables
- Test authentication flows thoroughly
- Verify subscription logic
- Test AI integration with mocks

### Security Testing
- Validate input sanitization
- Test session management
- Verify subscription access controls
- Test secure code execution boundaries

## Project-Specific Notes

### Internationalization
- All UI text is in Japanese - maintain consistency
- Error messages should be user-friendly in Japanese
- Admin interface uses clear Japanese terminology

### Navigation & UX
- Question navigation uses array indices, not database IDs
- File naming: `[[id]].vue` for catch-all dynamic routes
- Consistent navigation patterns across all pages

### Data Management
- TypeScript interfaces for all data structures
- Database-first approach ensures data persistence
- Backward compatibility maintained for existing test users
- Regular data validation and cleanup

### Security & Privacy
- Secure authentication with bcrypt password hashing
- HttpOnly session cookies prevent XSS attacks
- Isolated JavaScript execution prevents malicious code
- Payment data handled securely through Stripe

### Performance & Scalability
- Database abstraction allows easy scaling
- AlaSQL provides client-side SQL performance
- Lazy loading for large question sets
- Efficient session management with cleanup

### Documentation Organization
- `/DOCS/` directory contains comprehensive technical documentation
- `README.md` provides user-facing project overview
- `AGENTS.md` (this file) serves as developer guide
- Individual feature documentation in `/DOCS/` subdirectories

### Monitoring & Analytics
- User progress tracking for educational insights
- Admin dashboard provides usage statistics
- Subscription metrics through Stripe dashboard
- Error logging for debugging and improvement

This comprehensive guide should be updated whenever significant changes are made to the architecture, new features are added, or development patterns evolve.