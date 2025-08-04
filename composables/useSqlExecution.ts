import { toRaw } from 'vue'
import isEqual from 'lodash/isEqual'
import { useNuxtApp } from '#app'
import { useSqlTableUtils } from '~/composables/useSqlTableUtils'

interface Table {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

export const useSqlExecution = () => {
  const nuxt = useNuxtApp();
  const $alasql = nuxt.$alasql as typeof import('alasql');
  const { createCopyTables, executeSQLWithTablePostfix } = useSqlTableUtils($alasql);

  const executeUserSQL = async (
    sql: string,
    currentQA: any,
    result: any,
    userAnswerColumns: any,
    sqlErrorDisplay: any
  ) => {
    sqlErrorDisplay.value = null;
    
    try {
      if (currentQA.value.dbs) {
        let { result: userRes, columns } = executeSQLWithTablePostfix(sql, 'user', currentQA.value.dbNames);
        if (currentQA.value.showRecordsSql !== '') {
          ({ result: userRes, columns } = executeSQLWithTablePostfix(currentQA.value.showRecordsSql, 'user', currentQA.value.dbNames));
        }
        result.value = userRes;
        userAnswerColumns.value = columns;
      } else {
        sqlErrorDisplay.value = 'データベースが見つかりません';
      }
    } catch (error) {
      result.value = [];
      userAnswerColumns.value = [];
      sqlErrorDisplay.value = `SQLの実行中にエラーが発生しました。${error instanceof Error ? error.message : String(error)}`;
    } finally {
      await createUserCopyTables(currentQA.value.dbs);
    }
  };

  const executeAnswerSQL = async (
    currentQA: any,
    correctResult: any
  ) => {
    try {
      if (currentQA.value.dbs) {
        let { result: answerRes } = executeSQLWithTablePostfix(currentQA.value.answer, 'answer', currentQA.value.dbNames);
        correctResult.value = answerRes;
        if (currentQA.value.showRecordsSql !== '') {
          ({ result: answerRes } = executeSQLWithTablePostfix(currentQA.value.showRecordsSql, 'answer', currentQA.value.dbNames));
          correctResult.value = answerRes;
        }
      } else {
        correctResult.value = [];
      }
    } catch (error) {
      correctResult.value = [];
    } finally {
      await createAnswerCopyTables(currentQA.value.dbs);
    }
  };

  const createUserCopyTables = async (dbs: Table[]) => {
    await createCopyTables('user', dbs);
  };

  const createAnswerCopyTables = async (dbs: Table[]) => {
    await createCopyTables('answer', dbs);
  };

  const checkAnswer = (
    result: any,
    correctResult: any,
    isCorrect: any,
    executeAnswerSQLFn: () => Promise<void>
  ) => {
    executeAnswerSQLFn();
    isCorrect.value = isEqual(toRaw(result.value), toRaw(correctResult.value));
  };

  return {
    executeUserSQL,
    executeAnswerSQL,
    createUserCopyTables,
    createAnswerCopyTables,
    checkAnswer,
  }
}