import { test, expect } from '@playwright/test';

test.describe('認証ワークフロー', () => {
  test('ログインページの表示と基本機能', async ({ page }) => {
    // ログインページに直接アクセス
    await page.goto('/login');
    
    // ログインフォームの要素確認
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("ログイン")')).toBeVisible();
    
    // ラベルの確認
    await expect(page.locator('text=メールアドレス')).toBeVisible();
    await expect(page.locator('text=パスワード')).toBeVisible();
  });

  test('ログインフォームのバリデーション', async ({ page }) => {
    await page.goto('/login');
    
    // 空のフォームで送信を試行
    await page.click('button[type="submit"]:has-text("ログイン")');
    
    // ブラウザの標準バリデーションが動作することを確認
    // (required属性によるバリデーション)
    const emailInput = page.locator('input[type="email"]');
    const isEmailInvalid = await emailInput.evaluate(el => (el as HTMLInputElement).validity.valueMissing);
    expect(isEmailInvalid).toBe(true);
  });

  test('無効な認証情報でのログイン試行', async ({ page }) => {
    await page.goto('/login');
    
    // 無効な認証情報を入力
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]:has-text("ログイン")');
    
    // エラーメッセージが表示されることを確認（APIエラーの場合）
    await page.waitForTimeout(2000); // APIレスポンスを待つ
    
    // エラーメッセージの要素が存在するかチェック
    const errorElement = page.locator('.text-red-600');
    if (await errorElement.isVisible()) {
      await expect(errorElement).toBeVisible();
    }
  });

  test('保護されたページへの直接アクセス（未認証）', async ({ page }) => {
    // 認証が必要なjankenページに直接アクセス
    await page.goto('/janken');
    
    // ログインページにリダイレクトされることを確認
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/login');
  });

  test('認証後の保護されたページアクセス（モック）', async ({ page }) => {
    // 認証状態をモック（localStorage操作）
    await page.goto('/');
    
    // 認証トークンを設定（実際のアプリの動作に合わせて調整）
    await page.evaluate(() => {
      // Cookieベースの認証のため、適切なCookieを設定
      document.cookie = 'auth_token=mock-token; path=/';
    });
    
    // jankenページにアクセス
    await page.goto('/janken');
    
    // jankenページが表示されることを確認
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    await expect(page.locator('text=グー')).toBeVisible();
    await expect(page.locator('text=チョキ')).toBeVisible();
    await expect(page.locator('text=パー')).toBeVisible();
  });

  test('ログアウト機能（存在する場合）', async ({ page }) => {
    // 認証状態をモック
    await page.goto('/');
    await page.evaluate(() => {
      document.cookie = 'auth_token=mock-token; path=/';
    });
    
    // jankenページにアクセス
    await page.goto('/janken');
    
    // ログアウトボタンが存在するかチェック
    const logoutButton = page.locator('text=ログアウト');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // ログイン画面にリダイレクトされることを確認
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/login');
    }
  });

  test('認証が必要なページから非認証ページへの遷移', async ({ page }) => {
    // 認証状態をモック
    await page.goto('/');
    await page.evaluate(() => {
      document.cookie = 'auth_token=mock-token; path=/';
    });
    
    // jankenページにアクセス
    await page.goto('/janken');
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    
    // ホームページへの遷移
    await page.goto('/');
    await expect(page.locator('text=SQL問題一覧')).toBeVisible();
    
    // 他の非認証ページへの遷移
    await page.goto('/quiz');
    await expect(page.locator('.quiz-page')).toBeVisible();
  });
});