<template>
    <div>
        <h2 class="text-lg font-bold text-purple-700 mb-2">SQLを実行する</h2>
        <textarea :value="modelValue" @input="$emit('update:modelValue', ($event.target! as HTMLTextAreaElement).value)"
            rows="5" cols="60" placeholder="ここにSQLを入力"
            class="w-full border border-purple-200 rounded-lg p-3 mb-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-indigo-50 text-indigo-900"></textarea>
        <div class="flex gap-2 mb-6">
            <button @click="$emit('execute')"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 transition shadow">
                実行
            </button>
            <AiPromptModal v-if="props.showAiPromptModal !== false" :isAiLoading="isAiLoading"
                @ask-ai="emit('ask-ai', $event)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AiPromptModal from './AiPromptModal.vue'
const props = defineProps<{ modelValue: string, isAiLoading?: boolean, showAiPromptModal?: boolean }>()
const emit = defineEmits(['update:modelValue', 'execute', 'ask-ai'])
</script>
