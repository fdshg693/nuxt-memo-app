<template>
    <div ref="menuRoot" class="fixed top-4 right-4 z-30" :class="{ 'pointer-events-none': disabled }">
        <!-- Logged in avatar -->
        <div v-if="isLoggedIn" class="relative">
            <button ref="triggerBtn" type="button"
                class="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-4 focus:ring-purple-300"
                aria-haspopup="menu" :aria-expanded="open ? 'true' : 'false'" @click="toggle"
                @keydown.down.prevent="openMenuViaKey" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle"
                @keydown.escape.stop.prevent="close">
                <span class="text-sm font-semibold" aria-hidden="true">{{ initials }}</span>
                <span class="sr-only">ユーザーメニューを開く</span>
            </button>

            <!-- Dropdown -->
            <transition name="fade-scale">
                <div v-if="open"
                    class="absolute right-0 mt-2 w-64 bg-white border border-purple-200 rounded-xl shadow-xl py-3 px-3 flex flex-col gap-2 origin-top-right"
                    role="menu" tabindex="-1" @keydown.escape.stop.prevent="close">
                    <div class="px-1 pb-2 border-b border-purple-100 text-sm text-gray-600">
                        <span class="block">こんにちは、<span class="font-medium text-purple-700">{{ username
                                }}さん</span></span>
                        <span class="text-[11px] text-gray-400">ログイン: {{ shortLoginAt }}</span>
                    </div>
                    <NuxtLink v-if="userProfile?.is_admin" to="/admin" class="menu-item" role="menuitem" @click="close">
                        管理者画面
                    </NuxtLink>
                    <NuxtLink to="/profile" class="menu-item" role="menuitem" @click="close">プロフィール</NuxtLink>
                    <NuxtLink to="/subscription" class="menu-item" role="menuitem" @click="close">サブスクリプション</NuxtLink>
                    <button type="button" class="menu-item text-red-600 hover:text-red-700 hover:bg-red-50"
                        @click="doLogout" role="menuitem">ログアウト</button>
                </div>
            </transition>
        </div>

        <!-- Logged out -->
        <div v-else class="relative">
            <NuxtLink to="/login"
                class="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition focus:outline-none focus:ring-4 focus:ring-purple-300 text-xs font-medium">
                ログイン
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const { isLoggedIn, username, userProfile, logout } = useAuth()
const router = useRouter()

const open = ref(false)
const disabled = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
const triggerBtn = ref<HTMLButtonElement | null>(null)

const initials = computed(() => {
    const name = username.value || ''
    if (!name) return 'U'
    // Take first 2 visible characters (handles multibyte) 
    return Array.from(name).slice(0, 2).join('').toUpperCase()
})

const shortLoginAt = computed(() => {
    const ts = userProfile.value?.loginAt
    if (!ts) return ''
    try {
        const d = new Date(ts)
        return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    } catch { return '' }
})

function toggle() {
    open.value = !open.value
}
function close() { open.value = false }
function openMenuViaKey() { if (!open.value) open.value = true }

async function doLogout() {
    await logout()
    close()
    router.push('/login')
}

function onDocumentClick(e: MouseEvent) {
    if (!open.value) return
    if (!menuRoot.value) return
    const target = e.target as Node
    if (!menuRoot.value.contains(target)) {
        close()
    }
}

function onDocumentKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick, true)
    document.addEventListener('keydown', onDocumentKey)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick, true)
    document.removeEventListener('keydown', onDocumentKey)
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity .16s ease, transform .18s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(.96);
}

/* Replicating Tailwind utilities manually to avoid @apply in scoped block */
.menu-item {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #374151;
    font-weight: 500;
    transition: background-color .15s ease, color .15s ease;
}

.menu-item:hover {
    background: #faf5ff;
    color: #6d28d9;
}
</style>