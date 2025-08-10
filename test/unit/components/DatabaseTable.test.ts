import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatabaseTable from '~/components/DatabaseTable.vue'

describe('DatabaseTable', () => {
  const mockTableData = {
    name: 'users',
    columns: ['id', 'name', 'age'],
    rows: [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 }
    ]
  }

  it('should render table with correct headers', () => {
    const wrapper = mount(DatabaseTable, {
      props: { db: mockTableData }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('id')
    expect(headers[1].text()).toBe('name')
    expect(headers[2].text()).toBe('age')
  })

  it('should render table data correctly', () => {
    const wrapper = mount(DatabaseTable, {
      props: { db: mockTableData }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
    
    // 最初の行をチェック
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('1')
    expect(firstRowCells[1].text()).toBe('Alice')
    expect(firstRowCells[2].text()).toBe('25')
    
    // 2番目の行をチェック
    const secondRowCells = rows[1].findAll('td')
    expect(secondRowCells[0].text()).toBe('2')
    expect(secondRowCells[1].text()).toBe('Bob')
    expect(secondRowCells[2].text()).toBe('30')
  })

  it('should display table name', () => {
    const wrapper = mount(DatabaseTable, {
      props: { db: mockTableData }
    })
    
    expect(wrapper.text()).toContain('テーブル名: users')
  })

  it('should handle empty table', () => {
    const emptyTableData = {
      name: 'empty_table',
      columns: ['id', 'name'],
      rows: []
    }
    
    const wrapper = mount(DatabaseTable, {
      props: { db: emptyTableData }
    })
    
    // ヘッダーは表示される
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toBe('id')
    expect(headers[1].text()).toBe('name')
    
    // データ行は0個
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(0)
    
    expect(wrapper.text()).toContain('テーブル名: empty_table')
  })

  it('should render table with proper CSS classes', () => {
    const wrapper = mount(DatabaseTable, {
      props: { db: mockTableData }
    })
    
    const table = wrapper.find('table')
    expect(table.classes()).toContain('w-full')
    expect(table.classes()).toContain('border')
    expect(table.classes()).toContain('border-purple-200')
    
    const thead = wrapper.find('thead')
    expect(thead.classes()).toContain('bg-gradient-to-r')
    expect(thead.classes()).toContain('from-indigo-100')
    expect(thead.classes()).toContain('to-purple-100')
  })

  it('should handle different data types in rows', () => {
    const mixedDataTable = {
      name: 'mixed_data',
      columns: ['id', 'name', 'active', 'score'],
      rows: [
        { id: 1, name: 'Test', active: true, score: 95.5 },
        { id: 2, name: 'Test2', active: false, score: null }
      ]
    }
    
    const wrapper = mount(DatabaseTable, {
      props: { db: mixedDataTable }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    
    // 1行目
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('1')
    expect(firstRowCells[1].text()).toBe('Test')
    expect(firstRowCells[2].text()).toBe('true')
    expect(firstRowCells[3].text()).toBe('95.5')
    
    // 2行目
    const secondRowCells = rows[1].findAll('td')
    expect(secondRowCells[0].text()).toBe('2')
    expect(secondRowCells[1].text()).toBe('Test2')
    expect(secondRowCells[2].text()).toBe('false')
    expect(secondRowCells[3].text()).toBe('')  // nullは空文字として表示される
  })
})