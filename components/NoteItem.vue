<!-- components/NoteItem.vue -->
<template>
    <div class="flex items-center justify-between p-2 border-b">
      <p class="flex-1">{{ note.text }}</p>
      <button @click="emit('delete', note.id)" class="ml-4 text-red-500">
        削除
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  // Props の型定義
  const props = defineProps<{
    note: { id: number; text: string }
  }>()
  
  // 'delete' イベントを定義
  const emit = defineEmits<{
    (e: 'delete', id: number): void
  }>()
  </script>
  