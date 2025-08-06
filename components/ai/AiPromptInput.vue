<template>
    <div class="mb-3">
        <textarea 
            v-model="inputText" 
            @input="handleInput"
            placeholder="SQLに関する質問を入力してください（200文字以内）"
            class="w-full border rounded p-2 h-24 resize-none"
            :class="{ 'border-red-500': inputError }"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
            <span v-if="inputError" class="text-red-500 text-sm">{{ inputError }}</span>
            <span class="text-sm text-gray-500 ml-auto">{{ inputText.length }}/200文字</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'validation-change': [isValid: boolean]
}>()

const inputText = ref(props.modelValue)
const inputError = ref('')

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
    inputText.value = newValue
    validateInput()
})

function validateInput() {
    inputError.value = ''
    
    if (inputText.value.length > 200) {
        inputError.value = '200文字以内で入力してください'
        return false
    }
    
    if (inputText.value.trim().length === 0) {
        inputError.value = '質問を入力してください'
        return false
    }
    
    // SQLに関連する質問かどうかの簡易チェック
    const sqlKeywords = ['SQL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'QUERY', 'クエリ', 'テーブル', 'データベース']
    const hasKeyword = sqlKeywords.some(keyword => 
        inputText.value.toUpperCase().includes(keyword.toUpperCase())
    )
    
    if (!hasKeyword) {
        inputError.value = 'SQLに関する質問を入力してください'
        return false
    }
    
    return true
}

function handleInput() {
    emit('update:modelValue', inputText.value)
    const isValid = validateInput()
    emit('validation-change', isValid)
}

// Expose validation function for parent to check
defineExpose({
    validate: validateInput,
    hasError: () => !!inputError.value
})
</script>