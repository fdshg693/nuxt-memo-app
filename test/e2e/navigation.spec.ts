import { test, expect } from '@playwright/test';

test.describe('ナビゲーションワークフロー', () => {
  test('ホームページから各ページへの基本ナビゲーション', async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/');
    
    // ページタイトルとメインコンテンツを確認
    await expect(page).toHaveTitle(/nuxt-app/i);
    
    // メインナビゲーションボタンの存在確認
    await expect(page.locator('text=ジャンケン')).toBeVisible();
    await expect(page.locator('text=クイズ')).toBeVisible();
    await expect(page.locator('text=SQL')).toBeVisible();
    await expect(page.locator('text=SQLで使うテーブルの一覧')).toBeVisible();
    await expect(page.locator('text=SQL文の説明')).toBeVisible();
    
    // GitHubリンクの確認
    await expect(page.locator('text=GitHubのソースコードです')).toBeVisible();
    
    // SQL問題一覧セクションの確認
    await expect(page.locator('text=SQL問題一覧')).toBeVisible();
  });

  test('SQLページへのナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // SQLボタンをクリック
    await page.click('text=SQL');
    
    // SQLページに遷移していることを確認
    await expect(page).toHaveURL('/sql');
    
    // SQLページのコンテンツが表示されていることを確認（SQL問題がある場合）
    await page.waitForLoadState('networkidle');
  });

  test('クイズページへのナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // クイズボタンをクリック
    await page.click('text=クイズ');
    
    // クイズページに遷移していることを確認
    await expect(page).toHaveURL('/quiz');
    
    // クイズページのコンテンツを確認
    await expect(page.locator('.quiz-page')).toBeVisible();
    await expect(page.locator('text=トップ')).toBeVisible();
  });

  test('SQLテーブル一覧ページへのナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // SQLテーブル一覧ボタンをクリック
    await page.click('text=SQLで使うテーブルの一覧');
    
    // SQLテーブル一覧ページに遷移していることを確認
    await expect(page).toHaveURL('/sql/allTables');
    
    await page.waitForLoadState('networkidle');
  });

  test('SQL説明ページへのナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // SQL説明ボタンをクリック
    await page.click('text=SQL文の説明');
    
    // SQL説明ページに遷移していることを確認
    await expect(page).toHaveURL('/sql/explanation');
    
    await page.waitForLoadState('networkidle');
  });

  test('SQL問題への直接ナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // SQL問題リンクが存在する場合にクリック
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 0) {
      // 最初のSQL問題リンクをクリック
      await sqlQuestionLinks.first().click();
      
      // SQL問題ページに遷移していることを確認
      await expect(page.url()).toMatch(/\/sql\/\d+/);
      
      // SQL問題ページのコンテンツを確認
      await page.waitForLoadState('networkidle');
    }
  });

  test('外部リンクの確認', async ({ page }) => {
    await page.goto('/');
    
    // GitHubリンクの属性確認
    const githubLink = page.locator('text=GitHubのソースコードです');
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/fdshg693/nuxt-memo-app');
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });
});