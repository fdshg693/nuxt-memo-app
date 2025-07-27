<template>
    <div>
        <button @click="openPromptModal" :disabled="isAiLoading" :class="['px-6 py-2 rounded-lg font-bold transition shadow',
            isAiLoading
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600']"
            :aria-label="isAiLoading ? 'AIに質問中です' : 'AIに質問する'">
            <span v-if="isAiLoading">AIに質問中...</span>
            <span v-else>AIに質問</span>
        </button>
        
        <!-- Enhanced Modal with free text input and template system -->
        <div v-if="showPromptModal" 
             class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
             @click="handleBackdropClick"
             role="dialog"
             aria-modal="true"
             aria-labelledby="modal-title">
            <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                 @click.stop
                 ref="modalRef">
                
                <!-- Modal Header -->
                <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4">
                    <div class="flex justify-between items-center">
                        <h3 id="modal-title" class="text-xl font-bold">AI アシスタント</h3>
                        <button @click="closeModal" 
                                class="text-white hover:text-gray-200 transition-colors"
                                aria-label="モーダルを閉じる">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    
                    <!-- Template Selection Section -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            質問テンプレート
                        </label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                            <button v-for="option in promptOptions" 
                                    :key="option.display"
                                    @click="selectTemplate(option)"
                                    :class="['btn-sql-question text-sm py-2 px-3 transition-all',
                                             selectedTemplate?.display === option.display 
                                                ? 'bg-purple-200 border-purple-400 border-2' 
                                                : 'hover:bg-purple-150']"
                                    :aria-pressed="selectedTemplate?.display === option.display">
                                {{ option.display }}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Free Text Input Section -->
                    <div class="mb-6">
                        <label for="custom-prompt" class="block text-sm font-medium text-gray-700 mb-2">
                            質問内容 <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="custom-prompt"
                            v-model="customPrompt" 
                            placeholder="AIに質問したい内容を自由に入力してください..."
                            class="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            rows="4"
                            required
                            :aria-describedby="customPrompt.length > 500 ? 'char-warning' : undefined"
                            @keydown="handleKeyDown"></textarea>
                        <div class="flex justify-between mt-2">
                            <div class="text-xs text-gray-500">
                                テンプレートを選択するか、自由に質問を入力してください
                            </div>
                            <div :class="['text-xs', customPrompt.length > 500 ? 'text-red-500' : 'text-gray-400']">
                                {{ customPrompt.length }}/1000
                            </div>
                        </div>
                        <div v-if="customPrompt.length > 500" id="char-warning" class="text-xs text-red-500 mt-1">
                            ⚠️ 長すぎる質問は回答の質が下がる可能性があります
                        </div>
                    </div>
                    
                    <!-- SQL Context Help Section -->
                    <div v-if="sqlHelp.length > 0" class="mb-6">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 class="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                                </svg>
                                関連するSQL知識
                            </h4>
                            <div class="space-y-2">
                                <div v-for="help in sqlHelp.slice(0, 3)" :key="help.keyword" 
                                     class="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                    <span class="font-medium">{{ help.title }}:</span> {{ help.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Modal Footer -->
                <div class="border-t bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
                    <button @click="closeModal" 
                            class="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors order-2 sm:order-1">
                        キャンセル
                    </button>
                    <button @click="sendPrompt" 
                            :disabled="isAiLoading || !customPrompt.trim()"
                            :class="['px-6 py-2 rounded-lg font-medium transition-all order-1 sm:order-2',
                                     isAiLoading || !customPrompt.trim()
                                        ? 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105']"
                            :aria-label="isAiLoading ? 'AI に送信中です' : 'AI に質問を送信する'">
                        <span v-if="isAiLoading" class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            送信中...
                        </span>
                        <span v-else>質問を送信</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import sqlExplanations from '@/data/sqlExplanation/sqlExplanation.json'

// Props and Emits
const props = defineProps<{ 
    isAiLoading?: boolean;
    sqlContext?: string; // Current SQL being worked on for context
}>()
const emit = defineEmits(['ask-ai'])

// Reactive state
const showPromptModal = ref(false)
const customPrompt = ref('')
const selectedTemplate = ref<any>(null)
const modalRef = ref<HTMLElement>()

// Enhanced prompt options with better descriptions
const promptOptions = [
    { 
        display: '確認', 
        customPrompt: '私のSQLクエリが正しいか確認してください。もし間違いがあれば、具体的にどこが問題なのか教えてください。',
        category: 'validation'
    },
    { 
        display: 'ヒント', 
        customPrompt: 'このSQL問題を解くためのヒントを教えてください。答えは教えずに、考え方や手順を示してください。',
        category: 'guidance'
    },
    { 
        display: '改善', 
        customPrompt: 'このSQLをより良くする方法を教えてください。パフォーマンス、可読性、保守性の観点から改善点を提案してください。',
        category: 'optimization'
    },
    { 
        display: 'パフォーマンス', 
        customPrompt: 'このSQLクエリのパフォーマンスを向上させる具体的な方法を教えてください。インデックスの使用やクエリの最適化について説明してください。',
        category: 'performance'
    },
    { 
        display: '説明', 
        customPrompt: 'このSQLクエリの動作を初心者にも分かりやすく日本語で説明してください。各部分が何をしているのか詳しく教えてください。',
        category: 'explanation'
    },
    {
        display: 'カスタム',
        customPrompt: '',
        category: 'custom'
    }
]

// SQL context help - show relevant explanations based on current context
const sqlHelp = computed(() => {
    if (!props.sqlContext) return []
    
    const context = props.sqlContext.toLowerCase()
    return sqlExplanations.filter(explanation => 
        context.includes(explanation.keyword.toLowerCase())
    )
})

// Methods
function openPromptModal() {
    showPromptModal.value = true
    // Reset to default state
    selectedTemplate.value = null
    customPrompt.value = ''
    
    nextTick(() => {
        // Focus on the textarea when modal opens
        const textarea = modalRef.value?.querySelector('textarea')
        if (textarea) {
            textarea.focus()
        }
    })
}

function closeModal() {
    showPromptModal.value = false
    selectedTemplate.value = null
    customPrompt.value = ''
}

function selectTemplate(option: any) {
    selectedTemplate.value = option
    if (option.customPrompt) {
        customPrompt.value = option.customPrompt
    }
    
    // Focus on textarea after template selection
    nextTick(() => {
        const textarea = modalRef.value?.querySelector('textarea')
        if (textarea) {
            textarea.focus()
            // Position cursor at end
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
    })
}

function sendPrompt() {
    if (!customPrompt.value.trim()) return
    
    emit('ask-ai', customPrompt.value.trim())
    closeModal()
}

function handleBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
        closeModal()
    }
}

function handleKeyDown(event: KeyboardEvent) {
    // Ctrl/Cmd + Enter to send
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        sendPrompt()
    }
    // Escape to close
    if (event.key === 'Escape') {
        closeModal()
    }
}

// Accessibility: Handle escape key globally when modal is open
function handleGlobalKeyDown(event: KeyboardEvent) {
    if (showPromptModal.value && event.key === 'Escape') {
        closeModal()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>
