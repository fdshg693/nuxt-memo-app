<template>
  <div>
    <!-- Question title -->
    <div v-if="currentQA.question" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <h2 class="text-xl font-bold text-indigo-700">{{ currentQA.question }}</h2>
        <div v-if="alreadyAnswered" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          ✓ 正解済み
        </div>
      </div>
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
  alreadyAnswered?: boolean;
}>();

defineEmits<{
  prev: [];
  next: [];
}>();
</script>