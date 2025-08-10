<template>
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8 text-indigo-700">安全なJavaScriptプレイグラウンド</h1>
            
            <!-- Navigation back to home -->
            <div class="mb-6">
                <NuxtLink to="/" class="text-purple-600 hover:text-purple-800 font-medium">
                    ← ホームに戻る
                </NuxtLink>
            </div>

            <!-- Security Notice -->
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 class="text-lg font-bold mb-2 text-blue-700">🔒 セキュリティ強化済み</h3>
                <p class="text-blue-800 text-sm">
                    このプレイグラウンドは厳格なセキュリティ対策を実装しており、コードは完全に隔離された環境で実行されます。
                    ネットワークアクセス、DOM操作、危険なAPIは全て無効化されています。
                </p>
            </div>

            <!-- Secure JavaScript Editor -->
            <SecureJavaScriptEditor v-model="code" />

            <!-- Instructions -->
            <div class="border-2 border-blue-400 rounded-lg p-4 bg-blue-50">
                <h3 class="text-lg font-bold mb-2 text-blue-700">使い方</h3>
                <ul class="text-blue-800 space-y-1">
                    <li>• 上のテキストエリアにJavaScriptコードを入力してください</li>
                    <li>• console.log()を使用すると結果が表示されます</li>
                    <li>• 「安全実行」ボタンでコードを実行します（最大5秒、1分間10回制限）</li>
                    <li>• 「停止」ボタンで実行中のコードを強制終了できます</li>
                    <li>• 「クリア」ボタンで結果をクリアします</li>
                </ul>
                <div class="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                    <h4 class="font-bold text-blue-800 mb-1">安全な例:</h4>
                    <code class="text-blue-700 text-sm block whitespace-pre-line">console.log("Hello World!");

// 変数と計算
let x = 5;
let y = 10;
console.log("x + y =", x + y);

// 配列操作
let numbers = [1, 2, 3, 4, 5];
console.log("配列:", numbers);
console.log("合計:", numbers.reduce((a, b) => a + b, 0));</code>
                </div>
                
                <div class="mt-3 p-3 bg-red-100 rounded border border-red-300">
                    <h4 class="font-bold text-red-800 mb-1">ブロックされる危険な操作:</h4>
                    <code class="text-red-700 text-sm block whitespace-pre-line">// これらは全てブロックされます：
fetch('https://example.com');  // ネットワークアクセス
document.body;                 // DOM操作
window.location;              // ブラウザ操作
XMLHttpRequest();             // HTTP通信
WebSocket();                  // リアルタイム通信</code>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SecureJavaScriptEditor from '~/components/SecureJavaScriptEditor.vue'

// Safe default code that demonstrates functionality
const code = ref(`// 安全なJavaScriptコードの例
console.log("🔒 セキュア実行環境へようこそ！");

// 基本的な変数と計算
let greeting = "Hello";
let target = "World";
console.log(greeting + " " + target + "!");

// 配列操作の例
let fruits = ["りんご", "バナナ", "オレンジ"];
console.log("果物リスト:", fruits);

fruits.forEach((fruit, index) => {
    console.log(\`\${index + 1}. \${fruit}\`);
});

// オブジェクト操作の例
let person = {
    name: "太郎",
    age: 25,
    city: "東京"
};

console.log("人物情報:", person);
console.log(\`\${person.name}さんは\${person.age}歳で、\${person.city}に住んでいます。\`);

// 数学的計算
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let sum = numbers.reduce((acc, num) => acc + num, 0);
let average = sum / numbers.length;

console.log("数値:", numbers);
console.log("合計:", sum);
console.log("平均:", average);`)

// Set page title
useHead({
    title: '安全なJavaScriptプレイグラウンド - セキュア実行環境'
})
</script>