import { ref, computed } from 'vue'

interface Table {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

interface QuestionAnswer {
  question: string;
  answer?: string;
  analysisCode?: string;
  type?: 'analysis' | 'execution';
  showRecordsSql: string;
  dbNames: string[];
  dbs: Table[];
  genre: string[];
  subgenre: string[];
}

export const useSqlQuestionState = () => {
  // Question and routing state
  const index = ref(0); // Default to 0 so no question matches until route is parsed
  
  // SQL and AI state
  const sql = ref('');
  const isCorrect = ref<boolean | null>(null);
  const aiErrorDisplay = ref<string | null>(null);
  const aiAnswer = ref<string>('');
  const isAiLoading = ref(false);
  const sqlErrorDisplay = ref<string | null>(null);
  const showAiPromptModal = ref(true);
  
  // Results state
  const userAnswerColumns = ref<string[]>([]);
  const result = ref<Record<string, any>[]>([]);
  const correctResult = ref<Record<string, any>[]>([]);
  
  // Current question data
  const currentQA = ref<QuestionAnswer>({
    question: '',
    answer: '',
    analysisCode: '',
    type: 'execution',
    showRecordsSql: '',
    dbNames: [],
    dbs: [],
    genre: [],
    subgenre: [],
  });

  // Reset functions
  const resetSqlAndAi = () => {
    sql.value = '';
    aiErrorDisplay.value = null;
    aiAnswer.value = '';
    isAiLoading.value = false;
    isCorrect.value = null;
    userAnswerColumns.value = [];
    result.value = [];
    correctResult.value = [];
  };

  const setNoQuestion = () => {
    currentQA.value = {
      question: '問題が見つかりません',
      answer: '',
      analysisCode: '',
      type: 'execution',
      dbNames: [],
      dbs: [],
      genre: [],
      showRecordsSql: '',
      subgenre: [],
    };
  };

  return {
    // State
    index,
    sql,
    isCorrect,
    aiErrorDisplay,
    aiAnswer,
    isAiLoading,
    sqlErrorDisplay,
    showAiPromptModal,
    userAnswerColumns,
    result,
    correctResult,
    currentQA,
    
    // Actions
    resetSqlAndAi,
    setNoQuestion,
  }
}