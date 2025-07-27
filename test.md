# Playwright テストケース - Nuxt Memo App

このドキュメントには、テスターが画面を操作して実行すべきテストケースを記載しています。
Playwrightを使用した手動テストの手順書として使用してください。

**注意:** ログインとジャンケン機能は認証の問題により、現在テスト対象外としています。

## テスト環境

- ベースURL: `http://localhost:3000`
- 対象ブラウザ: Chrome, Firefox, Safari
- 前提条件: アプリケーションが起動済みであること

## 1. ホームページのテスト

### 1.1 基本表示テスト
```javascript
// ホームページにアクセス
await page.goto('http://localhost:3000');

// ページタイトルとメインコンテンツの確認
await expect(page).toHaveTitle('');
await expect(page.getByRole('heading', { name: 'SQL問題一覧' })).toBeVisible();
```

**手動テスト手順:**
1. ブラウザでhttp://localhost:3000にアクセス
2. ページが正常に読み込まれることを確認
3. 以下の要素が表示されることを確認:
   - GitHubリンクボタン
   - 「ジャンケン」ボタン（テスト対象外）
   - 「クイズ」ボタン
   - 「SQL」ボタン
   - 「SQLで使うテーブルの一覧」ボタン
   - 「SQL文の説明」ボタン
   - SQL問題一覧セクション

### 1.2 ナビゲーションリンクテスト
```javascript
// 各ナビゲーションリンクのクリックテスト
await page.getByRole('link', { name: 'クイズ' }).click();
await expect(page).toHaveURL('http://localhost:3000/quiz');

await page.goBack();
await page.getByRole('link', { name: 'SQL' }).click();
await expect(page).toHaveURL('http://localhost:3000/sql');
```

**手動テスト手順:**
1. 「クイズ」ボタンをクリック → `/quiz`ページに遷移することを確認
2. ブラウザの戻るボタンでホームに戻る
3. 「SQL」ボタンをクリック → `/sql`ページに遷移することを確認
4. 「SQLで使うテーブルの一覧」ボタンをクリック → `/sql/allTables`ページに遷移することを確認
5. 「SQL文の説明」ボタンをクリック → `/sql/explanation`ページに遷移することを確認
6. GitHubリンクをクリック → 新しいタブでGitHubページが開くことを確認

### 1.3 SQL問題一覧の表示テスト
```javascript
// SQL問題がカテゴリ別に正しく表示されることを確認
await expect(page.getByRole('heading', { name: 'DELETE' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'INSERT' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'SELECT' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'UPDATE' })).toBeVisible();

// 各カテゴリの問題リンクが表示されることを確認
await expect(page.getByRole('link', { name: 'SQL問題1' })).toBeVisible();
await expect(page.getByRole('link', { name: 'SQL問題2' })).toBeVisible();
```

**手動テスト手順:**
1. SQL問題が以下のカテゴリに分類されて表示されることを確認:
   - DELETE (WHERE サブカテゴリ: SQL問題10)
   - INSERT (SQL問題4, SQL問題11)
   - SELECT (各サブカテゴリ: COUNT, GROUPBY, JOIN, ORDERBY, SUM, WHERE)
   - UPDATE (WHERE サブカテゴリ: SQL問題9, SQL問題13)
2. 各問題リンクが適切に表示されることを確認
3. 問題番号が正しく表示されることを確認

## 2. クイズページのテスト

### 2.1 クイズページ基本表示テスト
```javascript
await page.goto('http://localhost:3000/quiz');

// トップボタンとクイズコンテンツの確認
await expect(page.getByRole('link', { name: 'トップ' })).toBeVisible();
await expect(page.getByText('Q1:')).toBeVisible();
await expect(page.getByRole('heading', { name: 'ランダム計算クイズ' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'AIに質問' })).toBeVisible();
```

**手動テスト手順:**
1. `/quiz`ページにアクセス
2. 3つのメインセクションが横に並んで表示されることを確認:
   - 左: 一般知識クイズ
   - 中央: ランダム計算クイズ  
   - 右: AIに質問セクション
3. 「トップ」ボタンが上部に表示されることを確認

### 2.2 一般知識クイズテスト
```javascript
// 問題表示と回答入力のテスト
await expect(page.getByText('What is the capital of France?')).toBeVisible();
await page.getByRole('textbox', { name: '答えを入力' }).fill('Paris');
await page.getByRole('button', { name: '判定' }).click();

// スコア表示の確認
await expect(page.getByText('正解数:')).toBeVisible();
await expect(page.getByText('不正解数:')).toBeVisible();
```

