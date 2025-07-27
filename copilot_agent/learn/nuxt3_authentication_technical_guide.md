# Nuxt3認証パターンとuseCookieの技術解説

## はじめに
Nuxt3におけるクライアント/サーバー間のCookie同期は、特にSPAとSSRが混在する環境で複雑な挙動を示します。今回のジャンケンゲーム認証問題を通じて、開発者が理解すべき重要な概念を解説します。

## Nuxt3のレンダリング モードと Cookie

### 1. レンダリングモードの違い

#### SSR (Server-Side Rendering)
```typescript
// サーバーサイドで実行
const token = useCookie('auth_token'); // サーバーのCookieヘッダーから読み取り
console.log(token.value); // サーバーサイドの値
```

#### SPA (Single Page Application)  
```typescript
// クライアントサイドで実行
const token = useCookie('auth_token'); // document.cookieから読み取り
console.log(token.value); // クライアントサイドの値
```

#### ハイドレーション時の同期問題
```typescript
// 1. SSR時: サーバーで token.value = undefined
// 2. クライアントマウント後: token.value = 'actual_token'  
// 3. この間隙で認証チェックが失敗する
```

### 2. useCookie の内部実装理解

#### Nuxt3 useCookie の特徴
```typescript
// nuxt/packages/nuxt/src/app/composables/cookie.ts (簡略版)
export function useCookie<T>(name: string, options?: CookieOptions<T>) {
    const cookies = useRequestHeaders(['cookie'])
    const cookie = klona(cookies.cookie?.[name] ?? options?.default?.())
    
    // SSR時とSPA時で参照先が変わる
    if (process.server) {
        // サーバーサイド: リクエストヘッダーから読み取り
        return readonly(cookie)
    } else {
        // クライアントサイド: document.cookieから読み取り/書き込み
        return reactive(cookie)
    }
}
```

#### 同期タイミングの問題
```typescript
// 問題のあるパターン
const { setToken } = useAuth()
await $fetch('/api/login', { ... })
setToken('new_token')           // クライアントCookie更新
await router.push('/protected') // ナビゲーション開始

// ナビゲーション中にSSRが実行される場合
// サーバーサイドでは更新されたCookieが見えない
```

## httpOnly Cookie vs 通常Cookie の技術詳細

### 1. Cookie設定オプションの影響

#### httpOnly: true (サーバーサイド専用)
```typescript
// server/api/login.post.ts
setCookie(event, 'auth_token', token, {
    httpOnly: true,    // JavaScript アクセス不可
    secure: true,      // HTTPS必須
    sameSite: 'strict' // CSRF対策
})

// クライアントサイドでは読み取り不可
console.log(document.cookie) // auth_token は表示されない
```

#### httpOnly: false (JavaScript アクセス可能)
```typescript  
// server/api/login.post.ts
setCookie(event, 'auth_token', token, {
    httpOnly: false,   // JavaScript アクセス可能
    secure: true,
    sameSite: 'strict'
})

// クライアントサイドで読み取り可能
console.log(document.cookie) // auth_token=value123 が表示される
```

### 2. セキュリティトレードオフ

#### httpOnly Cookie のメリット・デメリット
```typescript
// ✅ メリット
// - XSS攻撃からトークン保護
// - サーバーサイド認証が確実
// - CSRFトークンとの組み合わせで強固

// ❌ デメリット  
// - クライアントサイド状態管理が複雑
// - リアルタイム認証状態更新が困難
// - API呼び出し時の認証ヘッダー設定に工夫が必要
```

#### 通常Cookie のメリット・デメリット
```typescript
// ✅ メリット
// - クライアントサイド状態管理が容易
// - リアルタイム認証状態反映
// - 既存SPA認証パターンと互換性

// ❌ デメリット
// - XSS攻撃に脆弱
// - JavaScript でトークン読み取り可能
// - より厳重なCSP設定が必要
```

## 認証アーキテクチャパターン

### パターン1: Pure httpOnly Authentication

#### サーバーサイド実装
```typescript
// server/api/auth/check.get.ts
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    
    if (!token || !await validateToken(token)) {
        return { isAuthenticated: false, user: null }
    }
    
    const user = await getUserFromToken(token)
    return { isAuthenticated: true, user }
})

// server/api/auth/logout.post.ts  
export default defineEventHandler(async (event) => {
    deleteCookie(event, 'auth_token')
    return { success: true }
})
```

