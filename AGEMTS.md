## UPDATE
Dont forget to update this file whenever the content is wrong or becomes wrong from your change

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
```

### AI Integration
OpenAI API calls go through `/server/api/openai.post.ts` with built-in prompt injection protection:
- Only SQL-related prompts are allowed
- System prompt restricts responses to SQL education
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
- `sqlQuestions.json`: Question bank with id, genre, subgenre, level, answer
- `sqlDatabases.json`: Table schemas and seed data for AlaSQL
- `sqlExplanation/*.json`: Educational content for each SQL concept

### Key Composables
- `useSqlQuiz()`: Question management and loading
- `useSqlDb()`: Database schema access via `getDatabaseByName()`
- `useAuth()`: Simple login state (localStorage-based)

## Development Workflow

### Adding New SQL Questions
1. Add to `sqlQuestions.json` with proper genre/subgenre/level
2. Ensure referenced `DbName` exists in `sqlDatabases.json`
3. Questions auto-appear on index page grouped by taxonomy

### Testing SQL Features
- Use browser devtools to inspect AlaSQL state: `window.alasql.databases`
- SQL errors display in red bordered sections
- AI responses appear in purple bordered sections

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
