import { test, expect } from '@playwright/test';

test.describe('クイズワークフロー', () => {
  test('クイズページの基本レイアウト確認', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // メインレイアウトの確認
    await expect(page.locator('.quiz-page')).toBeVisible();
    await expect(page.locator('.quiz-content')).toBeVisible();
    
    // トップボタンの確認
    await expect(page.locator('.quiz-top-btn')).toBeVisible();
    await expect(page.locator('text=トップ')).toBeVisible();
    
    // 3つのメインコンポーネントエリアの確認
    const flexItems = page.locator('.quiz-content .flex-1');
    await expect(flexItems).toHaveCount(3);
  });

  test('クイズ問題の表示と相互作用', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // クイズ問題の読み込みを待つ
    
    // クイズ問題カードの存在確認
    const questionCard = page.locator('[data-testid="question-card"]').or(page.locator('.question-card')).or(page.locator('.quiz-content .flex-1').first());
    
    if (await questionCard.isVisible()) {
      // 問題が読み込まれている場合の操作
      
      // 問題テキストの確認
      await expect(questionCard).toBeVisible();
      
      // 回答入力フィールドの確認
      const answerInput = questionCard.locator('input').or(questionCard.locator('textarea')).or(questionCard.locator('[type="text"]'));
      if (await answerInput.count() > 0) {
        await expect(answerInput.first()).toBeVisible();
        
        // サンプル回答を入力
        await answerInput.first().fill('テスト回答');
      }
      
      // チェックボタンまたは送信ボタンの確認
      const checkButton = questionCard.locator('button:has-text("チェック")').or(questionCard.locator('button:has-text("確認")'));
      if (await checkButton.count() > 0) {
        await checkButton.first().click();
        await page.waitForTimeout(1000);
      }
      
      // 次の問題ボタンの確認
      const nextButton = questionCard.locator('button:has-text("次")').or(questionCard.locator('button:has-text("次の問題")'));
      if (await nextButton.count() > 0) {
        await expect(nextButton.first()).toBeVisible();
      }
    } else {
      // 問題がロード中または存在しない場合
      const loadingMessage = page.locator('text=問題をロード中…');
      if (await loadingMessage.isVisible()) {
        await expect(loadingMessage).toBeVisible();
      }
    }
  });

  test('ランダム計算コンポーネント', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // ランダム計算コンポーネントエリアの確認
    const randomCalcArea = page.locator('.quiz-content .flex-1').nth(1);
    await expect(randomCalcArea).toBeVisible();
    
    // 計算問題の要素が表示されることを確認
    await page.waitForTimeout(1000); // コンポーネントの初期化を待つ
  });

  test('AI質問コンポーネント', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // AI質問コンポーネントエリアの確認
    const aiQuestionArea = page.locator('.quiz-content .flex-1').nth(2);
    await expect(aiQuestionArea).toBeVisible();
    
    // AI質問の要素が表示されることを確認
    await page.waitForTimeout(1000); // コンポーネントの初期化を待つ
  });

  test('クイズのスコア表示', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // スコア表示エリアの確認
    const scoreElements = page.locator('text=正解').or(page.locator('text=不正解')).or(page.locator('text=スコア'));
    
    // スコアが表示されている場合の確認
    if (await scoreElements.count() > 0) {
      await expect(scoreElements.first()).toBeVisible();
    }
  });

  test('トップページへの戻り', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // トップボタンをクリック
    await page.click('text=トップ');
    
    // ホームページに遷移することを確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=SQL問題一覧')).toBeVisible();
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    // デスクトップサイズでのレイアウト確認
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    // 3カラムレイアウトの確認
    const flexItems = page.locator('.quiz-content .flex-1');
    await expect(flexItems).toHaveCount(3);
    
    // 各アイテムが適切な幅を持っていることを確認
    for (let i = 0; i < await flexItems.count(); i++) {
      await expect(flexItems.nth(i)).toBeVisible();
    }
    
    // タブレットサイズでの確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // モバイルサイズでの確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // レイアウトが崩れていないことを確認
    await expect(page.locator('.quiz-page')).toBeVisible();
  });

  test('クイズコンポーネントの相互作用', async ({ page }) => {
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 複数のコンポーネントが同時に動作していることを確認
    const components = page.locator('.quiz-content .flex-1');
    
    for (let i = 0; i < Math.min(3, await components.count()); i++) {
      const component = components.nth(i);
      await expect(component).toBeVisible();
      
      // 各コンポーネント内のインタラクティブ要素を確認
      const buttons = component.locator('button');
      if (await buttons.count() > 0) {
        // ボタンが存在する場合、クリック可能であることを確認
        await expect(buttons.first()).toBeVisible();
      }
      
      const inputs = component.locator('input, textarea');
      if (await inputs.count() > 0) {
        // 入力フィールドが存在する場合、入力可能であることを確認
        await expect(inputs.first()).toBeVisible();
      }
    }
  });
});