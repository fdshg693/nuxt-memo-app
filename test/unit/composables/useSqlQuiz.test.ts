import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSqlQuiz } from '~/composables/useSqlQuiz'

// モックデータ
vi.mock('~/data/sqlQuestions.json', () => ({
  default: [
    {
      id: 1,
      level: 1,
      genre: 'SELECT',
      subgenre: 'WHERE',
      question: 'ユーザーの名前を取得する',
      answer: 'SELECT name FROM users',
      DbName: 'users'
    },
    {
      id: 2,
      level: 2,
      genre: 'SELECT',
      subgenre: 'ORDER BY',
      question: '年齢順にユーザーを取得',
      answer: 'SELECT * FROM users ORDER BY age',
      DbName: 'users'
    },
    {
      id: 3,
      level: 1,
      genre: 'INSERT',
      subgenre: 'VALUES',
      question: 'ユーザーを追加する',
      answer: 'INSERT INTO users VALUES (1, "Test", 25)',
      DbName: 'users'
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
    
    expect(questions.value).toHaveLength(3)
    expect(questions.value[0].question).toBe('ユーザーを追加する')
  })

  it('should sort questions by genre, subgenre, and level', async () => {
    const { questions, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    
    // INSERTが最初に来て、次にSELECTが来る（アルファベット順）
    expect(questions.value[0].genre).toBe('INSERT')
    expect(questions.value[1].genre).toBe('SELECT')
    expect(questions.value[2].genre).toBe('SELECT')
    
    // SELECT内では、ORDER BYの前にWHEREが来る（アルファベット順）
    expect(questions.value[1].subgenre).toBe('ORDER BY')
    expect(questions.value[2].subgenre).toBe('WHERE')
  })

  it('should have proper question structure', async () => {
    const { questions, loadQuestions } = useSqlQuiz()
    
    await loadQuestions()
    
    const question = questions.value[0]
    expect(question).toHaveProperty('id')
    expect(question).toHaveProperty('level')
    expect(question).toHaveProperty('genre')
    expect(question).toHaveProperty('subgenre')
    expect(question).toHaveProperty('question')
    expect(question).toHaveProperty('answer')
    expect(question).toHaveProperty('DbName')
  })
})