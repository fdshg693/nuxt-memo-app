<template>
    <div>
        <h2 class="text-lg font-bold text-purple-700 mb-2">安全なJavaScript実行環境</h2>
        
        <!-- Security Status Indicator -->
        <div class="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center text-sm text-green-700">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-medium">セキュア実行環境:</span>
                <span class="ml-1">iframe sandbox + WebWorker (同一オリジン無効)</span>
            </div>
        </div>
        
        <textarea 
            :value="modelValue" 
            @input="$emit('update:modelValue', ($event.target! as HTMLTextAreaElement).value)"
            rows="10" 
            cols="60" 
            placeholder="ここにJavaScriptコードを入力してください（安全な環境で実行されます）"
            class="w-full border border-purple-200 rounded-lg p-3 mb-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-indigo-50 text-indigo-900"
            :disabled="isExecuting">
        </textarea>
        
        <div class="flex gap-2 mb-6">
            <button 
                @click="executeSecureCode"
                :disabled="isExecuting || !isReady"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 transition shadow disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isExecuting">実行中...</span>
                <span v-else-if="!isReady">初期化中...</span>
                <span v-else>安全実行</span>
            </button>
            
            <button 
                @click="terminateCode"
                :disabled="!isExecuting"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed">
                停止
            </button>
            
            <button 
                @click="clearAll"
                class="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold hover:from-gray-600 hover:to-gray-700 transition shadow">
                クリア
            </button>
        </div>
        
        <!-- Security Features Info -->
        <details class="mb-4">
            <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                🔒 セキュリティ機能の詳細
            </summary>
            <div class="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                <ul class="space-y-1">
                    <li>• iframe sandbox（allow-same-origin無効）による完全な分離</li>
                    <li>• WebWorker内でのコード実行（DOMアクセス不可）</li>
                    <li>• fetch/XMLHttpRequest等のネットワークAPI無効化</li>
                    <li>• 実行時間制限（5秒）とレート制限（1分間10回）</li>
                    <li>• CSPヘッダーによる追加防御</li>
                    <li>• 出力はテキストのみ（HTML挿入不可）</li>
                </ul>
            </div>
        </details>
        
        <!-- Results Display -->
        <div v-if="results.length > 0 || error" class="space-y-4">
            <!-- Results -->
            <div v-if="results.length > 0" class="border-2 border-green-400 rounded-lg p-4 bg-green-50">
                <h3 class="text-lg font-bold mb-2 text-green-700">実行結果</h3>
                <div v-for="(result, index) in results" :key="index" class="mb-2">
                    <div 
                        :class="{
                            'bg-white border-green-200 text-green-800': result.type === 'log',
                            'bg-red-50 border-red-200 text-red-600': result.type === 'error',
                            'bg-yellow-50 border-yellow-200 text-yellow-700': result.type === 'warn'
                        }"
                        class="font-mono text-sm p-2 rounded border">
                        <span class="text-xs opacity-75 mr-2">[{{ result.type }}]</span>
                        <!-- Using textContent equivalent for security -->
                        {{ result.args }}
                    </div>
                </div>
            </div>
            
            <!-- Errors -->
            <div v-if="error" class="border-2 border-red-400 rounded-lg p-4 bg-red-50">
                <h3 class="text-lg font-bold mb-2 text-red-700">エラー</h3>
                <div class="font-mono text-sm bg-white p-2 rounded border border-red-200 text-red-600">
                    {{ error }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSecureJavaScriptExecution } from '~/composables/useSecureJavaScriptExecution'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

const {
    isReady,
    isExecuting,
    results,
    error,
    executeCode,
    terminateExecution,
    clearResults,
    initializeSandbox
} = useSecureJavaScriptExecution()

const executeSecureCode = async () => {
    await executeCode(props.modelValue)
}

const terminateCode = () => {
    terminateExecution()
}

const clearAll = () => {
    clearResults()
}

// Initialize sandbox on component mount
onMounted(async () => {
    try {
        await initializeSandbox()
    } catch (err) {
        console.error('Failed to initialize sandbox:', err)
    }
})
</script>