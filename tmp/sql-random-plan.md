# `sql/random` ランダム問題出題 機能 実装方針

## 1. 要求整理
- ルート: `/sql/random`
- 画面表示: 既存の SQL 問題( `sqlQuestions.json` ) の中からランダムに1問を表示
- 「前へ」「次へ」ボタンは不要（既存 `SqlQuestionContent` のナビゲーション要素を抑制）
- 代わりに「リフレッシュ」ボタン（例: 再抽選 / もう一問ボタン）を配置
- リフレッシュ押下時: 直前に表示した問題と異なる ID の問題を再度ランダム選択
- 同じセッション中の履歴は1件前のみ差し替え禁止で OK（多段履歴は不要）
- 既存の回答 / 実行 / AI 補助パネルはそのまま利用可能に（`currentQA` 構造を再利用）
- テーブルコピー処理、AI 呼び出し、回答チェックロジックも共通利用

## 2. 実装アプローチ概要
1. 新規ページ `pages/sql/random.vue` を追加
2. 既存 `pages/sql/[[id]].vue` から共通化できるロジックを最小限抜粋
   - 質問ロード: `useSqlQuiz()` の `loadQuestions`
   - DB ロード: `useSqlDb()` の `loadDatabases`
   - State: `useSqlQuestionState()` 再利用 (index を実際の question.id として利用／ルートパラメータ同期は不要)
   - 実行系: `useSqlExecution()` 再利用
3. ランダム選択: `pickRandomQuestion(excludeId?: number)` ヘルパーをページ内実装 or composable 化
4. 「リフレッシュ」ボタン押下時のフロー:
   - `resetSqlAndAi()` で状態リセット
   - 新しい question を選択 (`question.id !== previousId`)
   - `currentQA` を再構築（`[[id]].vue` の `setCurrentQA()` 相当ロジックを関数化）
   - 対応 DB テーブルコピー (`createUserCopyTables`, `createAnswerCopyTables`)
5. 読み込みスピナーは `[[id]].vue` を簡略化したものを踏襲
6. ナビゲーション部品 `SqlQuestionContent` を使う場合: コンポーネント内 `v-if` で prev/next のボタン領域を非表示にする props を追加するか、別の軽量表示を新規作成
   - シンプルにするため: 既存 `SqlQuestionContent` に `:hide-navigation="true"` のような boolean props を追加する案
   - 変更影響を限定したい場合は Random 専用の軽量質問表示コンポーネントを新規作成 (例: `SqlRandomQuestionContent.vue`)
   - 今回は最小変更方針として Props 追加案を採用

## 3. 変更詳細
### 3.1 新規ページ: `pages/sql/random.vue`
役割:
- 初期ロード (questions, databases, progress)
- ランダム問題選択・表示
- リフレッシュボタン UI
- 既存 AI / Execution / Analysis パネル統合

### 3.2 既存コンポーネント改修: `components/sql/SqlQuestionContent.vue`
追加 Props (例):
```ts
props: {
  hideNavigation: { type: Boolean, default: false }
}
```
Template 内の Prev/Next ボタン表示条件を `!hideNavigation` でガード

### 3.3 ランダム選択ロジック
```ts
function pickRandomQuestion(excludeId?: number) {
  if (questions.value.length === 0) return null;
  if (questions.value.length === 1) return questions.value[0];
  let candidate; 
  do {
    candidate = questions.value[Math.floor(Math.random() * questions.value.length)];
  } while (excludeId && candidate.id === excludeId);
  return candidate;
}
```

### 3.4 currentQA 設定ヘルパー
`[[id]].vue` の `setCurrentQA()` を参考にページ内で再構築。重複が気になる場合は `useSqlQuestionMapper(question)` のような小 composable 化も将来検討。

### 3.5 状態管理
- `index.value` には選択中問題 ID をそのまま保存（ルーティング同期不要）
- ランダム再抽選で `index.value` 更新 → watch でテーブル再作成
- 進捗記録ロジック（正解時 `recordCorrectAnswer`）は既存と同様

### 3.6 Edge Cases
- JSON 読み込み失敗: ローディング解除 & エラーメッセージ表示
- 問題 0 件: 「問題がありません」表示 ( `setNoQuestion()` 再利用 )
- 問題 1 件: リフレッシュしても同じ問題しかない → ボタン disabled or トースト表示（今回は disabled にする）
- 連続クリック防止: リフレッシュ中はボタン disabled

### 3.7 UI (案)
- Container: 既存と同じグラデ背景
- Header: `SqlQuestionHeader` 利用（ジャンルなど表示）
- Question: `SqlQuestionContent` ( `hide-navigation` )
- Refresh ボタン: 上部 or 質問下部に配置: 
```html
<button @click="refreshQuestion" :disabled="isRefreshing || singleQuestion" class="bg-indigo-600 ...">他の問題を出題</button>
```

### 3.8 テスト観点 (手動 + 将来自動)
- 初回表示でランダム1問が表示される
- リフレッシュで別 ID になる (2問以上あるデータセット時)
- 1問しか無い場合: ボタン disabled
- 正解チェックが従来同様に動く
- AI 補助が従来同様に動く

### 3.9 将来拡張余地
- 出題履歴リスト / 戻る
- ジャンルフィルタ (query param / local state)
- 「未正解のみ」からランダム抽出 (ログインユーザー向け)
- 連続出題の偏りを避ける weighted ランダム

## 4. 作業ステップ
1. `SqlQuestionContent.vue` に `hideNavigation` props 追加
2. 新規ページ `random.vue` 追加 & ロジック実装
3. ランダム選択 / リフレッシュ処理実装
4. 動作確認 (npm run dev)
5. 1問ケースと複数ケース確認

## 5. 簡易擬似コード（`random.vue`）
```ts
onMounted(async () => {
  await loadQuestions();
  await loadDatabases();
  if (isLoggedIn.value) await loadProgressFromServer();
  pickAndSetRandom();
});

function pickAndSetRandom() {
  const q = pickRandomQuestion(index.value || undefined);
  if (!q) { setNoQuestion(); return; }
  mapQuestionToCurrentQA(q);
  index.value = q.id;
  resetSqlAndAi();
  createUserCopyTables(currentQA.value.dbs);
  createAnswerCopyTables(currentQA.value.dbs);
}

function refreshQuestion() { if (isRefreshing.value) return; isRefreshing.value = true; pickAndSetRandom(); isRefreshing.value = false; }
```

## 6. 依存影響
- 既存ルートへの副作用なし
- `SqlQuestionContent` への props 追加のみ (後方互換: default false)

## 7. 完了条件
- `/sql/random` にアクセスするとランダム問題1問表示
- 「他の問題を出題」ボタンで直前と異なる問題が表示される (問題総数 > 1)
- 前へ/次への UI が表示されない

-- End of Plan --