**手動テスト手順:**
1. 問題文が表示されることを確認
2. 答え入力フィールドに回答を入力
3. 「判定」ボタンをクリック
4. 判定結果が表示されることを確認
5. 正解数・不正解数が表示されることを確認
6. 「次の問題へ」ボタンをクリックして次の問題に進むことを確認

### 2.3 ランダム計算クイズテスト
```javascript
// 計算問題の表示確認
await expect(page.getByText(/\d+ × \d+ = \?/)).toBeVisible();
await page.getByRole('spinbutton').fill('256');
await page.getByRole('button', { name: '回答する' }).click();

// 次の問題生成テスト
await page.getByRole('button', { name: '次の問題' }).click();
```

**手動テスト手順:**
1. 計算問題（例: 16 × 16 = ?）が表示されることを確認
2. 数値入力フィールドに答えを入力
3. 「回答する」ボタンをクリック
4. 正解・不正解の判定が表示されることを確認
5. 「次の問題」ボタンをクリックして新しい問題が生成されることを確認
6. スコアが更新されることを確認

### 2.4 AI質問セクションテスト
```javascript
// AI質問フォームの確認
await expect(page.getByRole('textbox', { name: '質問を入力してください' })).toBeVisible();
await expect(page.getByRole('button', { name: '質問する' })).toBeDisabled();

// 質問入力時のボタン有効化確認
await page.getByRole('textbox', { name: '質問を入力してください' }).fill('テスト質問');
await expect(page.getByRole('button', { name: '質問する' })).toBeEnabled();
```

**手動テスト手順:**
1. 質問入力フィールドが表示されることを確認
2. 初期状態で「質問する」ボタンが無効化されていることを確認
3. 質問を入力すると「質問する」ボタンが有効になることを確認
4. 「質問する」ボタンをクリック（APIキーが設定されている場合）

### 2.5 トップページへの戻りテスト
```javascript
await page.getByRole('link', { name: 'トップ' }).click();
await expect(page).toHaveURL('http://localhost:3000/');
```

**手動テスト手順:**
1. 「トップ」ボタンをクリック
2. ホームページに戻ることを確認

## 3. SQL学習セクションのテスト

### 3.1 SQL問題ページ基本表示テスト
```javascript
await page.goto('http://localhost:3000/sql/1');

// ページ要素の確認
await expect(page.getByRole('heading', { name: 'SQLの問題' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'ユーザーの名前を取得する' })).toBeVisible();
await expect(page.getByText('テーブル名: users')).toBeVisible();
await expect(page.getByRole('table')).toBeVisible();
```

**手動テスト手順:**
1. SQL問題1ページにアクセス
2. 以下の要素が表示されることを確認:
   - 「トップ」「SQL解説」ナビゲーションボタン
   - 問題タイトル
   - 関連ジャンル・サブジャンルの解説リンク
   - データベーステーブル表示
   - SQLエディタ
   - 実行・AI質問ボタン
   - 解答確認ボタン

### 3.2 問題ナビゲーションテスト
```javascript
// 前へ・次へボタンの動作確認
await page.getByRole('button', { name: '次へ' }).click();
await expect(page).toHaveURL('http://localhost:3000/sql/2');

await page.getByRole('button', { name: '前へ' }).click();
await expect(page).toHaveURL('http://localhost:3000/sql/1');
```

**手動テスト手順:**
1. 「次へ」ボタンをクリックして次の問題に移動することを確認
2. 「前へ」ボタンをクリックして前の問題に戻ることを確認
3. 最初の問題で「前へ」ボタンが無効化されることを確認
4. 最後の問題で「次へ」ボタンが無効化されることを確認

### 3.3 データベーステーブル表示テスト
```javascript
// テーブルデータの表示確認
await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible();
await expect(page.getByRole('columnheader', { name: 'id' })).toBeVisible();
await expect(page.getByRole('columnheader', { name: 'name' })).toBeVisible();
await expect(page.getByRole('columnheader', { name: 'age' })).toBeVisible();
```

**手動テスト手順:**
1. データベーステーブルが正しく表示されることを確認
2. テーブルのヘッダー（id, name, age）が表示されることを確認
3. テーブルのデータ行が正しく表示されることを確認
4. テーブルスタイリングが適切に適用されることを確認

### 3.4 SQLエディタと実行テスト
```javascript
// SQLエディタへの入力と実行
await page.getByRole('textbox', { name: 'ここにSQLを入力' }).fill('SELECT name FROM users');
await page.getByRole('button', { name: '実行' }).click();

// 結果表示の確認
await expect(page.getByText('name')).toBeVisible();
await expect(page.getByText('Alice')).toBeVisible();
```

