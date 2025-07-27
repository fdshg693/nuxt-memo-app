// デバッグ用: ブラウザコンソールで実行するスクリプト
// ログイン問題を確認するためのツール

console.log('🔍 Authentication Debug Script Started');

// 1. 現在のCookie状況を確認
function checkCookies() {
    console.log('📄 Current Cookies:');
    console.log('Document.cookie:', document.cookie);
    
    // auth_token を検索
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookies = cookies.filter(c => c.startsWith('auth_token'));
    
    console.log('🍪 Auth Cookies found:', authCookies.length);
    authCookies.forEach((cookie, index) => {
        console.log(`  ${index + 1}. ${cookie}`);
    });
    
    return authCookies;
}

// 2. useCookie の動作を確認（Nuxt3環境で実行）
function checkNuxtCookie() {
    if (typeof $nuxt !== 'undefined') {
        try {
            // Nuxt runtime context で実行
            console.log('🔧 Checking Nuxt useCookie...');
            // この部分は実際のVueコンポーネント内で実行する必要がある
            console.log('ℹ️ This check needs to be run within Vue component context');
        } catch (error) {
            console.error('❌ Error checking Nuxt cookie:', error);
        }
    } else {
        console.log('⚠️ Not in Nuxt runtime context');
    }
}

// 3. ログインテスト実行
async function testLogin() {
    console.log('🧪 Starting login test...');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'password123'
            })
        });
        
        console.log('📡 Login response status:', response.status);
        console.log('📡 Login response headers:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('📡 Login response data:', data);
        
        // レスポンス後のCookie状況確認
        setTimeout(() => {
            console.log('🕐 Cookies after login:');
            checkCookies();
        }, 100);
        
        return data;
    } catch (error) {
        console.error('❌ Login test failed:', error);
        return null;
    }
}

// 4. 認証状態チェック
async function checkAuthStatus() {
    console.log('🔐 Checking authentication status...');
    
    try {
        // もし auth check endpoint があれば
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        console.log('🔐 Auth status:', data);
        return data;
    } catch (error) {
        console.log('ℹ️ No auth check endpoint found (expected)');
        return null;
    }
}

// 5. 実行メイン関数
async function runFullDiagnostic() {
    console.log('🚀 Running full authentication diagnostic...');
    console.log('='.repeat(50));
    
    // 初期状態
    console.log('1️⃣ Initial state:');
    checkCookies();
    
    console.log('\n2️⃣ Testing login:');
    const loginResult = await testLogin();
    
    console.log('\n3️⃣ Post-login state:');
    checkCookies();
    
    console.log('\n4️⃣ Auth status check:');
    await checkAuthStatus();
    
    console.log('='.repeat(50));
    console.log('✅ Diagnostic complete. Check logs above for issues.');
}

// 使用方法の説明
console.log(`
🔧 Debug Tools Available:
- runFullDiagnostic() : 完全な診断を実行
- checkCookies()      : 現在のCookie状況確認
- testLogin()         : ログインテスト実行
- checkAuthStatus()   : 認証状態確認

使用例: runFullDiagnostic()
`);

// Export for use
window.authDebug = {
    runFullDiagnostic,
    checkCookies,
    testLogin,
    checkAuthStatus,
    checkNuxtCookie
};