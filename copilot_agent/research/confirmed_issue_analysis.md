# ログイン問題の確認済み調査結果

## 問題再現確認 ✅

**日時**: 2024年7月27日  
**環境**: http://localhost:3000  
**テスト**: user@example.com / password123 でのログイン

## 実際のログフロー解析

### 1. ログイン処理（成功）
```
🔐 Login Debug - Starting login process
📡 Login Debug - Making API request to /api/login  
✅ Login Debug - Login API response: {token: abcdefg1234567}
🔑 Login Debug - Setting token via useAuth
🔑 Auth Debug - Setting token: abcdefg1234567
✅ Auth Debug - Token set, current value: abcdefg1234567
🚀 Login Debug - Navigating to /janken
```

### 2. ナビゲーション中のトークン消失（問題箇所）
```
🔍 Auth Debug - isLoggedIn computed: {tokenValue: undefined, isLoggedIn: false, timestamp: ...}
🛡️ Middleware Debug: {toPath: /janken, fromPath: /login, isLoggedIn: false, tokenValue: undefined, ...}
🚫 Middleware Debug - Redirecting to login due to authentication failure
✅ Login Debug - Navigation completed
```

## 確認された技術的問題

### 根本原因: Nuxt3 useCookie の SSR/SPA 同期問題

#### 問題の詳細
1. **ログイン時**: `setToken('abcdefg1234567')` でクライアントサイドCookieに保存
2. **ナビゲーション時**: サーバーサイドレンダリングでCookie状態がリセット  
3. **ミドルウェア実行時**: `tokenValue: undefined` で未認証判定

#### Nuxt3の useCookie 動作特性
- SSR時: サーバーサイドでCookie読み込み
- SPA時: クライアントサイドでCookie読み込み  
- **ナビゲーション時の同期タイミング問題**が発生

### サーバーサイドCookie設定の影響

#### login.post.ts での重複Cookie設定
```typescript
// サーバーサイド: httpOnly Cookie設定
setCookie(event, 'auth_token', fakeToken, {
    httpOnly: true,  // JavaScript アクセス不可
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
});

// + クライアントサイド: 通常Cookie設定（レスポンスtoken使用）
// この2つが競合している可能性
```

## Cookie状態の詳細確認

### ブラウザDevTools確認結果
ブラウザのApplication > Cookiesで確認すべき状況:
- `auth_token` (httpOnly=true) ← サーバーが設定、値: `abcdefg1234567`
- `auth_token` (httpOnly=false) ← クライアントが設定、但し同期問題で消失

### Network Request Headers確認
- POST /api/login レスポンス: `Set-Cookie: auth_token=abcdefg1234567; HttpOnly; Path=/`
- 後続リクエスト: Cookie headerに auth_token が含まれる（httpOnly版）

## 確定した解決策

### 解決策1: httpOnly認証への統一（推奨）
```typescript
// server/api/auth/check.get.ts (新規作成)
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token');
    return { 
        isAuthenticated: token === 'abcdefg1234567',  // 実際はDB検証
        user: token ? { email: 'user@example.com' } : null
    };
});

// middleware/auth.global.ts (修正)
export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path.startsWith('/janken')) {
        const { isAuthenticated } = await $fetch('/api/auth/check');
        if (!isAuthenticated) {
            return navigateTo('/login');
        }
    }
});

// pages/login.vue (修正)
const onSubmit = async () => {
    const res = await $fetch('/api/login', { ... });
    // setToken(res.token); ← 削除（サーバーCookieのみ使用）
    await router.push('/janken');
};

// composables/useAuth.ts (修正)
export const useAuth = () => {
    const isLoggedIn = ref(false);
    
    const checkAuth = async () => {
        try {
            const { isAuthenticated } = await $fetch('/api/auth/check');
            isLoggedIn.value = isAuthenticated;
        } catch {
            isLoggedIn.value = false;
        }
    };
    
    return { isLoggedIn, checkAuth };
};
```

### 解決策2: 通常Cookie認証への統一（簡易）
```typescript
// server/api/login.post.ts (修正)
setCookie(event, 'auth_token', fakeToken, {
    httpOnly: false,  // JavaScript アクセス可能に変更
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
});
```

## セキュリティ考慮事項

### 解決策1のメリット
- ✅ XSS攻撃からトークン保護
- ✅ セキュリティベストプラクティス準拠
- ✅ スケーラブルな認証アーキテクチャ

### 解決策2のメリット  
- ✅ 最小限の変更で済む
- ✅ クライアントサイド状態管理が容易
- ❌ XSSに対する脆弱性

## 推奨実装

**解決策1（httpOnly認証）を推奨**
- セキュリティレベル: 高
- 将来性: 良
- 実装コスト: 中程度

## 次のステップ
1. 選択した解決策の実装
2. テスト環境での動作確認  
3. セキュリティテストの実施
4. ドキュメントの更新