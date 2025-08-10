## UPDATE
Dont forget to update this file whenever the content is wrong or becomes wrong from your change

# Copilot Instructions for Nuxt Memo App

## Project Overview
This is a Japanese educational web app built with Nuxt 3 for learning SQL, quizzes, and games. The app uses in-browser SQL execution via AlaSQL and integrates OpenAI for SQL assistance.

## Architecture & Data Flow

### Core Structure
- **Pages**: File-based routing with `/sql/[[id]].vue` for dynamic SQL questions, `/quiz.vue`, `/janken.vue`
- **Composables**: State management via `useSqlQuiz()`, `useSqlDb()`, `useAuth()` - prefer these over stores
- **Data**: Static JSON files in `/data/` drive content (questions, databases, explanations)
- **Components**: Reusable UI components follow `PascalCase.vue` naming

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
- No server-side database - everything runs client-side

## Development Patterns

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
- `useAuth()`: Simple login state (localStorage-based)

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

### Testing SQL Features
- Use browser devtools to inspect AlaSQL state: `window.alasql.databases`
- SQL errors display in red bordered sections
- AI responses appear in purple bordered sections
- Analysis questions allow user input before AI feedback

### Environment Setup
```bash
npm run dev  # Standard Nuxt development
# Requires OPENAI_API_KEY for AI features
```

## Project-Specific Notes

- All UI text is in Japanese - maintain consistency
- Question navigation uses array indices, not database IDs
- File naming: `[[id]].vue` for catch-all dynamic routes
- TypeScript is configured but types are basic - add interfaces as needed
- No complex state management - composables handle all data flow
- Analysis questions provide educational experience for theoretical concepts
- User answers in analysis questions are saved and displayed alongside AI feedback
