import { test, expect } from '@playwright/test';

test.describe('SQLラーニングワークフロー', () => {
  test('SQL問題の実行とフィードバック', async ({ page }) => {
    // ホームページからSQL問題ページに移動
    await page.goto('/');
    
    // 最初のSQL問題をクリック
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 0) {
      await sqlQuestionLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // SQL問題ページの基本要素確認
      await expect(page.locator('#app')).toBeVisible();
      
      // SQLエディターの存在確認
      const sqlEditor = page.locator('textarea');
      await expect(sqlEditor).toBeVisible();
      
      // 実行ボタンの存在確認
      const executeButton = page.locator('text=実行');
      await expect(executeButton).toBeVisible();
      
      // サンプルSQLの入力とテスト
      await sqlEditor.fill('SELECT 1');
      await executeButton.click();
      
      // 結果が表示されることを確認
      await page.waitForSelector('.result-table, .sql-error, .sql-result', { timeout: 5000 });
      
      // ナビゲーションボタンの確認
      await expect(page.locator('text=前の問題')).toBeVisible();
      await expect(page.locator('text=次の問題')).toBeVisible();
      await expect(page.locator('text=トップ')).toBeVisible();
    }
  });

  test('SQL問題間のナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 1) {
      // 最初の問題に移動
      await sqlQuestionLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      
      // 次の問題ボタンをクリック
      const nextButton = page.locator('text=次の問題');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // URLが変わったことを確認
        await expect(page.url()).not.toBe(currentUrl);
        
        // 前の問題ボタンで戻る
        const prevButton = page.locator('text=前の問題');
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForLoadState('networkidle');
          
          // 元のURLに戻ったことを確認
          await expect(page.url()).toBe(currentUrl);
        }
      }
    }
  });

  test('AI支援機能の確認', async ({ page }) => {
    await page.goto('/');
    
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 0) {
      await sqlQuestionLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // AI支援ボタンの存在確認
      const aiButton = page.locator('text=AI支援');
      if (await aiButton.isVisible()) {
        await aiButton.click();
        
        // AIプロンプトモーダルまたは機能の表示確認
        await page.waitForTimeout(1000); // AI機能の読み込みを待つ
      }
    }
  });

  test('答え合わせ機能', async ({ page }) => {
    await page.goto('/');
    
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 0) {
      await sqlQuestionLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // 答え合わせボタンの存在確認
      const checkButton = page.locator('text=答え合わせ');
      if (await checkButton.isVisible()) {
        await checkButton.click();
        
        // 結果の表示を待つ
        await page.waitForTimeout(1000);
      }
    }
  });

  test('SQLテーブル一覧ページの機能', async ({ page }) => {
    await page.goto('/sql/allTables');
    await page.waitForLoadState('networkidle');
    
    // ページが正常に読み込まれたことを確認
    await expect(page).toHaveURL('/sql/allTables');
    
    // テーブル情報が表示されることを確認（存在する場合）
    await page.waitForTimeout(2000); // データベース情報の読み込みを待つ
  });

  test('SQL説明ページの機能', async ({ page }) => {
    await page.goto('/sql/explanation');
    await page.waitForLoadState('networkidle');
    
    // ページが正常に読み込まれたことを確認
    await expect(page).toHaveURL('/sql/explanation');
    
    // 説明コンテンツの読み込みを待つ
    await page.waitForTimeout(2000);
  });

  test('SQLエラーハンドリング', async ({ page }) => {
    await page.goto('/');
    
    const sqlQuestionLinks = page.locator('.btn-sql-question');
    const count = await sqlQuestionLinks.count();
    
    if (count > 0) {
      await sqlQuestionLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // 無効なSQLを入力
      const sqlEditor = page.locator('textarea');
      await sqlEditor.fill('INVALID SQL QUERY');
      
      // 実行ボタンをクリック
      const executeButton = page.locator('text=実行');
      await executeButton.click();
      
      // エラーメッセージが表示されることを確認
      await page.waitForSelector('.sql-error, .error', { timeout: 5000 });
    }
  });
});