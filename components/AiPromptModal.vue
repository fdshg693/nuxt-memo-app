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
            <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
                <h3 class="text-lg font-bold mb-2">AIアクション</h3>

                <!-- 入力タイプ選択 -->
                <div class="mb-3">
                    <label class="inline-flex items-center mr-4">
                        <input type="radio" v-model="inputType" value="dropdown" class="text-purple-600">
                        <span class="ml-2">プリセット選択</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" v-model="inputType" value="text" class="text-purple-600">
                        <span class="ml-2">自由入力</span>
                    </label>
                </div>

                <!-- プリセット選択 -->
                <AiPromptSelector v-if="inputType === 'dropdown'" v-model="customPrompt" />

                <!-- 自由入力 -->
                <AiPromptInput v-if="inputType === 'text'" v-model="userInput"
                    @validation-change="handleValidationChange" ref="promptInputRef" />

                <div class="flex justify-end gap-2">
                    <button @click="showPromptModal = false" class="px-4 py-2 rounded bg-gray-200">キャンセル</button>
                    <button @click="sendPrompt" :disabled="isAiLoading || hasInputError"
                        :class="['px-4 py-2 rounded', isAiLoading || hasInputError ? 'bg-gray-400 text-white cursor-not-allowed opacity-70' : 'bg-purple-500 text-white']">
                        <span v-if="isAiLoading">送信中...</span>
                        <span v-else>送信</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps } from 'vue'
import AiPromptSelector from './ai/AiPromptSelector.vue'
import AiPromptInput from './ai/AiPromptInput.vue'
import { promptOptions } from './ai/constants/aiPromptOptions'

const props = defineProps<{ isAiLoading?: boolean }>()
const emit = defineEmits(['ask-ai'])

const showPromptModal = ref(false)
const inputType = ref('dropdown')
const customPrompt = ref(promptOptions[0].customPrompt) // Initialize with first option's prompt
const userInput = ref('')
const hasInputError = ref(false)
const promptInputRef = ref()

function handleValidationChange(isValid: boolean) {
    hasInputError.value = !isValid
}

function openPromptModal() {
    showPromptModal.value = true
    hasInputError.value = false
    userInput.value = ''
}

function sendPrompt() {
    let promptToSend = ''

    if (inputType.value === 'dropdown') {
        promptToSend = customPrompt.value
    } else {
        // Validate input before sending
        if (promptInputRef.value && promptInputRef.value.hasError()) {
            return
        }
        promptToSend = userInput.value.trim()
    }

    emit('ask-ai', promptToSend)
    showPromptModal.value = false
}

// 親からモーダル制御したい場合はprops/watchで拡張可
</script>