#### クライアントサイド実装
```typescript
// composables/useAuth.ts
export const useAuth = () => {
    const user = ref(null)
    const isLoggedIn = computed(() => !!user.value)
    
    const checkAuth = async () => {
        try {
            const { isAuthenticated, user: userData } = await $fetch('/api/auth/check')
            user.value = isAuthenticated ? userData : null
        } catch {
            user.value = null
        }
    }
    
    const logout = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        await navigateTo('/login')
    }
    
    return { user, isLoggedIn, checkAuth, logout }
}

// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    const { checkAuth, isLoggedIn } = useAuth()
    
    if (to.path.startsWith('/protected')) {
        await checkAuth()
        if (!isLoggedIn.value) {
            return navigateTo('/login')
        }
    }
})
```

### パターン2: Hybrid Authentication

#### デュアルCookie設定
```typescript
// server/api/login.post.ts
export default defineEventHandler(async (event) => {
    if (isValidCredentials(email, password)) {
        const token = generateToken()
        
        // サーバーサイド認証用（セキュア）
        setCookie(event, 'auth_session', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7
        })
        
        // クライアントサイド状態管理用（非セキュア）
        setCookie(event, 'auth_state', 'authenticated', {
            httpOnly: false,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7
        })
        
        return { success: true }
    }
})
```

#### クライアント実装
```typescript
// composables/useAuth.ts
export const useAuth = () => {
    const authState = useCookie('auth_state')
    const isLoggedIn = computed(() => authState.value === 'authenticated')
    
    const login = async (credentials) => {
        const result = await $fetch('/api/login', {
            method: 'POST',
            body: credentials
        })
        // Cookie自動設定により状態更新
        return result
    }
    
    return { isLoggedIn, login }
}
```

## パフォーマンス考慮事項

### 1. 認証チェック頻度の最適化
```typescript
// Bad: 毎回API呼び出し
export default defineNuxtRouteMiddleware(async (to) => {
    const { isAuthenticated } = await $fetch('/api/auth/check') // 毎回通信
    if (!isAuthenticated && to.path.startsWith('/protected')) {
        return navigateTo('/login')
    }
})

// Good: キャッシュ活用
export default defineNuxtRouteMiddleware(async (to) => {
    const { checkAuth, isLoggedIn, lastCheck } = useAuth()
    
    // 5分以内なら再チェックしない
    if (Date.now() - lastCheck.value < 5 * 60 * 1000) {
        if (!isLoggedIn.value && to.path.startsWith('/protected')) {
            return navigateTo('/login')
        }
        return
    }
    
    await checkAuth()
    if (!isLoggedIn.value && to.path.startsWith('/protected')) {
        return navigateTo('/login')
    }
})
```

### 2. SSR/SPA ハイブリッド最適化
```typescript
// plugins/auth.client.ts (クライアントサイドのみ実行)
export default defineNuxtPlugin(async () => {
    const { checkAuth } = useAuth()
    
    // ハイドレーション完了後に認証状態同期
    await nextTick()
    await checkAuth()
})
```

## デバッグとトラブルシューティング

### 1. Cookie同期問題の診断
```typescript
// composables/useAuthDebug.ts
export const useAuthDebug = () => {
    const logCookieState = () => {
        console.log('🍪 Cookie Debug:', {
            serverCookies: process.server ? useRequestHeaders(['cookie']) : 'N/A',
            clientCookies: process.client ? document.cookie : 'N/A',
            useCookieValue: useCookie('auth_token').value,
            timestamp: new Date().toISOString(),
            environment: process.server ? 'server' : 'client'
        })
    }
    
    return { logCookieState }
}
```

### 2. ミドルウェア診断
```typescript
// middleware/auth-debug.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.dev) {
        console.log('🛡️ Auth Middleware Debug:', {
            to: to.path,
            from: from?.path,
            cookies: useRequestHeaders(['cookie']),
            userAgent: useRequestHeaders(['user-agent']),
            timestamp: new Date().toISOString()
        })
    }
})
```

## 結論と推奨事項

### 1. 新規プロジェクト
- **Pure httpOnly Authentication** を採用
- セキュリティを最優先に設計
- パフォーマンス最適化は後から実装

### 2. 既存プロジェクト改修
- 段階的にhttpOnly認証へ移行
- 既存ユーザーセッションの互換性確保
- 十分なテスト期間を設ける

### 3. 開発時のベストプラクティス
- Cookie設定とアクセス方法の整合性確認
- SSR/SPA両環境でのテスト実施
- セキュリティヘッダーの適切な設定