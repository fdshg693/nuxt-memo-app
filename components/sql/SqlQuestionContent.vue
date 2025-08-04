<template>
  <div>
    <!-- Question title -->
    <div v-if="currentQA.question" class="mb-4">
      <h2 class="text-xl font-bold text-indigo-700 mb-2">{{ currentQA.question }}</h2>
    </div>

    <!-- Question navigation -->
    <QuestionNavigation 
      :index="index" 
      :questions-length="questionsLength" 
      @prev="$emit('prev')"
      @next="$emit('next')" 
    />

    <!-- Database tables -->
    <div class="flex flex-row flex-wrap gap-4 mb-4">
      <div v-if="currentQA.dbs.length === 0" class="text-gray-500 text-sm">データベースが見つかりません</div>
      <div v-else class="text-gray-500 text-sm">
        <div v-for="db in currentQA.dbs" :key="db.name" class="flex-1 min-w-[250px]">
          <DatabaseTable :db="db" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuestionNavigation from '~/components/QuestionNavigation.vue';
import DatabaseTable from '~/components/DatabaseTable.vue';

interface Table {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

interface QuestionAnswer {
  question: string;
  dbs: Table[];
}

defineProps<{
  currentQA: QuestionAnswer;
  index: number;
  questionsLength: number;
}>();

defineEmits<{
  prev: [];
  next: [];
}>();
</script>