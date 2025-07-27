// plugins/markdown.client.ts
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

export default defineNuxtPlugin(() => {
  // Configure markdown-it with highlight.js
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  })

  // Provide markdown renderer globally
  return {
    provide: {
      md: md
    }
  }
})