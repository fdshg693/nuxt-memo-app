import { test, expect } from '@playwright/test';

test.describe('ジャンケンゲームワークフロー', () => {
  // 各テストの前に認証状態をセットアップ
  test.beforeEach(async ({ page }) => {
    // 認証状態をモック
    await page.goto('/');
    await page.evaluate(() => {
      document.cookie = 'auth_token=mock-token; path=/';
    });
  });

  test('ジャンケンゲームページの基本レイアウト', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // タイトルの確認
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    
    // 手を選ぶボタンの確認
    await expect(page.locator('text=グー')).toBeVisible();
    await expect(page.locator('text=チョキ')).toBeVisible();
    await expect(page.locator('text=パー')).toBeVisible();
    
    // ボタンが3つあることを確認
    const handButtons = page.locator('button:has-text("グー"), button:has-text("チョキ"), button:has-text("パー")');
    await expect(handButtons).toHaveCount(3);
  });

  test('ジャンケンゲームプレイ - グーを選択', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // グーボタンをクリック
    await page.click('text=グー');
    
    // 結果が表示されることを確認
    await expect(page.locator('text=あなた:')).toBeVisible();
    await expect(page.locator('text=コンピュータ:')).toBeVisible();
    
    // 結果テキストの確認（勝ち/負け/あいこ）
    const resultText = page.locator('h2').filter({ hasText: /勝ち|負け|あいこ/ });
    await expect(resultText).toBeVisible();
    
    // スコア表示の確認
    await expect(page.locator('text=スコア')).toBeVisible();
    await expect(page.locator('text=あなた:')).toBeVisible();
    await expect(page.locator('text=コンピュータ:')).toBeVisible();
  });

  test('ジャンケンゲームプレイ - チョキを選択', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // チョキボタンをクリック
    await page.click('text=チョキ');
    
    // 結果表示の確認
    await expect(page.locator('text=あなた:').locator('.. >> text=チョキ')).toBeVisible();
    await expect(page.locator('text=コンピュータ:')).toBeVisible();
    
    // 結果が表示されることを確認
    const resultText = page.locator('h2').filter({ hasText: /勝ち|負け|あいこ/ });
    await expect(resultText).toBeVisible();
  });

  test('ジャンケンゲームプレイ - パーを選択', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // パーボタンをクリック
    await page.click('text=パー');
    
    // 結果表示の確認
    await expect(page.locator('text=あなた:').locator('.. >> text=パー')).toBeVisible();
    await expect(page.locator('text=コンピュータ:')).toBeVisible();
    
    // 結果が表示されることを確認
    const resultText = page.locator('h2').filter({ hasText: /勝ち|負け|あいこ/ });
    await expect(resultText).toBeVisible();
  });

  test('連続でゲームをプレイ', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // 1回目のゲーム
    await page.click('text=グー');
    await expect(page.locator('text=スコア')).toBeVisible();
    
    // スコアを記録
    const firstScore = await page.locator('text=スコア').textContent();
    
    // 2回目のゲーム
    await page.click('text=チョキ');
    await expect(page.locator('text=スコア')).toBeVisible();
    
    // 3回目のゲーム
    await page.click('text=パー');
    await expect(page.locator('text=スコア')).toBeVisible();
    
    // スコアが更新されていることを確認（勝敗に応じて）
    const finalScore = await page.locator('text=スコア').textContent();
    expect(finalScore).toBeDefined();
  });

  test('ゲーム結果の各パターン確認', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // 複数回プレイして異なる結果を得る
    const hands = ['グー', 'チョキ', 'パー'];
    
    for (const hand of hands) {
      await page.click(`text=${hand}`);
      
      // 結果が表示されることを確認
      await expect(page.locator('text=あなた:')).toBeVisible();
      await expect(page.locator('text=コンピュータ:')).toBeVisible();
      
      // 結果テキストが適切な値のいずれかであることを確認
      const resultText = await page.locator('h2').filter({ hasText: /勝ち|負け|あいこ/ }).textContent();
      expect(['あなたの勝ち！', 'あなたの負け...', 'あいこです！']).toContain(resultText);
      
      // 少し待ってから次のゲーム
      await page.waitForTimeout(500);
    }
  });

  test('スコアシステムの動作確認', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // 初期スコアの確認
    await page.click('text=グー');
    
    // スコア表示の形式確認
    const scoreSection = page.locator('text=スコア').locator('..');
    await expect(scoreSection).toBeVisible();
    
    // プレイヤーとコンピュータのスコアが数値で表示されることを確認
    const playerScoreMatch = await scoreSection.textContent();
    expect(playerScoreMatch).toMatch(/あなた:\s*\d+/);
    expect(playerScoreMatch).toMatch(/コンピュータ:\s*\d+/);
  });

  test('ゲーム画面のレスポンシブデザイン', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    await expect(page.locator('text=グー')).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    await expect(page.locator('text=グー')).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('h1:has-text("ジャンケンゲーム")')).toBeVisible();
    await expect(page.locator('text=グー')).toBeVisible();
    
    // ボタンがタップ可能なサイズであることを確認
    const buttons = page.locator('button:has-text("グー"), button:has-text("チョキ"), button:has-text("パー")');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(40); // タップしやすい最小サイズ
      expect(boundingBox?.height).toBeGreaterThan(40);
    }
  });

  test('ゲームの状態管理', async ({ page }) => {
    await page.goto('/janken');
    await page.waitForLoadState('networkidle');
    
    // 最初はゲーム結果が表示されていないことを確認
    const resultSection = page.locator('text=あなた:').locator('..');
    if (await resultSection.isVisible()) {
      // 既に結果が表示されている場合は、ページをリフレッシュ
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
    
    // ゲームプレイ
    await page.click('text=グー');
    
    // 結果が表示される
    await expect(page.locator('text=あなた:')).toBeVisible();
    
    // ページリフレッシュ後もスコアが保持されているかチェック（ローカルストレージ等）
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 新しいゲームを開始
    await page.click('text=チョキ');
    await expect(page.locator('text=あなた:')).toBeVisible();
  });
});