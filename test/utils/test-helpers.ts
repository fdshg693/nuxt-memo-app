// Test helper utilities
export const createMockQuestion = (overrides = {}) => ({
  id: 1,
  level: 1,
  genre: 'SELECT',
  subgenre: 'WHERE',
  question: 'テスト問題',
  answer: 'SELECT * FROM users',
  DbName: 'users',
  ...overrides
})

export const createMockDatabase = (overrides = {}) => ({
  name: 'test_db',
  columns: ['id', 'name'],
  rows: [
    { id: 1, name: 'Test User' }
  ],
  ...overrides
})

export const createMockResultData = (columns: string[], data: any[]) => ({
  columns,
  result: data
})

// SQL validation helpers
export const isValidSQL = (sql: string): boolean => {
  const trimmed = sql.trim()
  if (!trimmed) return false
  
  const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER']
  const firstWord = trimmed.split(' ')[0].toUpperCase()
  
  return sqlKeywords.includes(firstWord)
}

export const extractTableName = (sql: string): string | null => {
  const trimmed = sql.trim().toUpperCase()
  
  // Simple extraction for SELECT statements
  const selectMatch = trimmed.match(/FROM\s+(\w+)/i)
  if (selectMatch) return selectMatch[1].toLowerCase()
  
  // Simple extraction for INSERT statements
  const insertMatch = trimmed.match(/INSERT\s+INTO\s+(\w+)/i)
  if (insertMatch) return insertMatch[1].toLowerCase()
  
  // Simple extraction for UPDATE statements
  const updateMatch = trimmed.match(/UPDATE\s+(\w+)/i)
  if (updateMatch) return updateMatch[1].toLowerCase()
  
  // Simple extraction for DELETE statements
  const deleteMatch = trimmed.match(/DELETE\s+FROM\s+(\w+)/i)
  if (deleteMatch) return deleteMatch[1].toLowerCase()
  
  return null
}