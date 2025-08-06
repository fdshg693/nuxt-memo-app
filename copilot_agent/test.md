# テストケース作成手順 - Nuxt Memo App

## 概要

このドキュメントは、Nuxt Memo Appにおけるテストケースの作成手順とベストプラクティスを説明します。このアプリは日本語でのSQL学習、クイズ、ゲーム機能を提供するNuxt 3アプリケーションです。

## テスト戦略

### テストの種類

1. **ユニットテスト** - 個別のコンポーネントとコンポーザブルをテスト
2. **統合テスト** - コンポーネント間の連携とSQL実行機能をテスト
3. **E2Eテスト** - ユーザーワークフロー全体をテスト

### テスト対象の優先順位

**高優先度:**
- SQL実行機能（AlaSQL）
- クイズ機能
- コンポーザブル（useSqlQuiz, useSqlDb, useAuth）

**中優先度:**
- UIコンポーネント
- ナビゲーション
- データの読み込み

**低優先度:**
- スタイリング
- OpenAI統合（外部依存のため）

## セットアップ手順

### 1. Vitestによるユニット・統合テストの設定

#### 必要なパッケージのインストール

```bash
npm install --save-dev vitest @vue/test-utils @nuxt/test-utils happy-dom jsdom
```

#### vitest.config.ts の作成

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.nuxt', 'dist', '.output'],
  },
})
```

#### テストセットアップファイルの作成

```typescript
// test/setup.ts
import { beforeAll } from 'vitest'

// AlaSQL のグローバル設定（必要に応じて）
beforeAll(() => {
  // テスト用のグローバル設定をここに記載
})
```

#### package.json にテストスクリプトを追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 2. PlaywrightによるE2Eテストの設定

#### Playwrightのインストール

```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### playwright.config.ts の作成

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## テストファイルの構成

### ディレクトリ構造

```
project/
├── test/
│   ├── setup.ts                    # テストセットアップ
│   ├── unit/                       # ユニットテスト
│   │   ├── components/              # コンポーネントテスト
│   │   └── composables/             # コンポーザブルテスト
│   ├── integration/                 # 統合テスト
│   │   ├── sql-execution.test.ts    # SQL実行テスト
│   │   └── quiz-flow.test.ts        # クイズフローテスト
│   └── fixtures/                    # テストデータ
│       ├── mock-questions.json      # モックSQL問題データ
│       └── mock-databases.json      # モックDBデータ
├── tests/
│   └── e2e/                         # E2Eテスト
│       ├── homepage.spec.ts
│       ├── sql-learning.spec.ts
│       └── quiz.spec.ts
└── vitest.config.ts
```

## テストケースの作成例

### 1. コンポーネントテスト例

#### SqlEditor.vue のテスト

```typescript
// test/unit/components/SqlEditor.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SqlEditor from '~/components/SqlEditor.vue'

describe('SqlEditor', () => {
  it('should render SQL input textarea', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        disabled: false
      }
    })
    
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('実行')
  })

  it('should emit update:modelValue when SQL is changed', async () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: '',
        disabled: false
      }
    })
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('SELECT * FROM users')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['SELECT * FROM users'])
  })

  it('should emit execute event when execute button is clicked', async () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: 'SELECT * FROM users',
        disabled: false
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('execute')).toBeTruthy()
  })

  it('should disable execute button when disabled prop is true', () => {
    const wrapper = mount(SqlEditor, {
      props: {
        modelValue: 'SELECT * FROM users',
        disabled: true
      }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

#### DatabaseTable.vue のテスト

```typescript
// test/unit/components/DatabaseTable.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatabaseTable from '~/components/DatabaseTable.vue'

