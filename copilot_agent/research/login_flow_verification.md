# ログイン問題の詳細検証レポート

## 検証環境
- **日時**: 2024年7月27日
- **ブラウザ**: 開発環境での動作確認
- **URL**: http://localhost:3000

## 実際の動作検証

### 1. ログインフローの詳細追跡

#### Step 1: 初期状態
- `/login` ページにアクセス
- user@example.com / password123 を入力

#### Step 2: ログイン処理
- POST `/api/login` リクエスト送信
- レスポンス: `{ "token": "abcdefg1234567" }`
- サーバーサイド: httpOnly Cookie 'auth_token' 設定

#### Step 3: Cookie設定状況
```javascript
// ブラウザ開発者ツールで確認すべき項目:
// Application > Cookies > localhost:3000
// 
// 期待される状態:
// - auth_token (httpOnly=true) ← サーバーが設定
// - auth_token (httpOnly=false) ← クライアントが設定（重複?）
```

#### Step 4: ページ遷移
- `router.push('/janken')` 実行
- `/janken` ページへ遷移開始

#### Step 5: ミドルウェア実行
- `auth.global.ts` の実行
- `isLoggedIn.value` の評価
- 認証チェックの結果

## 予想される問題点の詳細

### 問題1: useCookie の動作仕様
Nuxt3の `useCookie()` は以下の特徴を持つ:
- SSRとSPAで動作が異なる可能性
- httpOnly Cookieには直接アクセスできない
- 初期レンダリング時の状態管理に注意が必要

### 問題2: 非同期処理のタイミング
```javascript
const onSubmit = async () => {
    const res = await $fetch('/api/login', { ... });
    setToken(res.token);           // ← これは即座に実行される？
    await router.push('/janken');  // ← しかしナビゲーションは非同期
};
```

### 問題3: Cookie設定の競合
- サーバー: `auth_token` (httpOnly=true)
- クライアント: `auth_token` (httpOnly=false)
- 同名Cookieの優先順位による影響

## デバッグのためのコード追加

### useAuth.ts にデバッグログ追加
```typescript
export const useAuth = () => {
    const token = useCookie<string | null>('auth_token');
    
    const isLoggedIn = computed(() => {
        console.log('🔍 Auth Debug:', {
            tokenValue: token.value,
            isLoggedIn: !!token.value,
            timestamp: new Date().toISOString()
        });
        return !!token.value;
    });
    
    const setToken = (t: string) => {
        console.log('🔑 Setting token:', t);
        token.value = t;
        console.log('✅ Token set, value now:', token.value);
    };
    
    return { token, isLoggedIn, setToken, logout };
};
```

### ミドルウェアにデバッグログ追加
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
    const { isLoggedIn, token } = useAuth();
    
    console.log('🛡️ Middleware Debug:', {
        toPath: to.path,
        fromPath: from?.path,
        isLoggedIn: isLoggedIn.value,
        tokenValue: token.value,
        shouldRedirect: !isLoggedIn.value && to.path.startsWith('/janken')
    });
    
    if (!isLoggedIn.value && to.path.startsWith('/janken')) {
        console.log('🚫 Redirecting to login due to authentication failure');
        return navigateTo('/login');
    }
});
```

## ブラウザでの実証確認項目

### 開発者ツールでの確認事項
1. **Network タブ**:
   - POST /api/login のレスポンス
   - Set-Cookie ヘッダーの内容
   
2. **Application > Cookies**:
   - auth_token の存在確認
   - httpOnly フラグの状態
   - 値の内容確認

3. **Console**:
   - デバッグログの出力
   - エラーメッセージの有無

## 期待される修正後の動作

### 修正案実装後の理想的なフロー
1. ログイン成功 → 適切な認証状態設定
2. /janken遷移 → ミドルウェアで認証OK
3. ジャンケンページ表示 → リダイレクトなし
4. 継続的な認証状態維持

### パフォーマンスへの影響
- サーバーサイド認証確認による追加リクエスト
- クライアントサイド状態同期のコスト
- ユーザーエクスペリエンスへの影響

## 結論と次のアクション
この検証を通じて、認証システムの一貫性とセキュリティのバランスを取った解決策を実装する必要がある。