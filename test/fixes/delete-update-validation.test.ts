import { describe, it, expect } from 'vitest';
import sqlQuestions from '~/data/sqlQuestions.json';

describe('DELETE/UPDATE Question Validation Fix', () => {
  it('should have showRecordsSql for DELETE question (id 10)', () => {
    const deleteQuestion = sqlQuestions.find(q => q.id === 10);
    expect(deleteQuestion).toBeDefined();
    expect(deleteQuestion?.genre).toBe('DELETE');
    expect(deleteQuestion?.showRecordsSql).toBe('SELECT * FROM users');
  });

  it('should have showRecordsSql for UPDATE questions (id 9, 13)', () => {
    const updateQuestion9 = sqlQuestions.find(q => q.id === 9);
    expect(updateQuestion9).toBeDefined();
    expect(updateQuestion9?.genre).toBe('UPDATE');
    expect(updateQuestion9?.showRecordsSql).toBe('SELECT * FROM products');

    const updateQuestion13 = sqlQuestions.find(q => q.id === 13);
    expect(updateQuestion13).toBeDefined();
    expect(updateQuestion13?.genre).toBe('UPDATE');
    expect(updateQuestion13?.showRecordsSql).toBe('SELECT * FROM customers');
  });

  it('should have correct structure for validation', () => {
    const modifiedQuestions = sqlQuestions.filter(q => [9, 10, 13].includes(q.id));
    
    modifiedQuestions.forEach(question => {
      expect(question.showRecordsSql).toBeDefined();
      expect(question.showRecordsSql).toMatch(/^SELECT \* FROM \w+$/);
      expect(question.DbName).toBeDefined();
    });
  });
});