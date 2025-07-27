# ジャンケンゲーム ログイン後即座にリダイレクト問題の調査

## 問題の概要
- **発生現象**: user@example.com / password123 でログインし、成功したように見えた後、即座にログインページに戻ってしまう
- **期待動作**: ログイン成功後、ジャンケンゲームページ（/janken）に遷移し、そのまま留まる
- **調査日時**: 2024年7月27日

## 技術的な問題の根本原因

### 1. Cookie の不整合問題
アプリケーションで **httpOnly Cookie** と **通常のCookie** の両方を使用しており、認証状態に矛盾が生じている。

#### サーバーサイド（login.post.ts）
```typescript
setCookie(event, 'auth_token', fakeToken, {
    httpOnly: true,  // ← JavaScript からアクセス不可
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
});
```

#### クライアントサイド（useAuth.ts）
```typescript
const token = useCookie<string | null>('auth_token'); // ← JavaScript でアクセス可能なCookieを参照
```

### 2. 認証フロー内での不整合
1. **ログイン時**: サーバーがhttpOnly Cookieをセット
2. **クライアント**: レスポンスのtokenをJavaScript Cookieに保存
3. **ミドルウェア**: JavaScript Cookieを参照して認証状態を判定
4. **結果**: httpOnly Cookieは存在するが、JavaScript Cookieが見つからず未認証と判定

### 3. 具体的な実行フロー
```
1. ユーザーがログイン → サーバーがhttpOnly Cookie設定
2. setToken(res.token) → JavaScript Cookie設定
3. router.push('/janken') → /jankenページへ遷移
4. auth.global.ts実行 → JavaScript Cookieをチェック
5. 実際にはJavaScript Cookieが正しく設定されていない？ → 未認証判定
6. navigateTo('/login') → ログインページにリダイレクト
```

## 調査で確認すべき点

### 1. Cookie設定の実際の動作確認
- [ ] ブラウザDevToolsでCookie設定状況を確認
- [ ] httpOnly Cookieが正しく設定されているか
- [ ] JavaScript Cookieが正しく設定されているか

### 2. ミドルウェアの動作確認
- [ ] `isLoggedIn.value`の値をログ出力
- [ ] `token.value`の値をログ出力

### 3. useCookie の動作確認
- [ ] Nuxt3のuseCookieが期待通りに動作しているか
- [ ] SSR/SPA環境での動作の違い

## 推定される解決策

### 解決策1: httpOnly Cookieベースの認証（推奨）
- サーバーサイドセッション管理
- クライアントサイドでtoken状態を管理しない
- ミドルウェアでサーバーサイド認証確認

### 解決策2: 通常Cookieベースの認証
- httpOnly: falseに変更
- クライアントサイドでtoken管理を続行
- セキュリティレベルは低下

### 解決策3: ハイブリッド認証
- httpOnly Cookieはサーバー認証用
- 別途クライアント状態管理用フラグ

## 次のステップ
1. ブラウザでの実際の動作確認
2. デバッグログの追加
3. 解決策の実装と検証