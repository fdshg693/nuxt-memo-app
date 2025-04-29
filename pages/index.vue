<!-- pages/index.vue -->
<template>
    <main class="max-w-md mx-auto mt-10 p-4">
      <h1 class="text-2xl mb-4">シンプルメモ帳</h1>
      <form @submit.prevent="onAdd">
        <input
          v-model="newText"
          type="text"
          placeholder="メモを入力"
          class="w-full p-2 border rounded"
        />
        <button type="submit" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">追加</button>
      </form>
  
      <div class="mt-6 border rounded">
        <NoteItem
          v-for="note in notes"
          :key="note.id"
          :note="note"
          @delete="removeNote"
        />
        <p v-if="!notes.length" class="p-4 text-gray-500">メモがありません</p>
      </div>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useNotes } from '~/composables/useNotes'
  import NoteItem from '~/components/NoteItem.vue'
  
  const { notes, addNote, removeNote } = useNotes()
  const newText = ref('')
  
  const onAdd = () => {
    addNote(newText.value)
    newText.value = ''
  }
  </script>
  
  <style scoped>
  /* お好みで TailwindCSS や自分でスタイルを当ててください */
  </style>
  