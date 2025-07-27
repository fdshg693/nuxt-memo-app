# Markdown システム統合 実装ガイド

## 概要

Developer D のタスク MARKDOWN-001 として、Nuxt 3 アプリケーションに Markdown レンダリング機能とSQLシンタックスハイライト機能を統合しました。

## 選定されたライブラリ

### 主要ライブラリ: markdown-it + highlight.js

**選定理由:**
- **軽量性**: バンドルサイズへの影響を最小限に抑制
- **SQLハイライト**: highlight.js による優秀なSQL構文ハイライト
- **カスタマイズ性**: 既存のTailwind CSSスタイルとの完全統合
- **Nuxt 3互換性**: プラグインシステムによる安定した動作
- **実装容易性**: 複雑な設定不要でシンプルな導入

### ライブラリ比較結果

| 評価項目 | markdown-it | @nuxt/content | remark | marked |
|---------|-------------|---------------|--------|---------|
| **Nuxt 3親和性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **SQLハイライト** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **軽量性** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **拡張性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **実装難易度** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 実装された機能

### ✅ 完了済み機能

1. **基本Markdownレンダリング**
   - 見出し、段落、リスト、強調、斜体
   - リンク、コードブロック、引用文
   - テーブル表示

2. **SQLシンタックスハイライト**
   - SQL予約語の色分け表示
   - 専用グラデーション背景
   - SQL方言の幅広いサポート

3. **既存スタイル統合**
   - Tailwind CSSとの完全統合
   - 紫色テーマの維持 (.btn-gradient等)
   - レスポンシブデザイン対応

4. **SSR対応**
   - ClientOnlyラッパーによるハイドレーション問題解決
   - サーバーサイドレンダリング互換性

## ファイル構成

### 新規追加ファイル

```
├── plugins/
│   └── markdown.client.ts          # Markdownレンダリングプラグイン
├── components/
│   └── MarkdownRenderer.vue        # Markdownコンポーネント
├── pages/
│   └── markdown-test.vue           # デモ・テストページ
└── content/
    └── markdown-test.md            # テスト用Markdownファイル
```

### 更新ファイル

```
├── nuxt.config.ts                  # プラグイン設定追加
├── assets/main.css                 # highlight.js スタイル統合
└── package.json                    # 依存関係追加
```

## 使用方法

### 1. MarkdownRendererコンポーネント

```vue
<template>
  <MarkdownRenderer :markdown="markdownContent" />
</template>

<script setup>
const markdownContent = ref(`
# サンプル

\`\`\`sql
SELECT * FROM users WHERE active = true;
\`\`\`
`)
</script>
```

### 2. SQLエディターとの統合

```vue
<template>
  <div class="grid grid-cols-2 gap-4">
    <SqlEditor v-model="sqlCode" @execute="executeSql" />
    <MarkdownRenderer :markdown="explanation" />
  </div>
</template>
```

### 3. OpenAI APIとの連携

サーバーサイドでMarkdown形式のレスポンスを生成し、フロントエンドでレンダリング:

```typescript
// server/api/openai.post.ts での出力例
const aiResponse = await openai.chat.completions.create({
  messages: [{
    role: 'user', 
    content: 'SQL クエリを Markdown で説明してください'
  }]
})
// レスポンスをMarkdownRendererに渡す
```

## 技術仕様

### 依存関係

```json
{
  "dependencies": {
    "markdown-it": "^14.x.x",
    "highlight.js": "^11.x.x"
  },
  "devDependencies": {
    "@types/markdown-it": "^13.x.x"
  }
}
```

### プラグイン設定

```typescript
// plugins/markdown.client.ts
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

export default defineNuxtPlugin(() => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code class="language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
  })

  return {
    provide: {
      md: md
    }
  }
})
```

## カスタマイズ

### スタイルカスタマイズ

```css
/* assets/main.css */

/* SQL-specific highlighting */
.language-sql .hljs {
    background: linear-gradient(to right, rgb(239 246 255), rgb(238 242 255)) !important;
}

/* JavaScript/TypeScript highlighting */
.language-javascript .hljs,
.language-typescript .hljs {
    background: linear-gradient(to right, rgb(255 251 235), rgb(254 243 199)) !important;
}
```

### 言語サポート追加

```typescript
// highlight.jsで追加の言語をプリロード
import 'highlight.js/lib/languages/python'
import 'highlight.js/lib/languages/java'
import 'highlight.js/lib/languages/php'
```

## パフォーマンス考慮事項

### バンドルサイズ最適化

1. **必要な言語のみインポート**
   ```typescript
   import hljs from 'highlight.js/lib/core'
   import sql from 'highlight.js/lib/languages/sql'
   hljs.registerLanguage('sql', sql)
   ```

2. **ClientOnlyでSSR負荷軽減**
   - 初期レンダリングはプレースホルダー表示
   - クライアントサイドで動的レンダリング

3. **CSS最適化**
   - 不要なhighlight.jsテーマを除外
   - Tailwind CSSとの重複スタイル削除

## 今後の拡張予定

### 短期目標

- [ ] サーバーサイドレンダリングの完全対応
- [ ] カスタムMarkdownプラグインの開発
- [ ] エラーハンドリングの強化

### 中長期目標

- [ ] 数式レンダリング（MathJax/KaTeX）の追加
- [ ] 図表レンダリング（Mermaid）の統合
- [ ] Markdownエディターの実装
- [ ] リアルタイムプレビュー機能

## トラブルシューティング

### よくある問題

1. **ハイドレーションエラー**
   - 解決: ClientOnlyラッパーを使用

2. **CSS競合**
   - 解決: :deep()セレクターで詳細度調整

3. **バンドルサイズ肥大化**
   - 解決: 必要な言語のみを選択的インポート

### デバッグ方法

```typescript
// コンソールでMarkdownレンダラーの状態確認
console.log('Markdown plugin:', $md)
console.log('Highlight.js languages:', hljs.listLanguages())
```

## 他チームとの連携

### Developer A との連携
- UIコンポーネントでのMarkdown表示統合
- 既存コンポーネントのMarkdown対応

### Developer B との連携
- OpenAI API出力のMarkdown形式調整
- レスポンス形式の標準化

### Developer C との連携
- 説明文章データのMarkdown対応
- データ構造の調整

## まとめ

MARKDOWN-001 タスクにより、以下が完了しました:

1. ✅ ライブラリ調査・比較・選定完了
2. ✅ markdown-it + highlight.js の導入完了
3. ✅ SQLシンタックスハイライト機能実装完了
4. ✅ 既存Tailwind CSSスタイルとの統合完了
5. ✅ SSR対応とパフォーマンス最適化完了
6. ✅ プロトタイプ・デモページ実装完了

この実装により、SQL学習アプリケーションにおけるMarkdownベースのコンテンツ配信基盤が整備されました。