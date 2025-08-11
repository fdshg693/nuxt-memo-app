<template>
    <div class="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 min-h-screen py-8">
        <div class="max-w-6xl mx-auto px-4">
            <!-- Header -->
            <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold text-indigo-700">管理者ダッシュボード</h1>
                    <div class="flex gap-4">
                        <NuxtLink to="/" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            ホームへ戻る
                        </NuxtLink>
                        <button @click="logout" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                            ログアウト
                        </button>
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">総ユーザー数</h3>
                        <p class="text-3xl font-bold text-blue-600">{{ users.length }}</p>
                    </div>
                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">管理者数</h3>
                        <p class="text-3xl font-bold text-green-600">{{ adminCount }}</p>
                    </div>
                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">一般ユーザー数</h3>
                        <p class="text-3xl font-bold text-purple-600">{{ users.length - adminCount }}</p>
                    </div>
                </div>

                <!-- Create User Button -->
                <button @click="showCreateForm = !showCreateForm" 
                        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mb-6">
                    {{ showCreateForm ? '作成フォームを閉じる' : '新規ユーザーを作成' }}
                </button>

                <!-- Create User Form -->
                <div v-if="showCreateForm" class="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 class="text-lg font-semibold mb-4">新規ユーザー作成</h3>
                    <form @submit.prevent="createUser" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">メールアドレス</label>
                            <input v-model="newUser.email" type="email" required 
                                   class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">ユーザー名</label>
                            <input v-model="newUser.username" type="text" required 
                                   class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">パスワード</label>
                            <input v-model="newUser.password" type="password" required 
                                   class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        <div class="flex items-center">
                            <label class="flex items-center">
                                <input v-model="newUser.is_admin" type="checkbox" class="mr-2">
                                管理者権限を付与する
                            </label>
                        </div>
                        <div class="md:col-span-2">
                            <button type="submit" :disabled="isCreating"
                                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {{ isCreating ? '作成中...' : 'ユーザーを作成' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Users List -->
            <div class="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <h2 class="text-2xl font-bold text-indigo-700 mb-6">ユーザー一覧</h2>
                
                <!-- Search -->
                <div class="mb-6">
                    <input v-model="searchQuery" type="text" placeholder="ユーザー検索（メール、ユーザー名）" 
                           class="w-full p-3 border border-gray-300 rounded-lg">
                </div>

                <!-- Users Table -->
                <div class="overflow-x-auto">
                    <table class="w-full table-auto">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left">ID</th>
                                <th class="px-4 py-3 text-left">メール</th>
                                <th class="px-4 py-3 text-left">ユーザー名</th>
                                <th class="px-4 py-3 text-left">権限</th>
                                <th class="px-4 py-3 text-left">作成日</th>
                                <th class="px-4 py-3 text-left">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in filteredUsers" :key="user.id" class="border-t">
                                <td class="px-4 py-3">{{ user.id }}</td>
                                <td class="px-4 py-3">{{ user.email }}</td>
                                <td class="px-4 py-3">
                                    <span v-if="!editingUser || editingUser.id !== user.id">{{ user.username }}</span>
                                    <input v-else v-model="editingUser.username" 
                                           class="w-full p-1 border border-gray-300 rounded">
                                </td>
                                <td class="px-4 py-3">
                                    <span v-if="!editingUser || editingUser.id !== user.id"
                                          :class="user.is_admin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                                          class="px-2 py-1 rounded text-sm">
                                        {{ user.is_admin ? '管理者' : '一般ユーザー' }}
                                    </span>
                                    <label v-else class="flex items-center">
                                        <input v-model="editingUser.is_admin" type="checkbox" class="mr-1">
                                        管理者
                                    </label>
                                </td>
                                <td class="px-4 py-3">{{ formatDate(user.created_at) }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <button v-if="!editingUser || editingUser.id !== user.id"
                                                @click="startEdit(user)"
                                                class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                                            編集
                                        </button>
                                        <template v-else>
                                            <button @click="saveUser" :disabled="isSaving"
                                                    class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50">
                                                保存
                                            </button>
                                            <button @click="cancelEdit"
                                                    class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                                                キャンセル
                                            </button>
                                        </template>
                                        <button @click="deleteUser(user)" :disabled="isDeleting === user.id"
                                                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50">
                                            {{ isDeleting === user.id ? '削除中' : '削除' }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
                    {{ searchQuery ? '検索条件に一致するユーザーが見つかりません。' : 'ユーザーが存在しません。' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

// Protect this page with admin middleware
definePageMeta({
  middleware: 'admin'
});

const router = useRouter();
const { logout: authLogout } = useAuth();

// State
const users = ref<any[]>([]);
const searchQuery = ref('');
const showCreateForm = ref(false);
const editingUser = ref<any>(null);
const isCreating = ref(false);
const isSaving = ref(false);
const isDeleting = ref<number | null>(null);

const newUser = ref({
  email: '',
  username: '',
  password: '',
  is_admin: false
});

// Computed
const adminCount = computed(() => users.value.filter(user => user.is_admin).length);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user => 
    user.email.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query)
  );
});

// Methods
const loadUsers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      credentials: 'include'
    });
    
    if (response.ok) {
      users.value = await response.json();
    } else {
      alert('ユーザー一覧の読み込みに失敗しました。');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('ユーザー一覧の読み込み中にエラーが発生しました。');
  }
};

const createUser = async () => {
  isCreating.value = true;
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value)
    });

    if (response.ok) {
      const createdUser = await response.json();
      users.value.unshift(createdUser);
      
      // Reset form
      newUser.value = {
        email: '',
        username: '',
        password: '',
        is_admin: false
      };
      showCreateForm.value = false;
      
      alert('ユーザーが正常に作成されました。');
    } else {
      const error = await response.json();
      alert(`ユーザー作成に失敗しました: ${error.message}`);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    alert('ユーザー作成中にエラーが発生しました。');
  } finally {
    isCreating.value = false;
  }
};

const startEdit = (user: any) => {
  editingUser.value = { ...user };
};

const cancelEdit = () => {
  editingUser.value = null;
};

const saveUser = async () => {
  if (!editingUser.value) return;
  
  isSaving.value = true;
  try {
    const response = await fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: editingUser.value.username,
        is_admin: editingUser.value.is_admin
      })
    });

    if (response.ok) {
      const updatedUser = await response.json();
      const index = users.value.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      editingUser.value = null;
      alert('ユーザー情報が更新されました。');
    } else {
      const error = await response.json();
      alert(`ユーザー更新に失敗しました: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    alert('ユーザー更新中にエラーが発生しました。');
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = async (user: any) => {
  if (!confirm(`本当に${user.username}（${user.email}）を削除しますか？この操作は取り消せません。`)) {
    return;
  }

  isDeleting.value = user.id;
  try {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      users.value = users.value.filter(u => u.id !== user.id);
      alert('ユーザーが削除されました。');
    } else {
      const error = await response.json();
      alert(`ユーザー削除に失敗しました: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('ユーザー削除中にエラーが発生しました。');
  } finally {
    isDeleting.value = null;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const logout = async () => {
  await authLogout();
  await router.push('/login');
};

// Load users on mount
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
table {
  border-spacing: 0;
}
</style>