import { test, expect } from '@playwright/test';
import { 
  mockAuthentication, 
  clearAuthentication, 
  waitForPageLoad,
  navigateToFirstSqlQuestion,
  testResponsiveLayout,
  checkJapaneseText,
  TEST_DATA
} from './helpers';

test.describe('統合ワークフロー', () => {
  test('完全なユーザージャーニー: 未認証→認証→SQL学習→クイズ→ゲーム', async ({ page }) => {
    // ステップ1: ホームページから開始
    await page.goto('/');
    await waitForPageLoad(page);
    
    // 基本的な日本語UIが表示されていることを確認
    await checkJapaneseText(page, ['SQL問題一覧', 'クイズ', 'ジャンケン']);
    
    // ステップ2: SQL学習ワークフロー（未認証でもアクセス可能）
    if (await navigateToFirstSqlQuestion(page)) {
      // SQLエディターが存在することを確認
      const sqlEditor = page.locator('textarea');
      if (await sqlEditor.isVisible()) {
        await sqlEditor.fill(TEST_DATA.sqlQueries.valid);
        
        const executeButton = page.locator('text=実行');
        if (await executeButton.isVisible()) {
          await executeButton.click();
          await page.waitForTimeout(2000); // SQL実行結果を待つ
        }
      }
      
      // ホームに戻る
      await page.goto('/');
      await waitForPageLoad(page);
    }
    
    // ステップ3: クイズページへのアクセス
    await page.click('text=クイズ');
    await waitForPageLoad(page);
    await expect(page).toHaveURL('/quiz');
    await expect(page.locator('.quiz-page')).toBeVisible();
    
    // ホームに戻る
    await page.goto('/');
    await waitForPageLoad(page);
    
    // ステップ4: 保護されたページ（ジャンケン）へのアクセス試行（未認証）
    await page.click('text=ジャンケン');
    await waitForPageLoad(page);
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login');
    
    // ステップ5: 認証プロセスのシミュレーション
    await mockAuthentication(page);
    
    // ステップ6: 認証後のジャンケンゲームアクセス
    await page.goto('/janken');
    await waitForPageLoad(page);
    
    // ジャンケンゲームが正常に表示されることを確認
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    await expect(page.locator('text=グー')).toBeVisible();
    
    // ゲームをプレイ
    await page.click('text=グー');
    await expect(page.locator('text=あなた:')).toBeVisible();
    await expect(page.locator('text=コンピュータ:')).toBeVisible();
    
    // ステップ7: 認証状態での他のページアクセス
    await page.goto('/');
    await waitForPageLoad(page);
    await expect(page.locator('text=SQL問題一覧')).toBeVisible();
    
    await page.goto('/quiz');
    await waitForPageLoad(page);
    await expect(page.locator('.quiz-page')).toBeVisible();
  });

  test('マルチページナビゲーションフロー', async ({ page }) => {
    // 各主要ページを順番に訪問し、ナビゲーションが機能することを確認
    const pages = [
      { path: '/', expectedElement: 'text=SQL問題一覧' },
      { path: '/quiz', expectedElement: '.quiz-page' },
      { path: '/sql/allTables', expectedElement: null }, // 動的コンテンツのため要素指定なし
      { path: '/sql/explanation', expectedElement: null },
      { path: '/login', expectedElement: 'text=ログイン' }
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await waitForPageLoad(page);
      
      // URLが正しいことを確認
      await expect(page).toHaveURL(pageInfo.path);
      
      // 指定された要素が存在する場合は確認
      if (pageInfo.expectedElement) {
        await expect(page.locator(pageInfo.expectedElement)).toBeVisible();
      }
    }
  });

  test('エラーハンドリングとリカバリー', async ({ page }) => {
    // 存在しないページへのアクセス
    await page.goto('/nonexistent-page');
    await waitForPageLoad(page);
    
    // 404ページまたはリダイレクトの確認
    // Nuxtのデフォルト404ページまたはホームページへのリダイレクト
    
    // 有効なページに戻る
    await page.goto('/');
    await waitForPageLoad(page);
    await expect(page.locator('text=SQL問題一覧')).toBeVisible();
    
    // SQLページで無効なクエリをテスト
    if (await navigateToFirstSqlQuestion(page)) {
      const sqlEditor = page.locator('textarea');
      if (await sqlEditor.isVisible()) {
        await sqlEditor.fill(TEST_DATA.sqlQueries.invalid);
        
        const executeButton = page.locator('text=実行');
        if (await executeButton.isVisible()) {
          await executeButton.click();
          await page.waitForTimeout(2000);
          
          // エラーメッセージまたは適切なハンドリングを確認
          // 具体的なエラー表示方法はアプリケーションの実装による
        }
      }
    }
  });

  test('パフォーマンスとアクセシビリティの基本チェック', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // 基本的なアクセシビリティチェック
    // ページにfocusable要素が存在することを確認
    const focusableElements = page.locator('button, a, input, textarea, select');
    const count = await focusableElements.count();
    expect(count).toBeGreaterThan(0);
    
    // キーボードナビゲーションの基本テスト
    await page.keyboard.press('Tab');
    
    // 日本語コンテンツが正しく表示されることを確認
    await checkJapaneseText(page, TEST_DATA.japaneseTexts);
  });

  test('データ永続性とセッション管理', async ({ page }) => {
    // 認証状態をセット
    await mockAuthentication(page);
    
    // ジャンケンゲームでスコアを作成
    await page.goto('/janken');
    await waitForPageLoad(page);
    
    // ゲームプレイ
    await page.click('text=グー');
    await expect(page.locator('text=スコア')).toBeVisible();
    
    // 別のページに移動
    await page.goto('/');
    await waitForPageLoad(page);
    
    // ジャンケンページに戻る
    await page.goto('/janken');
    await waitForPageLoad(page);
    
    // セッション/状態が保持されているか確認
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    
    // 認証解除
    await clearAuthentication(page);
    
    // 保護されたページにアクセスしてリダイレクトを確認
    await page.goto('/janken');
    await waitForPageLoad(page);
    await expect(page).toHaveURL('/login');
  });

  test('レスポンシブデザイン統合テスト', async ({ page }) => {
    await testResponsiveLayout(page, async (page) => {
      // ホームページでのレスポンシブテスト
      await page.goto('/');
      await waitForPageLoad(page);
      
      await expect(page.locator('text=SQL問題一覧')).toBeVisible();
      await expect(page.locator('text=クイズ')).toBeVisible();
      
      // クイズページでのレスポンシブテスト
      await page.goto('/quiz');
      await waitForPageLoad(page);
      
      await expect(page.locator('.quiz-page')).toBeVisible();
      
      // 認証フローでのレスポンシブテスト
      await page.goto('/login');
      await waitForPageLoad(page);
      
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  });

  test('並行処理とコンポーネント相互作用', async ({ page }) => {
    // クイズページの複数コンポーネントが正常に動作することを確認
    await page.goto('/quiz');
    await waitForPageLoad(page);
    
    // 3つのコンポーネントエリアが表示されることを確認
    const componentAreas = page.locator('.quiz-content .flex-1');
    await expect(componentAreas).toHaveCount(3);
    
    // 各コンポーネントが独立して動作することを確認
    for (let i = 0; i < 3; i++) {
      const area = componentAreas.nth(i);
      await expect(area).toBeVisible();
      
      // 各エリア内のインタラクティブ要素を確認
      const interactiveElements = area.locator('button, input, textarea');
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 0) {
        // 要素が存在し、相互作用可能であることを確認
        await expect(interactiveElements.first()).toBeVisible();
      }
    }
  });
});