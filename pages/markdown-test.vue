<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
      Markdown システム統合テスト
    </h1>
    
    <!-- Static markdown content demo -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-purple-700 mb-4">静的Markdownコンテンツ</h2>
      <MarkdownRenderer :markdown="staticMarkdown" />
    </div>

    <!-- Live Markdown rendering test -->
    <div class="border-t border-purple-200 pt-8">
      <h2 class="text-2xl font-bold text-purple-700 mb-4">ライブMarkdown レンダリングテスト</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Input -->
        <div>
          <h3 class="text-lg font-semibold text-purple-600 mb-2">Markdown入力</h3>
          <textarea 
            v-model="markdownInput" 
            rows="12"
            class="w-full border border-purple-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-indigo-50 text-indigo-900"
            placeholder="ここにMarkdownを入力してください..."
          ></textarea>
        </div>
        
        <!-- Output -->
        <div>
          <h3 class="text-lg font-semibold text-purple-600 mb-2">レンダリング結果</h3>
          <div class="border border-purple-200 rounded-lg p-3 bg-white min-h-[300px]">
            <MarkdownRenderer :markdown="markdownInput" />
          </div>
        </div>
      </div>
    </div>

    <!-- SQL Editor Integration Demo -->
    <div class="border-t border-purple-200 pt-8 mt-8">
      <h2 class="text-2xl font-bold text-purple-700 mb-4">SQL Editor 統合デモ</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-semibold text-purple-600 mb-2">SQL入力</h3>
          <SqlEditor 
            v-model="sqlInput" 
            :showAiPromptModal="false" 
            @execute="executeSql"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-purple-600 mb-2">SQL説明 (Markdown)</h3>
          <div class="border border-purple-200 rounded-lg p-3 bg-white min-h-[200px]">
            <MarkdownRenderer :markdown="sqlExplanation" />
          </div>
        </div>
      </div>
    </div>

    <!-- Library comparison results -->
    <div class="border-t border-purple-200 pt-8 mt-8">
      <h2 class="text-2xl font-bold text-purple-700 mb-4">ライブラリ選定結果</h2>
      <MarkdownRenderer :markdown="libraryComparison" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Static markdown content for demo
const staticMarkdown = ref(`# Markdown Integration Test

This page demonstrates the Markdown rendering capabilities with SQL syntax highlighting.

## Basic Markdown Features

**Bold text** and *italic text* work correctly.

### Lists

- First item
- Second item  
- Third item

### Code Examples

Here's some inline \`code\` example.

## SQL Syntax Highlighting Test

\`\`\`sql
SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at >= '2024-01-01'
GROUP BY users.id, users.name
HAVING COUNT(orders.id) > 5
ORDER BY order_count DESC;
\`\`\`

## JavaScript Example

\`\`\`javascript
const result = await fetch('/api/data')
const data = await result.json()
console.log(data)
\`\`\`

> **注意**: このMarkdownレンダリングは既存のTailwind CSSスタイルと統合されています。`)

// Sample markdown input for testing
const markdownInput = ref(`# SQLサンプル

以下はユーザーテーブルから情報を取得するクエリです：

\`\`\`sql
SELECT id, name, email 
FROM users 
WHERE created_at >= '2024-01-01'
ORDER BY name ASC;
\`\`\`

## 説明

- **SELECT**: 取得したい列を指定
- **FROM**: 対象テーブルを指定
- **WHERE**: 条件を指定
- **ORDER BY**: 並び順を指定`)

const sqlInput = ref(`SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at >= '2024-01-01'
GROUP BY users.id, users.name
HAVING COUNT(orders.id) > 5
ORDER BY order_count DESC;`)

const sqlExplanation = ref(`# このSQLクエリの説明

このクエリは**ユーザーの注文数を集計**しています。

## 主要な構成要素

1. **JOIN操作**: \`LEFT JOIN\`でユーザーと注文を結合
2. **条件絞り込み**: 2024年以降に作成されたユーザーのみ
3. **集計**: \`COUNT()\`で注文数をカウント
4. **グループ化**: ユーザーごとに集計
5. **絞り込み**: 5件より多い注文があるユーザーのみ

\`\`\`sql
-- 結果例
name        | order_count
------------|------------
田中太郎     | 8
佐藤花子     | 6
\`\`\``)

const libraryComparison = ref(`# Markdownライブラリ選定結果

## 選定されたライブラリ: markdown-it + highlight.js

### 選定理由

| 評価項目 | markdown-it | @nuxt/content | remark | marked |
|---------|-------------|---------------|--------|---------|
| **Nuxt 3親和性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **SQLハイライト** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **軽量性** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **拡張性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **実装難易度** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 実装済み機能

- ✅ 基本的なMarkdown→HTMLレンダリング
- ✅ SQLシンタックスハイライト  
- ✅ 既存Tailwind CSSとの統合
- ✅ クライアントサイドレンダリング
- ✅ 既存スタイル（.btn-gradient等）との調和

### 今後の拡張予定

- [ ] サーバーサイドレンダリング対応の最適化
- [ ] カスタムMarkdownプラグインの開発
- [ ] 数式レンダリング（MathJax/KaTeX）の追加
- [ ] 図表レンダリング（Mermaid）の統合`)

function executeSql() {
  console.log('SQL executed:', sqlInput.value)
  // SQL execution logic would go here
}

// Meta tags
useHead({
  title: 'Markdown システム統合テスト',
  meta: [
    { name: 'description', content: 'markdown-it + highlight.js によるMarkdown統合テスト' }
  ]
})
</script>

<style scoped>
/* Custom styles for the test page */
</style>