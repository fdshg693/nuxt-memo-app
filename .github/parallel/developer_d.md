# Developer D - Markdownシステム・ライブラリ統合

## Day 1-2の担当タスク: MARKDOWN-001 完了 (ライブラリ調査・導入)

### 主要責任範囲
- Markdownレンダリングライブラリの調査・選定・導入
- SQLコードハイライト機能の技術検証
- 既存システムとの統合方針策定

### Day 1-2 具体的作業内容

#### 1. Markdownライブラリ調査・比較 (Day 1 午前)
- **候補ライブラリ比較検証**:
  - `@nuxt/content` - Nuxt公式のコンテンツ管理モジュール
  - `markdown-it` - 軽量なMarkdownパーサー
  - `remark` - プラグイン生態系が豊富
  - `marked` - シンプルで高速
- パフォーマンス、機能、Nuxt 3との親和性を総合評価

#### 2. 技術検証・プロトタイプ作成 (Day 1 午後)
- 選定ライブラリの動作検証
- SQLシンタックスハイライト連携確認
- 既存Tailwind CSSスタイルとの整合性検証
- サーバーサイドレンダリング(SSR)対応確認

#### 3. 導入・設定・基盤整備 (Day 2)
- 選定ライブラリのプロジェクトへの導入
- `nuxt.config.ts` の設定調整
- 基本的なMarkdown→HTMLレンダリング環境構築
- プラグイン・モジュール設定の最適化

### 技術調査項目

#### ライブラリ比較評価基準
| 評価項目 | @nuxt/content | markdown-it | remark | marked |
|---------|--------------|-------------|--------|---------|
| Nuxt 3親和性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| SQLハイライト | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 軽量性 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 拡張性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| メンテナンス性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

#### SQLハイライト統合検証
- **highlight.js** - 豊富なSQL方言サポート
- **prism.js** - 軽量でカスタマイズ性が高い
- **shiki** - VSCodeと同等のハイライト品質
- カスタムCSSテーマとの統合可能性

### 参照すべきファイル
- `/nuxt.config.ts` - 現在のモジュール設定
- `/assets/main.css` - 既存スタイル定義
- `/components/SqlEditor.vue` - SQL表示対象コンポーネント
- `/server/api/openai.post.ts` - Markdown出力元

### 技術要件
- **Nuxt 3互換性**: モジュールがNuxt 3で正常動作
- **SSR対応**: サーバーサイドレンダリング時の問題回避
- **パフォーマンス**: ページ読み込み速度への影響最小化
- **カスタマイズ性**: Tailwind CSSとの統合

### 導入設定例

#### nuxt.config.ts設定
```typescript
export default defineNuxtConfig({
  modules: [
    // 選定されたMarkdownモジュール
    '@nuxt/content', // または選定ライブラリ
  ],
  
  // Markdownライブラリ固有設定
  content: {
    highlight: {
      // SQLハイライト設定
      theme: 'github-dark',
      preload: ['sql', 'javascript', 'typescript']
    }
  },
  
  // CSS設定調整
  css: [
    '~/assets/main.css',
    // Markdownスタイル用CSS追加予定
  ]
})
```

#### プラグイン設定例
```typescript
// plugins/markdown.client.ts
export default defineNuxtPlugin(() => {
  // クライアントサイド専用のMarkdown設定
})
```

### 成果物
1. **ライブラリ調査レポート** - 比較評価結果と選定理由
2. **導入済み環境** - Markdownレンダリング可能な開発環境
3. **基本設定ファイル** - `nuxt.config.ts`等の設定
4. **技術ドキュメント** - 導入手順と使用方法のガイド
5. **プロトタイプ** - 基本的なMarkdown表示のデモ

### 他チームとの連携ポイント
- **Developer A**: UIコンポーネントでのMarkdown表示連携
- **Developer B**: OpenAI API出力のMarkdown形式調整
- **Developer C**: 説明文章データのMarkdown対応

### 推奨選定方針
1. **第一候補**: `@nuxt/content` - Nuxt公式で最も統合しやすい
2. **第二候補**: `markdown-it` + `highlight.js` - 軽量で高機能
3. **第三候補**: `marked` + `prism.js` - 最軽量構成

### 優先順位
1. **高**: ライブラリ選定・導入・基本設定完了
2. **中**: SQLハイライト機能の動作確認
3. **中**: 既存スタイルとの統合確認
4. **低**: 高度なMarkdown機能（数式、図表等）

### 注意事項
- バンドルサイズへの影響を最小限に抑制
- 既存の`.btn-gradient`等のスタイルとの競合回避
- サーバーサイドレンダリング時のハイドレーションエラー防止
- 後から他のライブラリに変更可能な疎結合設計
