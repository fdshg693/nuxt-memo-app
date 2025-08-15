<template>
  <div>
    <!-- Chart Container -->
    <div v-if="showChart" class="mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Genre Progress Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">ジャンル別進捗</h4>
          <div class="w-full h-64">
            <canvas ref="genreChartCanvas"></canvas>
          </div>
        </div>

        <!-- Time Progress Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">日別進捗</h4>
          <div class="w-full h-64">
            <canvas ref="timeChartCanvas"></canvas>
          </div>
        </div>

        <!-- Level Progress Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">レベル別進捗</h4>
          <div class="w-full h-64">
            <canvas ref="levelChartCanvas"></canvas>
          </div>
        </div>

        <!-- Progress Trend Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">累積進捗グラフ</h4>
          <div class="w-full h-64">
            <canvas ref="trendChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface ProgressData {
  username: string;
  correctAnswers: Array<{
    questionId: number;
    answeredAt: string;
    genre?: string;
    subgenre?: string;
    level?: number;
  }>;
  stats: {
    totalCorrect: number;
    lastActivity: string;
  };
}

const props = defineProps<{
  progress: ProgressData | null;
  showChart: boolean;
}>();

// Chart canvas refs
const genreChartCanvas = ref<HTMLCanvasElement | null>(null);
const timeChartCanvas = ref<HTMLCanvasElement | null>(null);
const levelChartCanvas = ref<HTMLCanvasElement | null>(null);
const trendChartCanvas = ref<HTMLCanvasElement | null>(null);

// Chart instances
let genreChart: Chart | null = null;
let timeChart: Chart | null = null;
let levelChart: Chart | null = null;
let trendChart: Chart | null = null;

// Chart colors
const colors = [
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
  '#84CC16', // lime
];

const createGenreChart = () => {
  if (!genreChartCanvas.value || !props.progress) return;

  const genreData = props.progress.correctAnswers.reduce((acc, answer) => {
    const genre = answer.genre || 'その他';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(genreData);
  const data = Object.values(genreData);

  const config = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value}問 (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  genreChart = new Chart(genreChartCanvas.value, config);
};

const createTimeChart = () => {
  if (!timeChartCanvas.value || !props.progress) return;

  const answers = props.progress.correctAnswers;
  const dailyData = answers.reduce((acc, answer) => {
    const date = new Date(answer.answeredAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  const labels = last7Days.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  
  const data = last7Days.map(date => dailyData[date] || 0);

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '正解数',
        data,
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        tension: 0.3,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          }
        }
      }
    }
  };

  timeChart = new Chart(timeChartCanvas.value, config);
};

const createLevelChart = () => {
  if (!levelChartCanvas.value || !props.progress) return;

  const levelData = props.progress.correctAnswers.reduce((acc, answer) => {
    const level = answer.level ? `Level ${answer.level}` : 'レベル未設定';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(levelData).sort();
  const data = labels.map(label => levelData[label]);

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '正解数',
        data,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          }
        }
      }
    }
  };

  levelChart = new Chart(levelChartCanvas.value, config);
};

const createTrendChart = () => {
  if (!trendChartCanvas.value || !props.progress) return;

  const answers = [...props.progress.correctAnswers].sort((a, b) => 
    new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
  );

  const labels: string[] = [];
  const data: number[] = [];
  
  answers.forEach((answer, index) => {
    const date = new Date(answer.answeredAt);
    labels.push(`${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`);
    data.push(index + 1);
  });

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '累積正解数',
        data,
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 10,
          }
        }
      }
    }
  };

  trendChart = new Chart(trendChartCanvas.value, config);
};

const destroyCharts = () => {
  if (genreChart) {
    genreChart.destroy();
    genreChart = null;
  }
  if (timeChart) {
    timeChart.destroy();
    timeChart = null;
  }
  if (levelChart) {
    levelChart.destroy();
    levelChart = null;
  }
  if (trendChart) {
    trendChart.destroy();
    trendChart = null;
  }
};

const createCharts = async () => {
  if (!props.showChart || !props.progress) return;
  
  await nextTick();
  destroyCharts();
  
  createGenreChart();
  createTimeChart();
  createLevelChart();
  createTrendChart();
};

watch(() => props.showChart, async (newVal) => {
  if (newVal) {
    await createCharts();
  } else {
    destroyCharts();
  }
});

watch(() => props.progress, async () => {
  if (props.showChart) {
    await createCharts();
  }
});

onMounted(() => {
  if (props.showChart) {
    createCharts();
  }
});
</script>

<style scoped>
/* Additional styles if needed */
</style>