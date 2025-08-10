# 🔒 セキュア JavaScript 実行環境の実装

この実装では、問題文で指定されたセキュリティ要件に従って、安全な JavaScript 実行環境を構築しました。

## 実装された主要セキュリティ機能

### 1. 実行環境の強隔離
- ✅ **iframe sandbox**: `allow-same-origin` を付けずにオペークオリジン化
- ✅ **WebWorker**: 実コードは WebWorker 内で動作し、DOM と完全分離
- ✅ **postMessage**: 親子間の通信は postMessage のみ

### 2. CSP（Content Security Policy）の二重防御
- ✅ **メインアプリ**: 開発時は緩和、本番時は厳格な CSP
- ✅ **サンドボックス**: `default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:`
- ✅ **ネットワーク防止**: `connect-src 'none'` で外部通信を禁止

### 3. Permissions-Policy の最小権限
- ✅ **無効化 API**: `geolocation=(), microphone=(), camera=(), clipboard-read=(), clipboard-write=(), usb=(), serial=(), payment=()`

### 4. 危険 API のアプリ側上書き
**検証済みブロック対象**:
- ✅ `fetch` → "fetch is not a function"
- ✅ `XMLHttpRequest` → "XMLHttpRequest is not a constructor"
- ✅ `WebSocket` → undefined
- ✅ `EventSource` → undefined
- ✅ `importScripts` → undefined
- ✅ `WebAssembly` → undefined
- ✅ `document` → "Cannot read properties of undefined (reading 'body')"
- ✅ `window` → "Cannot set properties of undefined (setting 'location')"

### 5. 時間＆資源の制限
- ✅ **タイムアウト**: 5秒でWorkerを自動terminate
- ✅ **レート制限**: 1分間に最大10回の実行制限
- ✅ **ログ制限**: 最大100行のログ出力制限
- ✅ **同時実行制限**: 1つのコードのみ同時実行可能

### 6. XSS/XS-Leaks対策
- ✅ **textContent**: 出力表示は textContent でエスケープ（innerHTML禁止）
- ✅ **JSON.stringify**: オブジェクトは安全にシリアライズ

### 7. セキュリティヘッダ戦略
**本番環境用ヘッダ**:
- `Content-Security-Policy`: 厳格なポリシー
- `Permissions-Policy`: 不要API総遮断
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

## ファイル構成

### 新規作成ファイル
1. **`public/sandbox.html`**: iframe サンドボックス環境
2. **`composables/useSecureJavaScriptExecution.ts`**: セキュア実行のコンポーザブル
3. **`components/SecureJavaScriptEditor.vue`**: セキュアエディタコンポーネント

### 変更ファイル
1. **`pages/playground.vue`**: 危険な `eval()` を完全除去し、セキュア実行環境に置き換え
2. **`nuxt.config.ts`**: CSP・Permissions-Policy・セキュリティヘッダ追加

## セキュリティ検証結果

実際の悪意あるコードでテストした結果：

```javascript
// 全ての危険な操作が正常にブロック
✅ fetch blocked: "fetch is not a function"
✅ DOM access blocked: "Cannot read properties of undefined (reading 'body')"
✅ window access blocked: "Cannot set properties of undefined (setting 'location')"
✅ XMLHttpRequest blocked: "XMLHttpRequest is not a constructor"
```

## アーキテクチャ

```
メインアプリ
    ↓ postMessage
iframe サンドボックス (opaque origin)
    ↓ postMessage 
WebWorker (API無効化済み)
    ↓ eval (隔離環境内)
ユーザーコード実行
```

この多層防御により、以下を実現：
- **完全な環境隔離**: DOM・親ウィンドウへのアクセス不可
- **ネットワーク遮断**: 外部通信完全禁止
- **資源制限**: タイムアウト・レート制限
- **XSS防止**: 出力の安全な表示

## まとめ

元の危険な `eval()` 直接実行から、問題文で指定された全てのセキュリティ要件を満たす堅牢なサンドボックス環境に完全移行しました。ユーザーはJavaScriptを安全に学習・実行でき、悪意あるコードが実行されてもシステム全体の安全性が保たれます。