import { describe, it, expect, beforeEach, vi } from 'vitest'
import alasql from 'alasql'
import tables from '~/data/sqlDatabases.json'

describe('AlaSQL Integration Tests', () => {
  beforeEach(() => {
    // Initialize AlaSQL properly for testing
    alasql.options.cache = false  // Disable cache to avoid issues
    
    // Create or reset ALASQL database
    try {
      alasql('CREATE DATABASE ALASQL; USE ALASQL;')
    } catch (e) {
      // Database might already exist, just use it
      alasql('USE ALASQL;')
    }
    
    // Clean up existing tables
    if (alasql.databases.ALASQL && alasql.databases.ALASQL.tables) {
      Object.keys(alasql.databases.ALASQL.tables).forEach(tableName => {
        try {
          alasql(`DROP TABLE ${tableName}`)
        } catch (e) {
          // Ignore errors when dropping non-existent tables
        }
      })
    }
  })

  it('should initialize ALASQL database correctly', () => {
    // Database should already be initialized in beforeEach
    expect(alasql.databases.ALASQL).toBeDefined()
    expect(alasql.databases.ALASQL.tables).toBeDefined()
  })

  it('should create tables from JSON data', () => {
    // Create a sample table from test data
    const testTable = {
      name: 'test_users',
      columns: ['id', 'name', 'age'],
      rows: [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 }
      ]
    }

    // Create table
    const colsDef = testTable.columns.map((c: string) => `${c}`).join(',')
    alasql(`CREATE TABLE ${testTable.name} (${colsDef});`)

    // Insert data
    testTable.rows.forEach((row: Record<string, any>) => {
      const cols = Object.keys(row).join(',')
      const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
      alasql(`INSERT INTO ${testTable.name} (${cols}) VALUES (${vals});`)
    })

    // Verify table was created
    expect(alasql.databases.ALASQL.tables[testTable.name]).toBeDefined()
    
    // Verify data was inserted
    const result = alasql(`SELECT * FROM ${testTable.name}`)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Alice')
    expect(result[1].name).toBe('Bob')
  })

  it('should execute basic SQL queries correctly', () => {
    // Setup test data
    alasql('CREATE TABLE employees (id INT, name STRING, department STRING, salary INT);')
    alasql("INSERT INTO employees VALUES (1, 'John', 'IT', 50000);")
    alasql("INSERT INTO employees VALUES (2, 'Jane', 'HR', 45000);")
    alasql("INSERT INTO employees VALUES (3, 'Bob', 'IT', 55000);")

    // Test SELECT
    const allEmployees = alasql('SELECT * FROM employees')
    expect(allEmployees).toHaveLength(3)

    // Test WHERE clause
    const itEmployees = alasql("SELECT * FROM employees WHERE department = 'IT'")
    expect(itEmployees).toHaveLength(2)

    // Test ORDER BY
    const sortedBySalary = alasql('SELECT * FROM employees ORDER BY salary DESC')
    expect(sortedBySalary[0].salary).toBe(55000)
    expect(sortedBySalary[2].salary).toBe(45000)

    // Test aggregation
    const avgSalary = alasql('SELECT AVG(salary) as avg_salary FROM employees')
    expect(avgSalary[0].avg_salary).toBe(50000)
  })

  it('should handle SQL errors gracefully', () => {
    // Test invalid table name
    expect(() => {
      alasql('SELECT * FROM non_existent_table')
    }).toThrow()

    // Test invalid syntax
    expect(() => {
      alasql('INVALID SQL SYNTAX')
    }).toThrow()

    // Test invalid column
    alasql('CREATE TABLE test_table (id INT, name STRING);')
    expect(() => {
      alasql('SELECT invalid_column FROM test_table')
    }).toThrow()
  })

  it('should handle complex queries with JOINs', () => {
    // Create related tables
    alasql('CREATE TABLE departments (id INT, name STRING);')
    alasql('CREATE TABLE employees (id INT, name STRING, dept_id INT);')

    // Insert test data
    alasql("INSERT INTO departments VALUES (1, 'IT'), (2, 'HR');")
    alasql("INSERT INTO employees VALUES (1, 'Alice', 1), (2, 'Bob', 2), (3, 'Charlie', 1);")

    // Test JOIN
    const joinResult = alasql(`
      SELECT e.name, d.name as department 
      FROM employees e 
      JOIN departments d ON e.dept_id = d.id
    `)

    expect(joinResult).toHaveLength(3)
    expect(joinResult[0].department).toBe('IT')
    expect(joinResult[1].department).toBe('HR')
  })

  it('should initialize all tables from sqlDatabases.json', () => {
    // Simulate the plugin initialization
    tables.forEach((tbl: any) => {
      if (!alasql.databases.ALASQL.tables[tbl.name]) {
        const colsDef = tbl.columns.map((c: string) => `${c}`).join(',')
        alasql(`CREATE TABLE ${tbl.name} (${colsDef});`)
        
        tbl.rows.forEach((row: Record<string, any>) => {
          const cols = Object.keys(row).join(',')
          const vals = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(',')
          alasql(`INSERT INTO ${tbl.name} (${cols}) VALUES (${vals});`)
        })
      }
    })

    // Verify tables were created
    expect(Object.keys(alasql.databases.ALASQL.tables).length).toBeGreaterThan(0)

    // Test that we can query the first table
    if (tables.length > 0) {
      const firstTable = tables[0]
      const result = alasql(`SELECT * FROM ${firstTable.name}`)
      expect(result.length).toBe(firstTable.rows.length)
    }
  })

  it('should handle table creation with various data types', () => {
    // Test different data types
    const testData = {
      name: 'mixed_types',
      columns: ['id', 'name', 'active', 'score'],
      rows: [
        { id: 1, name: 'Test', active: true, score: 95.5 },
        { id: 2, name: 'Test2', active: false, score: 87.2 },
        { id: 3, name: null, active: true, score: null }
      ]
    }

    // Create table
    const colsDef = testData.columns.map((c: string) => `${c}`).join(',')
    alasql(`CREATE TABLE ${testData.name} (${colsDef});`)

    // Insert data with different types
    testData.rows.forEach((row: Record<string, any>) => {
      const cols = Object.keys(row).join(',')
      const vals = Object.values(row).map(v => {
        if (v === null) return 'NULL'
        if (typeof v === 'string') return `'${v}'`
        return v
      }).join(',')
      alasql(`INSERT INTO ${testData.name} (${cols}) VALUES (${vals});`)
    })

    // Verify data integrity
    const result = alasql(`SELECT * FROM ${testData.name}`)
    expect(result).toHaveLength(3)
    expect(result[0].active).toBe(true)
    expect(result[1].active).toBe(false)
    // AlaSQL treats NULL as undefined, not null
    expect(result[2].name).toBeUndefined()
  })
})