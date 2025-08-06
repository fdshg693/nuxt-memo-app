import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultTable from '~/components/ResultTable.vue'

describe('ResultTable', () => {
  const mockColumns = ['id', 'name', 'age']
  const mockResult = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 }
  ]

  it('should render result table with data', () => {
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: mockResult
      }
    })
    
    expect(wrapper.find('h3').text()).toBe('結果')
    
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('id')
    expect(headers[1].text()).toBe('name')
    expect(headers[2].text()).toBe('age')
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
  })

  it('should not render table when result is empty', () => {
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: []
      }
    })
    
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  it('should render correct data in table cells', () => {
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: mockResult
      }
    })
    
    const rows = wrapper.findAll('tbody tr')
    
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

  it('should handle single row result', () => {
    const singleResult = [{ id: 1, name: 'Alice', age: 25 }]
    
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: singleResult
      }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)
    
    const cells = rows[0].findAll('td')
    expect(cells[0].text()).toBe('1')
    expect(cells[1].text()).toBe('Alice')
    expect(cells[2].text()).toBe('25')
  })

  it('should handle missing column data', () => {
    const incompleteResult = [
      { id: 1, name: 'Alice' }, // ageがない
      { id: 2, age: 30 }        // nameがない
    ]
    
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: incompleteResult
      }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    
    // 1行目：ageが欠落
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('1')
    expect(firstRowCells[1].text()).toBe('Alice')
    expect(firstRowCells[2].text()).toBe('') // undefinedは空文字として表示
    
    // 2行目：nameが欠落
    const secondRowCells = rows[1].findAll('td')
    expect(secondRowCells[0].text()).toBe('2')
    expect(secondRowCells[1].text()).toBe('') // undefinedは空文字として表示
    expect(secondRowCells[2].text()).toBe('30')
  })

  it('should apply correct CSS classes', () => {
    const wrapper = mount(ResultTable, {
      props: {
        columns: mockColumns,
        result: mockResult
      }
    })
    
    const table = wrapper.find('table')
    expect(table.classes()).toContain('w-full')
    expect(table.classes()).toContain('border')
    expect(table.classes()).toContain('border-purple-200')
    
    const thead = wrapper.find('thead')
    expect(thead.classes()).toContain('bg-gradient-to-r')
    expect(thead.classes()).toContain('from-indigo-100')
    expect(thead.classes()).toContain('to-purple-100')
    
    const h3 = wrapper.find('h3')
    expect(h3.classes()).toContain('font-semibold')
    expect(h3.classes()).toContain('text-purple-700')
  })

  it('should handle columns with special characters', () => {
    const specialColumns = ['user_id', 'full-name', 'email@domain']
    const specialResult = [
      { 'user_id': 1, 'full-name': 'Alice Smith', 'email@domain': 'alice@test.com' }
    ]
    
    const wrapper = mount(ResultTable, {
      props: {
        columns: specialColumns,
        result: specialResult
      }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers[0].text()).toBe('user_id')
    expect(headers[1].text()).toBe('full-name')
    expect(headers[2].text()).toBe('email@domain')
    
    const cells = wrapper.findAll('tbody tr')[0].findAll('td')
    expect(cells[0].text()).toBe('1')
    expect(cells[1].text()).toBe('Alice Smith')
    expect(cells[2].text()).toBe('alice@test.com')
  })
})