**手動テスト手順:**
1. SQLエディタにSQLクエリを入力
2. 「実行」ボタンをクリック
3. クエリ結果が表示されることを確認
4. エラーがある場合は適切なエラーメッセージが表示されることを確認
5. 結果テーブルのスタイリングが適切であることを確認

### 3.5 解答確認テスト
```javascript
// 解答確認の動作テスト
await page.getByRole('button', { name: '解答を確認' }).click();
await expect(page.getByText(/正解|不正解/)).toBeVisible();
```

**手動テスト手順:**
1. SQL文を入力して実行
2. 「解答を確認」ボタンをクリック
3. 正解・不正解の判定が表示されることを確認
4. 判定メッセージが適切に表示されることを確認

### 3.6 AI質問機能テスト
```javascript
// AI質問ボタンの確認
await expect(page.getByRole('button', { name: 'AIに質問' })).toBeVisible();
await page.getByRole('button', { name: 'AIに質問' }).click();
```

**手動テスト手順:**
1. 「AIに質問」ボタンが表示されることを確認
2. ボタンをクリックしてAI質問モーダルが開くことを確認
3. 質問を入力できることを確認
4. APIキーが設定されている場合は回答が表示されることを確認

### 3.7 関連解説リンクテスト
```javascript
// ジャンル・サブジャンル解説リンクの確認
await page.getByRole('link', { name: 'SELECT解説' }).click();
await expect(page).toHaveURL('http://localhost:3000/sql/explanation/SELECT');
```

**手動テスト手順:**
1. 関連ジャンルの解説リンクをクリック
2. 適切な解説ページに遷移することを確認
3. ブラウザの戻るボタンで問題ページに戻れることを確認

## 4. SQLテーブル一覧ページのテスト

### 4.1 テーブル一覧表示テスト
```javascript
await page.goto('http://localhost:3000/sql/allTables');

// ページタイトルとテーブル表示の確認
await expect(page.getByRole('heading', { name: 'すべてのテーブル一覧' })).toBeVisible();
await expect(page.getByText('テーブル名: users')).toBeVisible();
await expect(page.getByText('テーブル名: customers')).toBeVisible();
await expect(page.getByText('テーブル名: products')).toBeVisible();
await expect(page.getByText('テーブル名: orders')).toBeVisible();
```

**手動テスト手順:**
1. `/sql/allTables`ページにアクセス
2. ページタイトル「すべてのテーブル一覧」が表示されることを確認
3. 以下のテーブルが表示されることを確認:
   - users テーブル
   - customers テーブル
   - products テーブル
   - orders テーブル
4. 各テーブルのデータが正しく表示されることを確認

### 4.2 テーブルデータ詳細確認テスト
```javascript
// 各テーブルの構造とデータの確認
await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'Laptop' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'David' })).toBeVisible();
```

**手動テスト手順:**
1. usersテーブルでid, name, ageカラムとデータが表示されることを確認
2. customersテーブルでid, name, ageカラムとデータが表示されることを確認
3. productsテーブルでid, product_name, stockカラムとデータが表示されることを確認
4. ordersテーブルでid, user_id, total_amountカラムとデータが表示されることを確認
5. テーブルの見た目・レイアウトが適切であることを確認

### 4.3 ナビゲーションテスト
```javascript
await page.getByRole('link', { name: 'トップ' }).click();
await expect(page).toHaveURL('http://localhost:3000/');
```

**手動テスト手順:**
1. 「トップ」ボタンをクリック
2. ホームページに戻ることを確認

## 5. SQL解説ページのテスト

### 5.1 解説ページ基本表示テスト
```javascript
await page.goto('http://localhost:3000/sql/explanation');

// ページ要素の確認
await expect(page.getByRole('heading', { name: 'SQL文の説明' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'データの取得 (SELECT)' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'データの追加 (INSERT)' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'データの更新 (UPDATE)' })).toBeVisible();
await expect(page.getByRole('heading', { name: 'データの削除 (DELETE)' })).toBeVisible();
```

**手動テスト手順:**
1. `/sql/explanation`ページにアクセス
2. ページタイトル「SQL文の説明」が表示されることを確認
3. 以下のSQL文の説明セクションが表示されることを確認:
   - データの取得 (SELECT)
   - データの追加 (INSERT)
   - データの更新 (UPDATE)
   - データの削除 (DELETE)
   - テーブルの結合 (JOIN)
   - 条件指定 (WHERE)
   - グループ化 (GROUP BY)
   - 並び替え (ORDER BY)
   - 件数の集計 (COUNT)
   - 合計の集計 (SUM)

