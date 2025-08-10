// E2E テスト用のヘルパー関数とユーティリティ

import { Page, expect } from '@playwright/test';

/**
 * ログイン状態をモックする
 */
export async function mockAuthentication(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    document.cookie = 'auth_token=mock-token; path=/';
  });
}

/**
 * ログアウト状態にする
 */
export async function clearAuthentication(page: Page) {
  await page.evaluate(() => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}

/**
 * ページが完全に読み込まれるまで待つ
 */
export async function waitForPageLoad(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(1000); // 追加の安定性のための待機
}

/**
 * SQL問題が存在するかチェックし、存在する場合は最初の問題に移動
 */
export async function navigateToFirstSqlQuestion(page: Page): Promise<boolean> {
  await page.goto('/');
  await waitForPageLoad(page);
  
  const sqlQuestionLinks = page.locator('.btn-sql-question');
  const count = await sqlQuestionLinks.count();
  
  if (count > 0) {
    await sqlQuestionLinks.first().click();
    await waitForPageLoad(page);
    return true;
  }
  
  return false;
}

/**
 * エラーメッセージが表示されているかチェック
 */
export async function checkForErrorMessage(page: Page): Promise<string | null> {
  const errorSelectors = [
    '.text-red-600',
    '.error',
    '.sql-error',
    '[class*="error"]',
    'text=エラー'
  ];
  
  for (const selector of errorSelectors) {
    const errorElement = page.locator(selector);
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
  }
  
  return null;
}

/**
 * 成功メッセージが表示されているかチェック
 */
export async function checkForSuccessMessage(page: Page): Promise<string | null> {
  const successSelectors = [
    '.text-green-600',
    '.success',
    '.sql-success',
    '[class*="success"]',
    'text=成功'
  ];
  
  for (const selector of successSelectors) {
    const successElement = page.locator(selector);
    if (await successElement.isVisible()) {
      return await successElement.textContent();
    }
  }
  
  return null;
}

/**
 * レスポンシブデザインのテスト用ビューポートサイズ
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  large: { width: 1920, height: 1080 }
};

/**
 * レスポンシブテストを実行
 */
export async function testResponsiveLayout(page: Page, testFn: (page: Page) => Promise<void>) {
  for (const [size, viewport] of Object.entries(VIEWPORT_SIZES)) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // レイアウト調整を待つ
    
    try {
      await testFn(page);
    } catch (error) {
      throw new Error(`Responsive test failed at ${size} (${viewport.width}x${viewport.height}): ${error}`);
    }
  }
}

/**
 * 要素が完全に表示されるまで待つ
 */
export async function waitForElementVisible(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForFunction(
    selector => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },
    selector,
    { timeout }
  );
}

/**
 * 日本語テキストが正しく表示されているかチェック
 */
export async function checkJapaneseText(page: Page, expectedTexts: string[]) {
  for (const text of expectedTexts) {
    await expect(page.locator(`text=${text}`)).toBeVisible();
  }
}

/**
 * フォーム送信のヘルパー
 */
export async function submitForm(page: Page, formData: Record<string, string>, submitButtonText = 'submit') {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[name="${field}"], #${field}, input[type="${field}"]`, value);
  }
  
  await page.click(`button[type="submit"], button:has-text("${submitButtonText}")`);
}

/**
 * SQLエディターの操作ヘルパー
 */
export async function executeSqlQuery(page: Page, sql: string) {
  const sqlEditor = page.locator('textarea, .sql-editor, [data-testid="sql-editor"]');
  await sqlEditor.fill(sql);
  
  const executeButton = page.locator('button:has-text("実行"), button:has-text("Execute")');
  await executeButton.click();
  
  // 結果の表示を待つ
  await page.waitForSelector('.result-table, .sql-error, .sql-result', { timeout: 5000 });
}

/**
 * テストデータ
 */
export const TEST_DATA = {
  validEmail: 'test@example.com',
  validPassword: 'password123',
  invalidEmail: 'invalid-email',
  invalidPassword: 'wrong',
  
  sqlQueries: {
    valid: 'SELECT 1',
    invalid: 'INVALID SQL QUERY',
    simple: 'SELECT * FROM users LIMIT 1'
  },
  
  japaneseTexts: [
    'ジャンケンゲーム',
    'SQL問題一覧',
    'クイズ',
    'ログイン',
    'トップ'
  ]
};