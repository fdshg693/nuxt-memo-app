// composables/useNotes.ts
import { ref, watch, onMounted } from 'vue'

interface Note {
  id: number
  text: string
}

export function useNotes() {
  // 初期値は localStorage から読み込み、なければ空配列
  const notes = ref<Note[]>([])

    onMounted(() => {
        const raw = localStorage.getItem('notes') || '[]'
        notes.value = JSON.parse(raw)
    })

  // notes が変化したら localStorage に保存
  watch(notes, (newVal) => {
    localStorage.setItem('notes', JSON.stringify(newVal))
  }, { deep: true })

  const addNote = (text: string) => {
    if (!text.trim()) return
    notes.value.push({ id: Date.now(), text })
  }

  const removeNote = (id: number) => {
    notes.value = notes.value.filter(n => n.id !== id)
  }

  return { notes, addNote, removeNote }
}