### 5.2 詳細解説リンクテスト
```javascript
// 各SQL文の詳細解説リンクの確認
await page.getByRole('link', { name: '詳細を見る' }).first().click();
await expect(page).toHaveURL(/\/sql\/explanation\/.+/);
```

**手動テスト手順:**
1. 各SQL文説明の「詳細を見る」リンクをクリック
2. 適切な詳細解説ページに遷移することを確認
3. 全ての詳細解説リンクが機能することを確認:
   - SELECT詳細解説
   - INSERT詳細解説
   - UPDATE詳細解説
   - DELETE詳細解説
   - JOIN詳細解説
   - WHERE詳細解説
   - GROUP BY詳細解説
   - ORDER BY詳細解説
   - COUNT詳細解説
   - SUM詳細解説

### 5.3 説明文の内容確認テスト
```javascript
// 説明文の表示確認
await expect(page.getByText('SELECT文は、データベースからデータを取得するために使用します。')).toBeVisible();
await expect(page.getByText('INSERT文は、テーブルに新しいデータを追加するために使用します。')).toBeVisible();
```

**手動テスト手順:**
1. 各SQL文の説明文が適切に表示されることを確認
2. 例文が含まれていることを確認
3. 説明が理解しやすい内容であることを確認

## 6. レスポンシブデザインテスト

### 6.1 モバイル表示テスト
```javascript
// モバイルサイズでの表示確認
await page.setViewportSize({ width: 375, height: 667 });
await page.goto('http://localhost:3000');
await expect(page.getByRole('link', { name: 'クイズ' })).toBeVisible();
```

**手動テスト手順:**
1. ブラウザを375px幅にリサイズ（モバイルサイズ）
2. ホームページの表示が適切であることを確認
3. ボタンとリンクがクリック可能であることを確認
4. クイズページで3カラムが適切にスタック表示されることを確認

### 6.2 タブレット表示テスト
```javascript
// タブレットサイズでの表示確認
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto('http://localhost:3000/quiz');
```

**手動テスト手順:**
1. ブラウザを768px幅にリサイズ（タブレットサイズ）
2. 各ページのレイアウトが適切であることを確認
3. SQLテーブルが適切に表示されることを確認

## 7. エラーハンドリングテスト

### 7.1 不正なSQLクエリテスト
```javascript
await page.goto('http://localhost:3000/sql/1');
await page.getByRole('textbox', { name: 'ここにSQLを入力' }).fill('INVALID SQL QUERY');
await page.getByRole('button', { name: '実行' }).click();
await expect(page.getByText(/エラー|Error/)).toBeVisible();
```

**手動テスト手順:**
1. SQL問題ページで不正なSQLクエリを入力
2. 実行ボタンをクリック
3. 適切なエラーメッセージが表示されることを確認
4. エラー表示が赤いボーダーで強調されることを確認

### 7.2 存在しないページアクセステスト
```javascript
await page.goto('http://localhost:3000/nonexistent');
// 404ページまたは適切なエラーページが表示されることを確認
```

**手動テスト手順:**
1. 存在しないURLにアクセス
2. 適切なエラーページが表示されることを確認
3. ホームページに戻るリンクがあることを確認

## 8. パフォーマンステスト

### 8.1 ページ読み込み時間テスト
```javascript
const startTime = Date.now();
await page.goto('http://localhost:3000');
const loadTime = Date.now() - startTime;
console.log(`Page load time: ${loadTime}ms`);
```

**手動テスト手順:**
1. ブラウザの開発者ツールでNetworkタブを開く
2. 各ページの読み込み時間を確認
3. 読み込み時間が合理的な範囲内であることを確認
4. 大きなリソースの読み込みが最適化されていることを確認

## テスト完了チェックリスト

- [ ] ホームページの全機能が正常動作
- [ ] クイズページの3つのセクションが正常動作
- [ ] SQL学習の問題ページが正常動作
- [ ] SQLテーブル一覧が正常表示
- [ ] SQL解説ページが正常表示
- [ ] ナビゲーションが全て正常動作
- [ ] レスポンシブデザインが適切
- [ ] エラーハンドリングが適切
- [ ] パフォーマンスが許容範囲内

## 注意事項

1. **認証機能の除外**: ログインとジャンケン機能は認証の問題により、テスト対象外
2. **AI機能**: OpenAI APIキーが設定されていない場合、AI質問機能は動作しません
3. **ブラウザ互換性**: Chrome、Firefox、Safariでの動作確認を推奨
4. **データ整合性**: テスト実行後、データベースの状態が適切にリセットされることを確認

このテストケースを使用して、アプリケーションの品質確保を行ってください。