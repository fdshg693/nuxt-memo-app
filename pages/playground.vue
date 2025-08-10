<template>
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8 text-indigo-700">JavaScriptプレイグラウンド</h1>
            
            <!-- Navigation back to home -->
            <div class="mb-6">
                <NuxtLink to="/" class="text-purple-600 hover:text-purple-800 font-medium">
                    ← ホームに戻る
                </NuxtLink>
            </div>

            <!-- JavaScript Editor -->
            <JavaScriptEditor v-model="code" @execute="executeCode" @clear="clearResults" />

            <!-- Results Section -->
            <div v-if="results.length > 0" class="border-2 border-green-400 rounded-lg p-4 mb-6 bg-green-50">
                <h3 class="text-lg font-bold mb-2 text-green-700">実行結果</h3>
                <div v-for="(result, index) in results" :key="index" class="mb-2">
                    <div class="font-mono text-sm bg-white p-2 rounded border border-green-200">
                        {{ result }}
                    </div>
                </div>
            </div>

            <!-- Error Section -->
            <div v-if="error" class="border-2 border-red-400 rounded-lg p-4 mb-6 bg-red-50">
                <h3 class="text-lg font-bold mb-2 text-red-700">エラー</h3>
                <div class="font-mono text-sm bg-white p-2 rounded border border-red-200 text-red-600">
                    {{ error }}
                </div>
            </div>

            <!-- Instructions -->
            <div class="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
                <h3 class="text-lg font-bold mb-2 text-blue-700">使い方</h3>
                <ul class="text-blue-800 space-y-1">
                    <li>• 上のテキストエリアにJavaScriptコードを入力してください</li>
                    <li>• console.log()を使用すると結果が表示されます</li>
                    <li>• 「実行」ボタンでコードを実行します</li>
                    <li>• 「クリア」ボタンで結果をクリアします</li>
                </ul>
                <div class="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                    <h4 class="font-bold text-blue-800 mb-1">例:</h4>
                    <code class="text-blue-700 text-sm">
                        console.log("Hello World!");<br>
                        let x = 5;<br>
                        let y = 10;<br>
                        console.log("x + y =", x + y);
                    </code>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JavaScriptEditor from '~/components/JavaScriptEditor.vue'

// State
const code = ref(`// JavaScriptコードをここに入力してください
console.log("Hello World!");

// 例: 変数と計算
let x = 5;
let y = 10;
console.log("x + y =", x + y);

// 例: 配列操作
let numbers = [1, 2, 3, 4, 5];
console.log("配列:", numbers);
console.log("合計:", numbers.reduce((a, b) => a + b, 0));`)

const results = ref<string[]>([])
const error = ref<string>('')

// Function to execute JavaScript code
const executeCode = () => {
    // Clear previous results and errors
    results.value = []
    error.value = ''
    
    try {
        // Create a custom console.log that captures output
        const originalLog = console.log
        const capturedLogs: string[] = []
        
        // Override console.log temporarily
        console.log = (...args: any[]) => {
            const formattedArgs = args.map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2)
                }
                return String(arg)
            }).join(' ')
            capturedLogs.push(formattedArgs)
        }
        
        // Execute the code
        eval(code.value)
        
        // Restore original console.log
        console.log = originalLog
        
        // Set results
        results.value = capturedLogs
        
        // If no console.log was called, show a message
        if (capturedLogs.length === 0) {
            results.value = ['コードが実行されました（出力はありません）']
        }
        
    } catch (err: any) {
        // Restore original console.log in case of error
        console.log = console.log
        error.value = err.message || 'エラーが発生しました'
    }
}

// Function to clear results
const clearResults = () => {
    results.value = []
    error.value = ''
}

// Set page title
useHead({
    title: 'JavaScriptプレイグラウンド'
})
</script>