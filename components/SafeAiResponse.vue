<template>
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Props {
  response: string
}

const props = defineProps<Props>()

const renderedMarkdown = computed(() => {
  if (!props.response) return ''
  
  // Parse the markdown and return HTML
  let html = marked.parse(props.response, {
    breaks: true, // Convert line breaks to <br>
    gfm: true,    // GitHub Flavored Markdown
  })
  
  // Post-process to add target="_blank" to all links
  html = html.replace(/<a href="/g, '<a href="')
                 .replace(/<a href="([^"]*)"([^>]*)>/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-800 underline"$2>')
  
  return html
})
</script>

<style scoped>
.markdown-content {
  @apply text-inherit;
}

/* Markdown styling */
.markdown-content :deep(h1) {
  @apply text-xl font-bold mb-2 mt-3 first:mt-0;
}

.markdown-content :deep(h2) {
  @apply text-lg font-bold mb-2 mt-3 first:mt-0;
}

.markdown-content :deep(h3) {
  @apply text-base font-bold mb-1 mt-2 first:mt-0;
}

.markdown-content :deep(p) {
  @apply mb-2 last:mb-0;
}

.markdown-content :deep(strong) {
  @apply font-bold;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply bg-gray-100 p-3 rounded my-2 overflow-x-auto;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent p-0;
}

.markdown-content :deep(ul) {
  @apply list-disc ml-4 mb-2;
}

.markdown-content :deep(ol) {
  @apply list-decimal ml-4 mb-2;
}

.markdown-content :deep(li) {
  @apply mb-1;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-gray-300 pl-4 italic my-2;
}

.markdown-content :deep(hr) {
  @apply border-gray-300 my-3;
}
</style>