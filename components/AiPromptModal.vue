<template>
    <div>
        <button @click="openPromptModal" :disabled="isAiLoading" :class="['px-6 py-2 rounded-lg font-bold transition shadow',
            isAiLoading
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600']">
            <span v-if="isAiLoading">AIに質問中...</span>
            <span v-else>AIに質問</span>
        </button>
        <div v-if="showPromptModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 class="text-lg font-bold mb-2">AIアクション</h3>
                <select v-model="customPrompt" class="w-full border rounded p-2 mb-2">
                    <option v-for="option in promptOptions" :key="option.display" :value="option.customPrompt">
                        {{ option.display }}
                    </option>
                </select>
                <div class="flex justify-end gap-2">
                    <button @click="showPromptModal = false" class="px-4 py-2 rounded bg-gray-200">キャンセル</button>
                    <button @click="sendPrompt" :disabled="isAiLoading"
                        :class="['px-4 py-2 rounded', isAiLoading ? 'bg-gray-400 text-white cursor-not-allowed opacity-70' : 'bg-purple-500 text-white']">
                        <span v-if="isAiLoading">送信中...</span>
                        <span v-else>送信</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
const props = defineProps<{ isAiLoading?: boolean }>()
const emit = defineEmits(['ask-ai'])

const showPromptModal = ref(false)
const customPrompt = ref('確認')
const promptOptions = [
    { display: '確認', customPrompt: '私のクエリが正しいか確認して。確認したら、詳細に説明をしてください' },
    { display: 'ヒント', customPrompt: 'ヒントを教えてください。ただし、絶対に答えは教えないでください' },
    { display: '改善', customPrompt: 'このSQLの改善点を教えて。具体的な提案は含めず、関連する情報を提供してください' },
    { display: 'パフォーマンス向上', customPrompt: 'このSQLのパフォーマンスを向上させる方法は？具体的な方法をいくつか教えてください' },
    { display: 'SQL説明', customPrompt: 'このSQLの意図を分かりやすい日本語で説明して' }
]

function openPromptModal() {
    showPromptModal.value = true
}
function sendPrompt() {
    emit('ask-ai', customPrompt.value)
    showPromptModal.value = false
}

// 親からモーダル制御したい場合はprops/watchで拡張可
</script>