describe('DatabaseTable', () => {
  const mockTableData = {
    tableName: 'users',
    columns: ['id', 'name', 'age'],
    data: [
      [1, 'Alice', 25],
      [2, 'Bob', 30]
    ]
  }

  it('should render table with correct headers', () => {
    const wrapper = mount(DatabaseTable, {
      props: { tableData: mockTableData }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('id')
    expect(headers[1].text()).toBe('name')
    expect(headers[2].text()).toBe('age')
  })

  it('should render table data correctly', () => {
    const wrapper = mount(DatabaseTable, {
      props: { tableData: mockTableData }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('1')
    expect(firstRowCells[1].text()).toBe('Alice')
    expect(firstRowCells[2].text()).toBe('25')
  })

  it('should display table name', () => {
    const wrapper = mount(DatabaseTable, {
      props: { tableData: mockTableData }
    })
    
    expect(wrapper.text()).toContain('テーブル名: users')
  })
})
```

### 2. コンポーザブルテスト例

#### useSqlQuiz のテスト

```typescript
// test/unit/composables/useSqlQuiz.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSqlQuiz } from '~/composables/useSqlQuiz'

// モックデータ
vi.mock('~/data/sqlQuestions.json', () => ({
  default: [
    {
      id: 1,
      genre: 'SELECT',
      subgenre: 'WHERE',
      level: 1,
      title: 'ユーザーの名前を取得する',
      DbName: 'users',
      answer: 'SELECT name FROM users'
    }
  ]
}))

describe('useSqlQuiz', () => {
  beforeEach(() => {
    // 各テストの前にクリーンアップ
    vi.clearAllMocks()
  })

  it('should load questions correctly', async () => {
    const { questions, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    
    expect(questions.value).toHaveLength(1)
    expect(questions.value[0].title).toBe('ユーザーの名前を取得する')
  })

  it('should group questions by genre', async () => {
    const { groupedQuestions, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    
    expect(groupedQuestions.value).toHaveProperty('SELECT')
    expect(groupedQuestions.value.SELECT).toHaveProperty('WHERE')
    expect(groupedQuestions.value.SELECT.WHERE).toHaveLength(1)
  })

  it('should find question by id', async () => {
    const { findQuestionById, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    const question = findQuestionById(1)
    
    expect(question?.title).toBe('ユーザーの名前を取得する')
  })

  it('should return null for non-existent question id', async () => {
    const { findQuestionById, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    const question = findQuestionById(999)
    
    expect(question).toBeNull()
  })
})
```

#### useSqlDb のテスト

```typescript
// test/unit/composables/useSqlDb.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useSqlDb } from '~/composables/useSqlDb'

// モックデータ
vi.mock('~/data/sqlDatabases.json', () => ({
  default: [
    {
      dbName: 'users',
      tableName: 'users',
      columns: ['id', 'name', 'age'],
      data: [
        [1, 'Alice', 25],
        [2, 'Bob', 30]
      ]
    }
  ]
}))

describe('useSqlDb', () => {
  it('should get database by name', () => {
    const { getDatabaseByName } = useSqlDb()
    
    const db = getDatabaseByName('users')
    
    expect(db).toBeDefined()
    expect(db?.tableName).toBe('users')
    expect(db?.data).toHaveLength(2)
  })

  it('should return undefined for non-existent database', () => {
    const { getDatabaseByName } = useSqlDb()
    
    const db = getDatabaseByName('nonexistent')
    
    expect(db).toBeUndefined()
  })

  it('should get all databases', () => {
    const { getAllDatabases } = useSqlDb()
    
    const databases = getAllDatabases()
    
    expect(databases).toHaveLength(1)
    expect(databases[0].dbName).toBe('users')
  })
})
```

### 3. 統合テスト例

#### SQL実行機能のテスト

```typescript
// test/integration/sql-execution.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

// テスト対象ページ
import SqlQuestionPage from '~/pages/sql/[id].vue'

describe('SQL Execution Integration', () => {
  beforeEach(() => {
    // AlaSQL のセットアップ（必要に応じて）
  })

  it('should execute valid SQL query and show results', async () => {
    const wrapper = mount(SqlQuestionPage, {
      global: {
        plugins: [createTestingPinia()],
        stubs: ['NuxtLink']
      },
      props: {
        // 必要なpropsを設定
      }
    })

    // SQL入力
    const sqlEditor = wrapper.findComponent({ name: 'SqlEditor' })
    await sqlEditor.vm.$emit('update:modelValue', 'SELECT name FROM users')
    
    // SQL実行
    await sqlEditor.vm.$emit('execute')
    
    // 結果の確認
    const resultTable = wrapper.findComponent({ name: 'ResultTable' })
    expect(resultTable.exists()).toBe(true)
  })

  it('should show error message for invalid SQL', async () => {
    const wrapper = mount(SqlQuestionPage, {
      global: {
        plugins: [createTestingPinia()],
        stubs: ['NuxtLink']
      }
    })

    const sqlEditor = wrapper.findComponent({ name: 'SqlEditor' })
    await sqlEditor.vm.$emit('update:modelValue', 'INVALID SQL')
    await sqlEditor.vm.$emit('execute')

    // エラーメッセージの確認
    expect(wrapper.text()).toContain('エラー')
  })
})
```

### 4. E2Eテスト例

#### ホームページのテスト

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ホームページ', () => {
  test('should display main navigation elements', async ({ page }) => {
    await page.goto('/')
    
    // メインナビゲーション要素の確認
    await expect(page.getByRole('link', { name: 'クイズ' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'SQL' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'SQLで使うテーブルの一覧' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'SQL文の説明' })).toBeVisible()
  })

  test('should navigate to quiz page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: 'クイズ' }).click()
    await expect(page).toHaveURL('/quiz')
    await expect(page.getByRole('heading', { name: 'ランダム計算クイズ' })).toBeVisible()
  })

  test('should display SQL questions grouped by category', async ({ page }) => {
    await page.goto('/')
    
    // SQL問題セクションの確認
    await expect(page.getByRole('heading', { name: 'SQL問題一覧' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'SELECT' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'INSERT' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'UPDATE' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'DELETE' })).toBeVisible()
  })
})
```

#### SQL学習機能のテスト

```typescript
// tests/e2e/sql-learning.spec.ts
import { test, expect } from '@playwright/test'

test.describe('SQL学習機能', () => {
  test('should display SQL question and allow query execution', async ({ page }) => {
    await page.goto('/sql/1')
    
    // 問題表示の確認
    await expect(page.getByRole('heading', { name: 'SQLの問題' })).toBeVisible()
    await expect(page.getByText('テーブル名:')).toBeVisible()
    
    // データベーステーブルの確認
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'id' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'name' })).toBeVisible()
    
    // SQL入力と実行
    await page.getByRole('textbox', { name: 'ここにSQLを入力' }).fill('SELECT name FROM users')
    await page.getByRole('button', { name: '実行' }).click()
    
    // 結果の確認
    await expect(page.getByText('name')).toBeVisible()
    await expect(page.getByText('Alice')).toBeVisible()
  })

  test('should navigate between questions', async ({ page }) => {
    await page.goto('/sql/1')
    
    // 次の問題へ
    await page.getByRole('button', { name: '次へ' }).click()
    await expect(page).toHaveURL('/sql/2')
    
    // 前の問題へ
    await page.getByRole('button', { name: '前へ' }).click()
    await expect(page).toHaveURL('/sql/1')
  })

  test('should validate SQL answers', async ({ page }) => {
    await page.goto('/sql/1')
    
    // 正しいSQL文を入力
    await page.getByRole('textbox', { name: 'ここにSQLを入力' }).fill('SELECT name FROM users')
    await page.getByRole('button', { name: '実行' }).click()
    
    // 解答確認
    await page.getByRole('button', { name: '解答を確認' }).click()
    
    // 判定結果の確認
    await expect(page.getByText(/正解|不正解/)).toBeVisible()
  })
})
```

#### クイズ機能のテスト

```typescript
// tests/e2e/quiz.spec.ts
import { test, expect } from '@playwright/test'

test.describe('クイズ機能', () => {
  test('should display all quiz sections', async ({ page }) => {
    await page.goto('/quiz')
    
    // 3つのクイズセクションの確認
    await expect(page.getByText('Q1:')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ランダム計算クイズ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'AIに質問' })).toBeVisible()
  })

  test('should answer knowledge quiz', async ({ page }) => {
    await page.goto('/quiz')
    
    // 一般知識クイズに回答
    await page.getByRole('textbox', { name: '答えを入力' }).fill('Paris')
    await page.getByRole('button', { name: '判定' }).click()
    
    // スコア表示の確認
    await expect(page.getByText('正解数:')).toBeVisible()
    await expect(page.getByText('不正解数:')).toBeVisible()
  })

  test('should solve calculation quiz', async ({ page }) => {
    await page.goto('/quiz')
    
    // 計算問題の確認
    await expect(page.getByText(/\d+ × \d+ = \?/)).toBeVisible()
    
    // 回答入力（例として16×16=256）
    const answerInput = page.getByRole('spinbutton')
    await answerInput.fill('256')
    await page.getByRole('button', { name: '回答する' }).click()
    
    // 次の問題生成
    await page.getByRole('button', { name: '次の問題' }).click()
    await expect(page.getByText(/\d+ × \d+ = \?/)).toBeVisible()
  })

  test('should enable AI question submission when text is entered', async ({ page }) => {
    await page.goto('/quiz')
    
    // 初期状態でボタンが無効
    await expect(page.getByRole('button', { name: '質問する' })).toBeDisabled()
    
    // 質問入力でボタンが有効化
    await page.getByRole('textbox', { name: '質問を入力してください' }).fill('テスト質問')
    await expect(page.getByRole('button', { name: '質問する' })).toBeEnabled()
  })
})
```

## ベストプラクティス

### 1. テストデータの管理

#### モックデータファイルの作成

```json
// test/fixtures/mock-questions.json
[
  {
    "id": 1,
    "genre": "SELECT",
    "subgenre": "WHERE",
    "level": 1,
    "title": "テスト用問題",
    "DbName": "test_users",
    "answer": "SELECT name FROM test_users WHERE age > 25"
  }
]
```

#### テストユーティリティ関数

```typescript
// test/utils/test-helpers.ts
export const createMockQuestion = (overrides = {}) => ({
  id: 1,
  genre: 'SELECT',
  subgenre: 'WHERE',
  level: 1,
  title: 'テスト問題',
  DbName: 'users',
  answer: 'SELECT * FROM users',
  ...overrides
})

export const createMockDatabase = (overrides = {}) => ({
  dbName: 'test_db',
  tableName: 'test_table',
  columns: ['id', 'name'],
  data: [[1, 'Test User']],
  ...overrides
})
```

### 2. 非同期処理のテスト

```typescript
// SQL実行の非同期処理をテストする例
it('should handle async SQL execution', async () => {
  const { executeSql } = useSqlExecutor()
  
  const result = await executeSql('SELECT * FROM users')
  
  expect(result).toBeDefined()
  expect(result.data).toBeInstanceOf(Array)
})
```

### 3. エラーハンドリングのテスト

```typescript
// エラー処理のテスト
it('should handle SQL syntax errors gracefully', async () => {
  const { executeSql } = useSqlExecutor()
  
  await expect(executeSql('INVALID SQL')).rejects.toThrow()
})
```

### 4. モック・スパイの活用

```typescript
// 外部依存のモック
vi.mock('~/server/api/openai.post', () => ({
  default: vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'モック回答' } }]
  })
}))
```

## CI/CDでのテスト実行

### GitHub Actions設定例

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## テストカバレッジ

### カバレッジ設定

```typescript
// vitest.config.ts に追加
export default defineVitestConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        'test/',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        }
      }
    }
  }
})
```

## 特殊なケースのテスト

### 1. AlaSQL統合のテスト

```typescript
// AlaSQL を使用したテスト
import alasql from 'alasql'

describe('AlaSQL Integration', () => {
  beforeEach(() => {
    // テスト用データベースの初期化
    alasql('CREATE DATABASE test')
    alasql('USE test')
    alasql('CREATE TABLE users (id INT, name STRING, age INT)')
    alasql('INSERT INTO users VALUES (1, "Alice", 25), (2, "Bob", 30)')
  })

  afterEach(() => {
    // テスト後のクリーンアップ
    alasql('DROP DATABASE test')
  })

  it('should execute SELECT query correctly', () => {
    const result = alasql('SELECT name FROM users WHERE age > 25')
    expect(result).toEqual([{ name: 'Bob' }])
  })
})
```

### 2. 認証機能のテスト

```typescript
// 認証状態のテスト
describe('Authentication', () => {
  it('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/janken')
    await expect(page).toHaveURL('/login')
  })

  it('should allow access after login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox').fill('testuser')
    await page.getByRole('button', { name: 'ログイン' }).click()
    
    await page.goto('/janken')
    await expect(page).toHaveURL('/janken')
  })
})
```

## トラブルシューティング

### よくある問題と解決策

#### 1. AlaSQL関連のエラー

```typescript
// AlaSQL が undefined になる場合
// test/setup.ts で以下を追加
import alasql from 'alasql'
global.alasql = alasql
```

#### 2. Nuxt モジュールの解決エラー

```typescript
// vitest.config.ts で alias を設定
export default defineVitestConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
    }
  }
})
```

#### 3. CSS関連のエラー

```typescript
// vitest.config.ts でCSS処理を無効化
export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    css: false,  // CSS処理を無効化
  }
})
```

## メンテナンスガイドライン

### 1. 定期的なテスト見直し

- 月1回: テストカバレッジの確認
- 新機能追加時: 対応するテストの追加
- バグ修正時: 回帰テストの追加

### 2. テスト実行時間の最適化

- 並列実行の活用
- 重いテストの分離
- モックの効果的な使用

### 3. テストデータの更新

- アプリケーションデータ変更時の同期
- 古いテストデータの削除
- リアルなテストデータの維持

## 参考リソース

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Nuxt Testing](https://nuxt.com/docs/getting-started/testing)

このガイドに従って、品質の高いテストケースを作成し、アプリケーションの信頼性を向上させてください。