<template>
  <div class="markdown-content">
    <ClientOnly>
      <div v-if="renderedHtml" v-html="renderedHtml" class="prose prose-purple max-w-none"></div>
      <div v-else-if="props.markdown" class="text-gray-500 italic">コンテンツを解析中...</div>
      <div v-else class="text-gray-400 italic">Markdownコンテンツがありません</div>
      <template #fallback>
        <div class="text-gray-500 italic">Markdownレンダリングを準備中...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  markdown: string
}>()

const { $md } = useNuxtApp()
const renderedHtml = ref('')

// Function to render markdown
const renderMarkdown = () => {
  if (!props.markdown || !process.client || !$md) {
    renderedHtml.value = ''
    return
  }
  
  try {
    renderedHtml.value = $md.render(props.markdown)
  } catch (error) {
    console.error('Markdown rendering error:', error)
    renderedHtml.value = `<pre class="error">${escapeHtml(props.markdown)}</pre>`
  }
}

// Watch for changes in markdown prop
watch(() => props.markdown, renderMarkdown, { immediate: true })

// Render on mount (for client-side hydration)
onMounted(() => {
  renderMarkdown()
})

function escapeHtml(text: string): string {
  if (process.client) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
  return text
}
</script>

<style scoped>
.markdown-content {
  @apply text-gray-800;
}

/* Import highlight.js CSS theme */
.markdown-content :deep(.hljs) {
  @apply bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-200 rounded-lg p-4 font-mono text-sm overflow-x-auto;
}

/* Custom styling for inline code */
.markdown-content :deep(code:not(.hljs code)) {
  @apply bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded font-mono text-sm;
}

/* Typography improvements */
.markdown-content :deep(h1) {
  @apply text-2xl font-bold text-purple-700 mb-4 border-b border-purple-200 pb-2;
}

.markdown-content :deep(h2) {
  @apply text-xl font-semibold text-purple-600 mb-3 mt-6;
}

.markdown-content :deep(h3) {
  @apply text-lg font-medium text-purple-600 mb-2 mt-4;
}

.markdown-content :deep(p) {
  @apply mb-3 leading-relaxed;
}

.markdown-content :deep(ul) {
  @apply list-disc pl-6 mb-3;
}

.markdown-content :deep(ol) {
  @apply list-decimal pl-6 mb-3;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

.markdown-content :deep(strong) {
  @apply font-semibold text-purple-700;
}

.markdown-content :deep(em) {
  @apply italic text-purple-600;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-purple-300 pl-4 py-2 bg-purple-50 rounded-r-lg my-4;
}

.markdown-content :deep(table) {
  @apply table-auto border-collapse border border-purple-200 my-4;
}

.markdown-content :deep(th) {
  @apply border border-purple-200 px-4 py-2 bg-purple-100 font-semibold text-purple-700;
}

.markdown-content :deep(td) {
  @apply border border-purple-200 px-4 py-2;
}

/* Error styling */
.markdown-content :deep(.error) {
  @apply bg-red-50 border border-red-200 text-red-700 p-3 rounded;
}

/* SQL-specific highlighting improvements */
.markdown-content :deep(.language-sql) {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50;
}

.markdown-content :deep(.language-javascript),
.markdown-content :deep(.language-typescript) {
  @apply bg-gradient-to-r from-yellow-50 to-orange-50;
}
</style>