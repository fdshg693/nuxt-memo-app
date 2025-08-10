import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SafeAiResponse from '~/components/SafeAiResponse.vue'

describe('SafeAiResponse', () => {
  it('renders plain text correctly', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: 'This is plain text'
      }
    })
    
    expect(wrapper.text()).toContain('This is plain text')
  })

  it('renders markdown bold text', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: 'This is **bold** text'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<strong>bold</strong>')
  })

  it('renders markdown italic text', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: 'This is *italic* text'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<em>italic</em>')
  })

  it('renders markdown inline code', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: 'This is `code` text'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<code>code</code>')
  })

  it('renders markdown code blocks', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: '```sql\nSELECT * FROM users;\n```'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<pre>')
    expect(html).toContain('<code class="language-sql">')
    expect(html).toContain('SELECT * FROM users;')
  })

  it('renders markdown links with target="_blank"', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: 'Check out [this link](https://example.com)'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('this link')
  })

  it('renders markdown lists', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: '- Item 1\n- Item 2\n- Item 3'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>')
    expect(html).toContain('Item 1')
    expect(html).toContain('Item 2')
  })

  it('renders markdown headers', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: '# Header 1\n## Header 2\n### Header 3'
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<h1>')
    expect(html).toContain('<h2>')
    expect(html).toContain('<h3>')
    expect(html).toContain('Header 1')
  })

  it('handles complex markdown with multiple elements', () => {
    const markdownContent = `
# SQL クエリの説明

このクエリは以下の処理を行います：

- **SELECT**: データを取得
- *WHERE*: 条件を指定
- \`JOIN\`: テーブルを結合

詳細は[こちら](https://example.com)をご覧ください。

\`\`\`sql
SELECT u.name, p.title
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE u.active = 1;
\`\`\`
`
    
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: markdownContent
      }
    })
    
    const html = wrapper.html()
    expect(html).toContain('<h1>')
    expect(html).toContain('<strong>SELECT</strong>')
    expect(html).toContain('<em>WHERE</em>')
    expect(html).toContain('<code>JOIN</code>')
    expect(html).toContain('<pre>')
    expect(html).toContain('target="_blank"')
  })

  it('handles empty response', () => {
    const wrapper = mount(SafeAiResponse, {
      props: {
        response: ''
      }
    })
    
    expect(wrapper.html()).toContain('markdown-content')
  })
})