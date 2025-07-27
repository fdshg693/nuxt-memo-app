<template>
  <span>
    <template v-for="(part, index) in parsedResponse" :key="index">
      <NuxtLink
        v-if="part.type === 'link'"
        :to="part.url"
        target="_blank"
        class="text-blue-600 hover:text-blue-800 underline"
      >
        {{ part.text }}
      </NuxtLink>
      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
interface ResponsePart {
  type: 'text' | 'link'
  text: string
  url?: string
}

interface Props {
  response: string
}

const props = defineProps<Props>()

const parsedResponse = computed((): ResponsePart[] => {
  const parts: ResponsePart[] = []
  const text = props.response
  let lastIndex = 0
  
  // Regular expression to match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      if (beforeText) {
        parts.push({ type: 'text', text: beforeText })
      }
    }
    
    // Add the link
    parts.push({
      type: 'link',
      text: match[1], // link text
      url: match[2]   // link URL
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text after the last link
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    if (remainingText) {
      parts.push({ type: 'text', text: remainingText })
    }
  }
  
  // If no links were found, return the entire text as a single part
  if (parts.length === 0) {
    parts.push({ type: 'text', text: text })
  }
  
  return parts
})
</script>