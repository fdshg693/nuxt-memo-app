<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">サブスクリプションプラン</h1>
    
    <!-- Success/Cancel Messages -->
    <div v-if="route.query.success" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      サブスクリプションが正常に開始されました！
    </div>
    
    <div v-if="route.query.canceled" class="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
      サブスクリプションの手続きがキャンセルされました。
    </div>

    <!-- Current Subscription Status -->
    <div v-if="subscriptionStatus" class="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 class="text-xl font-bold mb-4">現在のサブスクリプション状況</h2>
      <div class="flex items-center">
        <div class="mr-4">
          <span class="inline-block w-3 h-3 rounded-full mr-2" 
                :class="subscriptionStatus.hasSubscription ? 'bg-green-500' : 'bg-gray-400'"></span>
          <span class="font-medium">
            {{ subscriptionStatus.hasSubscription ? 'アクティブ' : '未契約' }}
          </span>
        </div>
        <div v-if="subscriptionStatus.subscriptionStatus !== 'none'" class="text-sm text-gray-600">
          ステータス: {{ getStatusText(subscriptionStatus.subscriptionStatus) }}
        </div>
      </div>
    </div>

    <!-- Subscription Plans -->
    <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <!-- Basic Plan -->
      <div class="bg-white rounded-lg shadow-lg p-6 border">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">ベーシック</h3>
          <div class="text-3xl font-bold mb-4">¥500<span class="text-sm font-normal">/月</span></div>
          <ul class="text-left mb-6 space-y-2">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              基本的なSQL学習機能
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              進捗管理
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              月10回のAIアシスタント利用
            </li>
          </ul>
          <button 
            @click="subscribe('price_basic')" 
            :disabled="isLoading || !isLoggedIn"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText('basic') }}
          </button>
        </div>
      </div>

      <!-- Premium Plan -->
      <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-500 relative">
        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">人気</span>
        </div>
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">プレミアム</h3>
          <div class="text-3xl font-bold mb-4">¥1,000<span class="text-sm font-normal">/月</span></div>
          <ul class="text-left mb-6 space-y-2">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              ベーシックの全機能
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              高度なSQL解析機能
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              無制限のAIアシスタント利用
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              優先サポート
            </li>
          </ul>
          <button 
            @click="subscribe('price_premium')" 
            :disabled="isLoading || !isLoggedIn"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText('premium') }}
          </button>
        </div>
      </div>

      <!-- Enterprise Plan -->
      <div class="bg-white rounded-lg shadow-lg p-6 border">
        <div class="text-center">
          <h3 class="text-xl font-bold mb-2">エンタープライズ</h3>
          <div class="text-3xl font-bold mb-4">¥2,000<span class="text-sm font-normal">/月</span></div>
          <ul class="text-left mb-6 space-y-2">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              プレミアムの全機能
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              カスタムクエリ生成
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              専用サポート
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              API アクセス
            </li>
          </ul>
          <button 
            @click="subscribe('price_enterprise')" 
            :disabled="isLoading || !isLoggedIn"
            class="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText('enterprise') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Login prompt for non-authenticated users -->
    <div v-if="!isLoggedIn" class="mt-8 text-center">
      <p class="text-gray-600 mb-4">サブスクリプションを開始するにはログインが必要です</p>
      <NuxtLink to="/login" class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        ログイン
      </NuxtLink>
    </div>

    <!-- Note about test mode -->
    <div class="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
      <p class="text-sm text-yellow-800">
        ⚠️ これはテスト実装です。実際の決済は行われません。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRoute } from 'vue-router';

// Page meta
definePageMeta({
  title: 'サブスクリプション'
});

const route = useRoute();
const { isLoggedIn } = useAuth();

const subscriptionStatus = ref(null);
const isLoading = ref(false);

// Get subscription status if user is logged in
const fetchSubscriptionStatus = async () => {
  if (!isLoggedIn.value) return;
  
  try {
    const response = await fetch('/api/stripe/subscription-status', {
      credentials: 'include'
    });
    
    if (response.ok) {
      subscriptionStatus.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch subscription status:', error);
  }
};

// Subscribe function
const subscribe = async (priceId: string) => {
  if (!isLoggedIn.value) {
    await navigateTo('/login');
    return;
  }

  isLoading.value = true;
  
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ priceId })
    });

    if (response.ok) {
      const data = await response.json();
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } else {
      const error = await response.json();
      alert('エラーが発生しました: ' + error.statusMessage);
    }
  } catch (error) {
    console.error('Subscription error:', error);
    alert('エラーが発生しました。しばらく後でもう一度お試しください。');
  } finally {
    isLoading.value = false;
  }
};

// Helper functions
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'アクティブ',
    'canceled': 'キャンセル済み',
    'past_due': '支払い遅延',
    'incomplete': '不完全',
    'trialing': 'トライアル中'
  };
  return statusMap[status] || status;
};

const getButtonText = (plan: string) => {
  if (!isLoggedIn.value) {
    return 'ログインして開始';
  }
  
  if (isLoading.value) {
    return '処理中...';
  }
  
  if (subscriptionStatus.value?.hasSubscription) {
    return '契約済み';
  }
  
  return '開始する';
};

// Load subscription status on mount
onMounted(() => {
  fetchSubscriptionStatus();
});

// Watch for login state changes
watch(() => isLoggedIn.value, (newValue) => {
  if (newValue) {
    fetchSubscriptionStatus();
  } else {
    subscriptionStatus.value = null;
  }
});
</script>