# Web認証におけるCookieの使い分け - 開発者向け技術資料

## はじめに
この資料は、今回のジャンケンゲームログイン問題を通じて理解すべき、Web認証における**httpOnly Cookie**と**通常Cookie**の違いと適切な使い分けについて説明します。

## Cookieの種類と特徴

### 1. 通常のCookie (JavaScript accessible)
```javascript
// 設定例
document.cookie = "auth_token=abc123; path=/";

// 読み取り例  
const token = document.cookie.split(';').find(row => row.startsWith('auth_token='));
```

**特徴:**
- ✅ JavaScriptからアクセス可能
- ✅ クライアントサイドでの状態管理が容易
- ❌ XSS攻撃に脆弱
- ❌ セキュリティリスクが高い

### 2. httpOnly Cookie (JavaScript inaccessible)
```javascript
// サーバーサイドでのみ設定可能
setCookie(event, 'auth_token', token, {
    httpOnly: true,  // JavaScript からアクセス不可
    secure: true,    // HTTPS必須
    sameSite: 'strict'
});
```

**特徴:**
- ❌ JavaScriptからアクセス不可
- ✅ XSS攻撃から保護
- ✅ セキュリティレベル高
- ✅ 自動的にHTTPリクエストに含まれる

## 認証アーキテクチャパターン

### パターン1: クライアントサイド認証（SPA向け）
```typescript
// useAuth.ts
export const useAuth = () => {
    const token = useCookie<string | null>('auth_token'); // 通常Cookie
    
    const isLoggedIn = computed(() => !!token.value);
    
    const setToken = (t: string) => {
        token.value = t; // JavaScript Cookieに保存
    };
    
    return { token, isLoggedIn, setToken };
};
```

**メリット:**
- クライアントサイドで完結
- レスポンシブな状態管理
- API通信でのトークン送信が容易

**デメリット:**
- XSSに脆弱
- トークンがJavaScriptで読み取り可能

### パターン2: サーバーサイドセッション認証（推奨）
```typescript
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
    // 認証成功時
    setCookie(event, 'session_id', sessionId, {
        httpOnly: true,   // XSS対策
        secure: true,     // HTTPS必須  
        sameSite: 'strict' // CSRF対策
    });
    
    return { success: true }; // トークンは返さない
});

// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    // サーバーサイドで認証状態確認
    const { data } = await $fetch('/api/auth/check');
    
    if (!data.isAuthenticated && to.path.startsWith('/janken')) {
        return navigateTo('/login');
    }
});
```

**メリット:**
- 高いセキュリティ
- XSS/CSRF攻撃への耐性
- サーバーサイドでセッション管理

**デメリット:**
- サーバーサイド処理が必要
- クライアントサイド状態管理が複雑

## 今回の問題における修正アプローチ

### 現在の問題点
```typescript
// サーバー: httpOnly Cookieを設定
setCookie(event, 'auth_token', fakeToken, { httpOnly: true });

// クライアント: JavaScript Cookieを読み込もうとする  
const token = useCookie<string | null>('auth_token'); // ← 読み取れない！
```

### 修正案1: 完全なhttpOnly認証
```typescript
// server/api/auth/check.get.ts (新規作成)
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token');
    return { isAuthenticated: !!token };
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
```

### 修正案2: 通常Cookie認証
```typescript
// server/api/login.post.ts (修正)
setCookie(event, 'auth_token', fakeToken, {
    httpOnly: false, // JavaScript アクセス可能
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
});
```

## セキュリティ考慮事項

### XSS (Cross-Site Scripting) 対策
- **httpOnly Cookie**: XSSからトークンを保護
- **Content Security Policy**: スクリプト実行制限
- **入力値検証**: ユーザー入力のサニタイズ

### CSRF (Cross-Site Request Forgery) 対策  
- **SameSite Cookie**: クロスサイトリクエスト制限
- **CSRFトークン**: 正当なリクエスト確認
- **Referer検証**: リクエスト元確認

## 推奨事項

### 1. 新規プロジェクトの場合
- **httpOnly Cookie + サーバーサイドセッション**を採用
- セキュリティを最優先に設計

### 2. 既存プロジェクトの場合  
- セキュリティ要件に応じて段階的移行
- 一貫性のあるアーキテクチャ選択

### 3. 開発時の注意点
- Cookie設定とアクセス方法の整合性確認
- セキュリティヘッダーの適切な設定
- 定期的なセキュリティ監査

## 参考文献
- [OWASP Session Management](https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Nuxt 3 useCookie](https://nuxt.com/docs/api/composables/use-cookie)