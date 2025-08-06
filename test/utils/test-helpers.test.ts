import { describe, it, expect } from 'vitest'
import { 
  createMockQuestion, 
  createMockDatabase, 
  createMockResultData,
  isValidSQL,
  extractTableName
} from './test-helpers'

describe('Test Helpers', () => {
  describe('createMockQuestion', () => {
    it('should create default mock question', () => {
      const question = createMockQuestion()
      
      expect(question.id).toBe(1)
      expect(question.genre).toBe('SELECT')
      expect(question.question).toBe('テスト問題')
      expect(question.answer).toBe('SELECT * FROM users')
      expect(question.DbName).toBe('users')
    })

    it('should override default values', () => {
      const question = createMockQuestion({
        id: 5,
        genre: 'INSERT',
        question: 'カスタム問題'
      })
      
      expect(question.id).toBe(5)
      expect(question.genre).toBe('INSERT')
      expect(question.question).toBe('カスタム問題')
      expect(question.answer).toBe('SELECT * FROM users') // デフォルト値
    })
  })

  describe('createMockDatabase', () => {
    it('should create default mock database', () => {
      const db = createMockDatabase()
      
      expect(db.name).toBe('test_db')
      expect(db.columns).toEqual(['id', 'name'])
      expect(db.rows).toHaveLength(1)
      expect(db.rows[0]).toEqual({ id: 1, name: 'Test User' })
    })

    it('should override default values', () => {
      const db = createMockDatabase({
        name: 'custom_db',
        columns: ['user_id', 'username', 'email']
      })
      
      expect(db.name).toBe('custom_db')
      expect(db.columns).toEqual(['user_id', 'username', 'email'])
    })
  })

  describe('createMockResultData', () => {
    it('should create result data structure', () => {
      const result = createMockResultData(
        ['id', 'name'],
        [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
      )
      
      expect(result.columns).toEqual(['id', 'name'])
      expect(result.result).toHaveLength(2)
    })
  })

  describe('isValidSQL', () => {
    it('should validate SELECT statements', () => {
      expect(isValidSQL('SELECT * FROM users')).toBe(true)
      expect(isValidSQL('select name from customers')).toBe(true)
    })

    it('should validate other SQL statements', () => {
      expect(isValidSQL('INSERT INTO users VALUES (1, "test")')).toBe(true)
      expect(isValidSQL('UPDATE users SET name = "test"')).toBe(true)
      expect(isValidSQL('DELETE FROM users WHERE id = 1')).toBe(true)
    })

    it('should reject invalid SQL', () => {
      expect(isValidSQL('')).toBe(false)
      expect(isValidSQL('   ')).toBe(false)
      expect(isValidSQL('INVALID STATEMENT')).toBe(false)
      expect(isValidSQL('HELLO WORLD')).toBe(false)
    })
  })

  describe('extractTableName', () => {
    it('should extract table name from SELECT statements', () => {
      expect(extractTableName('SELECT * FROM users')).toBe('users')
      expect(extractTableName('SELECT name FROM customers WHERE age > 25')).toBe('customers')
      expect(extractTableName('select id from products')).toBe('products')
    })

    it('should extract table name from INSERT statements', () => {
      expect(extractTableName('INSERT INTO users VALUES (1, "test")')).toBe('users')
      expect(extractTableName('insert into customers (name) values ("test")')).toBe('customers')
    })

    it('should extract table name from UPDATE statements', () => {
      expect(extractTableName('UPDATE users SET name = "test"')).toBe('users')
      expect(extractTableName('update customers set age = 30')).toBe('customers')
    })

    it('should extract table name from DELETE statements', () => {
      expect(extractTableName('DELETE FROM users WHERE id = 1')).toBe('users')
      expect(extractTableName('delete from customers where age < 18')).toBe('customers')
    })

    it('should return null for invalid statements', () => {
      expect(extractTableName('INVALID SQL')).toBeNull()
      expect(extractTableName('')).toBeNull()
      expect(extractTableName('CREATE TABLE test')).toBeNull() // CREATE not handled
    })
  })
})