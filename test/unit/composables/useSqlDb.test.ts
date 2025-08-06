import { describe, it, expect, vi } from 'vitest'
import { useSqlDb } from '~/composables/useSqlDb'

// モックデータ
vi.mock('~/data/sqlDatabases.json', () => ({
  default: [
    {
      name: 'users',
      columns: ['id', 'name', 'age'],
      rows: [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 }
      ]
    },
    {
      name: 'customers',
      columns: ['id', 'customer_name', 'city'],
      rows: [
        { id: 1, customer_name: 'Test Customer', city: 'Tokyo' }
      ]
    }
  ]
}))

describe('useSqlDb', () => {
  it('should load databases correctly', async () => {
    const { databases, loadDatabases } = useSqlDb()
    
    await loadDatabases()
    
    expect(databases.value).toHaveLength(2)
    expect(databases.value[0].name).toBe('users')
    expect(databases.value[1].name).toBe('customers')
  })

  it('should get database by name', async () => {
    const { getDatabaseByName, loadDatabases } = useSqlDb()
    
    // データベースを先に読み込む
    await loadDatabases()
    
    const db = getDatabaseByName('users')
    
    expect(db).toBeDefined()
    expect(db?.name).toBe('users')
    expect(db?.columns).toEqual(['id', 'name', 'age'])
    expect(db?.rows).toHaveLength(2)
  })

  it('should return undefined for non-existent database', async () => {
    const { getDatabaseByName, loadDatabases } = useSqlDb()
    
    await loadDatabases()
    
    const db = getDatabaseByName('nonexistent')
    
    expect(db).toBeUndefined()
  })

  it('should have proper database structure', async () => {
    const { databases, loadDatabases } = useSqlDb()
    
    await loadDatabases()
    
    const database = databases.value[0]
    expect(database).toHaveProperty('name')
    expect(database).toHaveProperty('columns')
    expect(database).toHaveProperty('rows')
    expect(Array.isArray(database.columns)).toBe(true)
    expect(Array.isArray(database.rows)).toBe(true)
  })
})