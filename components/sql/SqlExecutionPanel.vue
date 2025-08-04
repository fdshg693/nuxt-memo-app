<template>
  <div>
    <!-- SQL Editor -->
    <SqlEditor 
      v-model="localSql" 
      @execute="$emit('execute')" 
      :is-ai-loading="isAiLoading"
      :show-ai-prompt-modal="showAiPromptModal"
      @ask-ai="$emit('ask-ai', $event)"
    />

    <!-- Results Table -->
    <ResultTable :columns="userAnswerColumns" :result="result" />
    
    <!-- SQL Error Display -->
    <div v-if="sqlErrorDisplay" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded mb-4">
      {{ sqlErrorDisplay }}
    </div>

    <!-- Answer Check -->
    <AnswerCheck 
      :is-correct="isCorrect" 
      :current-answer="currentAnswer" 
      @check="$emit('check')" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SqlEditor from '~/components/SqlEditor.vue';
import ResultTable from '~/components/ResultTable.vue';
import AnswerCheck from '~/components/AnswerCheck.vue';

const props = defineProps<{
  sql: string;
  isAiLoading: boolean;
  showAiPromptModal: boolean;
  userAnswerColumns: string[];
  result: Record<string, any>[];
  sqlErrorDisplay: string | null;
  isCorrect: boolean | null;
  currentAnswer: string;
}>();

const emit = defineEmits<{
  'update:sql': [value: string];
  execute: [];
  'ask-ai': [prompt: string];
  check: [];
}>();

const localSql = computed({
  get: () => props.sql,
  set: (value: string) => emit('update:sql', value)
});
</script>