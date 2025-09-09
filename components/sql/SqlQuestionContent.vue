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

      <!-- Explanation Button -->
      <div class="flex gap-2 mb-2">
        <button @click="showExplanation"
          class="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow">
          📚 解説を見る
        </button>
        <span v-if="currentQA.genre && currentQA.genre.length > 0" class="text-xs text-gray-500 self-center">
          {{ Array.isArray(currentQA.genre) ? currentQA.genre.join(', ') : currentQA.genre }}
        </span>
      </div>
    </div>

    <!-- Question navigation (hidden when hideNavigation prop is true) -->
    <QuestionNavigation v-if="!hideNavigation" :index="index" :questions-length="questionsLength" @prev="$emit('prev')"
      @next="$emit('next')" />

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
  id?: number;
  question: string;
  dbs: Table[];
  genre?: string | string[];
}

const props = defineProps<{
  currentQA: QuestionAnswer;
  index: number;
  questionsLength: number;
  alreadyAnswered?: boolean;
  hideNavigation?: boolean;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  'show-explanation': [data: { questionId?: number; genre: string }];
}>();

function showExplanation() {
  const genre = Array.isArray(props.currentQA.genre)
    ? props.currentQA.genre[0]
    : props.currentQA.genre;

  if (genre) {
    emit('show-explanation', {
      questionId: props.currentQA.id,
      genre: genre
    });
  }
}
</script>