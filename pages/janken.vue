<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <!-- タイトル -->
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          ジャンケンゲーム
        </h1>
  
        <!-- 手を選ぶボタン -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <button
            v-for="hand in choices"
            :key="hand"
            @click="play(hand)"
            class="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md transition transform hover:-translate-y-1"
          >
            {{ handLabels[hand] }}
          </button>
        </div>
  
        <!-- 結果表示 -->
        <div v-if="result" class="text-center space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            あなた: <span class="font-medium">{{ handLabels[userChoice!] }}</span>
          </p>
          <p class="text-gray-700 dark:text-gray-300">
            コンピュータ: <span class="font-medium">{{ handLabels[computerChoice!] }}</span>
          </p>
          <h2 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ result }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            スコア — あなた: <span class="font-semibold">{{ userScore }}</span> vs
            コンピュータ: <span class="font-semibold">{{ computerScore }}</span>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  // ジャンケンの手を型で定義
  type Hand = 'rock' | 'paper' | 'scissors';
  
  // 内部で使う配列とラベル
  const choices: Hand[] = ['rock', 'paper', 'scissors'];
  const handLabels: Record<Hand, string> = {
    rock: 'グー',
    paper: 'パー',
    scissors: 'チョキ',
  };
  
  // リアクティブな状態管理
  const userChoice    = ref<Hand | null>(null);
  const computerChoice= ref<Hand | null>(null);
  const result        = ref<string>('');
  const userScore     = ref(0);
  const computerScore = ref(0);
  
  // ユーザーが手を選んだときの処理
  function play(choice: Hand) {
    userChoice.value = choice;
    // ランダムでコンピュータの手を決定
    computerChoice.value = choices[
      Math.floor(Math.random() * choices.length)
    ];
    // 勝敗を判定
    result.value = judge(userChoice.value, computerChoice.value);
  
    // スコア更新
    if (result.value === 'あなたの勝ち！') {
      userScore.value++;
    } else if (result.value === 'コンピュータの勝ち！') {
      computerScore.value++;
    }
  }
  
  // 勝敗判定ロジック
  function judge(user: Hand, comp: Hand): string {
    if (user === comp) return '引き分け。';
  
    const winConditions: Record<Hand, Hand> = {
      rock: 'scissors',     // グーはチョキに勝つ
      scissors: 'paper',    // チョキはパーに勝つ
      paper: 'rock',        // パーはグーに勝つ
    };
  
    return winConditions[user] === comp
      ? 'あなたの勝ち！'
      : 'コンピュータの勝ち！';
  }
  </script>  
  