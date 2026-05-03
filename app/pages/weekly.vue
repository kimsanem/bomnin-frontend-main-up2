<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';

// --- 1. STATE ---
const users = ref([]);
const allUsers = ref([]);
const isLoadingAll = ref(false);
const isLoading = ref(true);
const fetchError = ref(null);

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const searchText = ref('');
const isModalOpen = ref(false);
const selectedUser = ref(null);

const currentUser = useCookie('user_data');

// --- 2. FETCH DATA FROM LARAVEL ---
const fetchLeaderboard = async () => {
    isLoading.value = true;
    fetchError.value = null;
    try {
        const response = await $fetch(`${baseUrl}/leaderboard/weekly`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response) {
            users.value = response.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        }
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        fetchError.value = "មិនទាន់មានទិន្នន័យទេ!";
        users.value = []; 
    } finally {
        isLoading.value = false;
    }
};

const fetchAllLeaderboard = async () => {
    if (allUsers.value.length > 0 || isLoadingAll.value) return;
    isLoadingAll.value = true;
    try {
        const response = await $fetch(`${baseUrl}/leaderboard/weekly`, {
            query: { all: 1 },
            headers: { 'Accept': 'application/json' }
        });
        if (response) {
            allUsers.value = response.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        }
    } catch (err) {
        console.error("Failed to fetch full leaderboard:", err);
    } finally {
        isLoadingAll.value = false;
    }
};

onMounted(() => {
    fetchLeaderboard();
});

watch(isModalOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
});

onUnmounted(() => {
    document.body.style.overflow = 'auto';
});

// --- 3. COMPUTED ---
const modalSource = computed(() => allUsers.value.length > 0 ? allUsers.value : users.value);

const filteredUsers = computed(() => {
    if (!searchText.value) return modalSource.value;
    const term = searchText.value.toLowerCase();
    return modalSource.value.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.rank.toString().includes(term)
    );
});

const topThree = computed(() => {
    if (users.value.length === 0) return [];
    const first = users.value.find(u => u.rank === 1);
    const second = users.value.find(u => u.rank === 2);
    const third = users.value.find(u => u.rank === 3);
    return [second, first, third].filter(Boolean);
});

const restUsers = computed(() => {
    return users.value.filter(u => u.rank > 3).slice(0, 15);
});

// --- 4. METHODS ---
const openModal = () => {
    isModalOpen.value = true;
    fetchAllLeaderboard();
};

const closeModal = () => {
    isModalOpen.value = false;
    searchText.value = '';
};

const openUserProfile = (user) => {
    selectedUser.value = user;
};

const closeUserProfile = () => {
    selectedUser.value = null;
};

const getOptimizedAvatar = (url, name) => {
    const defaultName = name || 'User';
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=1e3a8a&color=fff&rounded=true&bold=true`;
    if (url.includes('googleusercontent.com')) return url.split('=')[0] + '=s128-c';
    return url;
};

// 🔥 មុខងារលោតទៅរកឈ្មោះខ្លួនឯងនៅក្នុងតារាង (Jump to Me)
const jumpToMe = async () => {
    if (!currentUser.value || !currentUser.value.name) {
        alert("សូមភ្ជាប់គណនី (Login) ជាមុនសិន!");
        return;
    }

    const myEntry = modalSource.value.find(u => u.name === currentUser.value.name);

    if (!myEntry) {
        alert("ឈ្មោះរបស់អ្នកមិនស្ថិតនៅក្នុងបញ្ជីចំណាត់ថ្នាក់ប្រចាំសប្ដាហ៍មុនទេ!");
        return;
    }

    searchText.value = ''; 
    await nextTick(); // រង់ចាំឱ្យ Vue Render តារាងពេញលេញសិន
    
    // ស្វែងរកទីតាំង Row របស់ខ្លួនឯង ហើយ Scroll ទៅរក
    const myRow = document.getElementById(`user-row-${myEntry.rank}`);
    if (myRow) {
        myRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // លោតពណ៌ Highlight មួយភ្លែតដើម្បីឱ្យងាយស្រួលមើលឃើញ
        myRow.classList.add('ring-4', 'ring-blue-400', 'bg-blue-50', 'transition-all', 'duration-500');
        setTimeout(() => {
            myRow.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50');
        }, 2000);
    }
};

</script>
<template>
  <div class="min-h-screen overflow-x-hidden font-kantumruy px-2 pt-2 sm:px-4 md:pt-5 lg:pt-2">
    <div class="mx-auto w-full max-w-6xl">
        
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p class="text-gray-500 font-bold">កំពុងទាញយកទិន្នន័យចំណាត់ថ្នាក់សប្ដាហ៍មុន...</p>
        </div>

        <div v-else-if="fetchError" class="text-center py-20 text-red-500 bg-white rounded-3xl shadow-sm p-8">
            <h1 class="text-2xl font-bold mb-2">មានបញ្ហា</h1>
            <p>{{ fetchError }}</p>
            <button @click="fetchLeaderboard" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">សាកល្បងម្ដងទៀត</button>
        </div>

        <div v-else-if="users.length > 0">
            <div v-if="topThree.length > 0" class="mx-auto mt-8 mb-8 grid w-full max-w-[28rem] grid-cols-3 items-end gap-2 sm:max-w-2xl sm:gap-4 md:mt-16 md:mb-10 md:max-w-4xl md:gap-10 lg:gap-16">
                <div v-for="(user, idx) in topThree" :key="user.rank" @click="openUserProfile(user)" class="relative flex min-w-0 flex-col items-center group duration-300 hover:-translate-y-1 transition-all cursor-pointer" :class="{'order-2 -mt-5 z-20 md:-mt-12 md:scale-110': user.rank === 1, 'order-1 z-10': user.rank === 2, 'order-3 z-10': user.rank === 3}">
                    <div class="relative flex w-full min-w-0 flex-col items-center overflow-hidden rounded-2xl border border-white/40 bg-white/90 px-2 py-3 shadow-[0_18px_46px_rgba(15,23,42,0.14)] backdrop-blur-md transition-colors hover:bg-white/95 dark:border-white/10 dark:bg-slate-900/75 dark:hover:bg-slate-900/90 sm:px-3 sm:py-4 md:w-52 md:rounded-3xl md:p-6 md:shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] animate-weekly-shimmer bg-[linear-gradient(90deg,transparent,#facc15,#f97316,#f59e0b,transparent)] bg-[length:220%_100%]"></div>
                        <div class="relative mb-2 rounded-full border-2 border-amber-300 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 p-[3px] shadow-[0_0_30px_rgba(245,158,11,0.4)] md:mb-3 md:p-1">
                            <div class="rounded-full border-2 border-white/90 bg-white p-[3px] dark:border-amber-100/80">
                                <img :src="getOptimizedAvatar(user.avatar, user.name)" class="h-12 w-12 rounded-full object-cover object-center border border-amber-100 sm:h-14 sm:w-14 md:h-24 md:w-24" alt="Avatar" referrerpolicy="no-referrer">
                            </div>
                        </div>
                        <div class="mb-2 bg-[linear-gradient(135deg,#fde68a,#f59e0b,#f97316)] bg-clip-text text-center text-xl font-black leading-none text-transparent drop-shadow-[0_6px_16px_rgba(245,158,11,0.32)] sm:text-2xl md:mb-4 md:text-4xl">#{{ user.rank }}</div>
                        <h3 class="font-kantumruy mb-1 w-full text-center text-[11px] font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-xs md:text-lg">{{ user.name }}</h3>
                        <p class="mb-3 flex h-8 items-center justify-center px-0.5 text-center text-[8px] font-light italic leading-tight text-slate-400 line-clamp-2 sm:text-[9px] md:mb-5 md:h-10 md:text-xs">{{ user.bio || 'Share your story or motto...' }}</p>
                        <div class="rounded-full bg-amber-600 px-3 py-1.5 font-kantumruy text-[11px] font-black text-white shadow-[0_12px_24px_rgba(217,119,6,0.28)] ring-1 ring-amber-300/50 md:px-4 md:text-sm">{{ user.score }}</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                <div v-for="user in restUsers" :key="user.rank" @click="openUserProfile(user)" class="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:bg-blue-50/50 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_16px_34px_rgba(0,0,0,0.32)] dark:hover:border-sky-300/20 dark:hover:bg-slate-900 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.42)] md:p-4 flex flex-col items-center gap-2 md:gap-3">
                    <div class="absolute top-2 left-2 text-xs font-bold text-gray-300 dark:text-slate-500 md:left-3 md:text-sm">#{{ user.rank }}</div>
                    <div class="relative mt-2">
                        <img :src="getOptimizedAvatar(user.avatar, user.name)" class="h-12 w-12 rounded-full border-2 border-white object-cover object-center shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-800 dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] md:h-16 md:w-16" referrerpolicy="no-referrer">
                    </div>
                    <div class="text-center w-full mb-1">
                        <h4 class="px-1 font-kantumruy text-xs font-bold text-gray-800 truncate dark:text-slate-100 md:text-sm">{{ user.name }}</h4>
                    </div>
                    <div class="rounded-full bg-blue-50 px-4 py-1 font-kantumruy text-[11px] font-bold text-blue-700 dark:bg-sky-400/10 dark:text-sky-300 md:text-sm">{{ user.score }}</div>
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button @click="openModal" class="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-kantumruy px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm md:text-base">
                    មើលតារាងពេញ
                </button>
            </div>
        </div>
        
        <div v-else class="text-center py-20 text-gray-500">
             <h1 class="text-2xl font-bold mb-2">មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ</h1>
             <p>សូមចូលរួមឆ្លើយសំណួរដើម្បីក្លាយជាអ្នកនាំមុខគេប្រចាំសប្ដាហ៍!</p>
        </div>

    </div>

    <Teleport to="body">
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-full opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-full opacity-0">
        <div v-if="isModalOpen" class="fixed inset-0 z-[260] flex flex-col overflow-hidden bg-slate-100 font-kantumruy backdrop-blur-xl dark:bg-slate-950">
            
            <div class="z-10 border-b border-white/60 bg-white/85 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 md:py-6">
                <div class="max-w-4xl mx-auto flex flex-col gap-4">
                    
                    <div class="relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/90 px-5 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85">
                        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] animate-weekly-shimmer bg-[linear-gradient(90deg,transparent,#facc15,#f97316,#f59e0b,transparent)] bg-[length:220%_100%]"></div>
                        <h2 class="font-kantumruy text-base font-black text-slate-900 dark:text-slate-100 md:text-xl">តារាងពិន្ទុពេញ</h2>
                        <button @click="closeModal" class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                v-model="searchText"
                                placeholder="ស្វែងរកឈ្មោះសមាជិក..."
                                class="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 pl-12 pr-12 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] outline-none transition-all placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-400/15 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                            >
                        </div>
                        
                        <button @click="jumpToMe" title="find me" class="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-700 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-300/20 dark:bg-amber-400/10">
                            <img src="/icons/search/search.png" alt="find me" class="h-6 w-6 text-blue-600 group-hover:scale-[6] transition-transform">
                        </button>
                    </div>

                </div>
            </div>

            <div class="custom-scrollbar flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.96))] p-3 scroll-smooth dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.96))] md:p-5">
                <div class="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white/82 p-3 pb-20 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/78 md:p-6">
                    <div class="pointer-events-none absolute inset-x-0 top-0 h-[3px] animate-weekly-shimmer bg-[linear-gradient(90deg,transparent,#facc15,#f97316,#f59e0b,transparent)] bg-[length:220%_100%]"></div>
                    
                    <div class="mb-4 grid grid-cols-[4rem_1fr_5rem] items-center border-b border-slate-200/70 px-3 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400 md:grid-cols-[7rem_1fr_7rem] md:px-6 md:text-xs">
                        <div class="text-center">លេខ</div>
                        <div class="text-left">ឈ្មោះសមាជិក</div>
                        <div class="text-right">ពិន្ទុ</div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div 
                            v-for="user in filteredUsers" 
                            :key="user.rank"
                            :id="`user-row-${user.rank}`" 
                            @click="openUserProfile(user)"
                            class="group grid cursor-pointer grid-cols-[4rem_1fr_5rem] items-center rounded-2xl border p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)] md:grid-cols-[7rem_1fr_7rem] md:p-3"
                            :class="{
                                'border-amber-300/70 bg-gradient-to-r from-amber-50/95 via-white/90 to-white/80 dark:from-amber-400/20 dark:via-slate-900/88 dark:to-slate-900/78': user.rank === 1,
                                'border-slate-300/80 bg-gradient-to-r from-slate-100/95 via-white/90 to-white/80 dark:from-slate-300/15 dark:via-slate-900/88 dark:to-slate-900/78': user.rank === 2,
                                'border-orange-300/70 bg-gradient-to-r from-orange-50/95 via-white/90 to-white/80 dark:border-orange-300/40 dark:bg-gradient-to-r dark:from-orange-500/18 dark:via-slate-950/90 dark:to-slate-900/86': user.rank === 3,
                                'border-white/70 bg-white/88 hover:border-amber-200 dark:border-white/10 dark:bg-slate-950/46 dark:hover:border-amber-300/30': user.rank > 3
                            }"
                        >
                            <div class="flex justify-center">
                                <div
                                    class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ring-1 md:h-10 md:w-10 md:text-sm"
                                    :class="{
                                        'bg-amber-500 text-white shadow-[0_0_22px_rgba(245,158,11,0.35)] ring-amber-200': user.rank === 1,
                                        'bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-300 dark:text-slate-900': user.rank === 2,
                                        'bg-orange-400 text-white ring-orange-200': user.rank === 3,
                                        'bg-white text-amber-600 ring-amber-200 dark:bg-white/8 dark:text-amber-300 dark:ring-amber-300/25': user.rank > 3
                                    }"
                                >
                                    {{ user.rank }}
                                </div>
                            </div>

                            <div class="flex min-w-0 items-center gap-3 px-2 md:px-4">
                                <img :src="getOptimizedAvatar(user.avatar, user.name)" class="h-11 w-11 flex-shrink-0 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-slate-200/80 transition-transform group-hover:scale-105 dark:border-slate-800 dark:ring-white/10 md:h-12 md:w-12" alt="Avatar" referrerpolicy="no-referrer">
                                <div class="min-w-0">
                                    <h4 class="truncate text-[13px] font-black text-slate-900 dark:text-slate-100 md:text-base">{{ user.name }}</h4>
                                    <p class="truncate text-[10px] font-light text-slate-500 dark:text-slate-400 md:text-xs">{{ user.bio || 'Share your story or motto...' }}</p>
                                </div>
                            </div>

                            <div class="justify-self-end rounded-full bg-slate-900 px-3 py-1.5 text-right text-[13px] font-black text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)] dark:bg-amber-500 dark:text-slate-950 md:px-4 md:text-base">
                                {{ user.score }}
                            </div>
                        </div>

                        <div v-if="filteredUsers.length === 0" class="text-center text-gray-500 py-10">
                            រកមិនឃើញទិន្នន័យទេ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
    </Teleport>

    <Teleport to="body">
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="selectedUser" class="fixed inset-0 z-[280] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div @click="closeUserProfile" class="absolute inset-0"></div>
            
            <div class="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_24px_80px_rgba(0,0,0,0.58)]">
                
                <button @click="closeUserProfile" class="absolute top-4 right-4 z-20 rounded-full bg-white/60 p-2 text-gray-800 backdrop-blur-md transition-colors hover:bg-white dark:bg-slate-950/50 dark:text-slate-200 dark:hover:bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>

                <div class="relative h-32 bg-gradient-to-r from-blue-700 to-blue-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
                    <div class="absolute -bottom-4 right-6 z-10 rounded-full border-2 border-white bg-yellow-400 px-4 py-1 text-sm font-bold text-white shadow-lg dark:border-slate-900 dark:bg-amber-500 dark:text-slate-950">
                        Rank #{{ selectedUser.rank }}
                    </div>
                </div>

                <div class="relative flex flex-col items-center px-6 pb-6 pt-0 text-center">
                    
                    <div class="-mt-12 mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-slate-900 dark:bg-slate-950 dark:shadow-[0_18px_38px_rgba(0,0,0,0.45)]">
                        <img :src="getOptimizedAvatar(selectedUser.avatar, selectedUser.name)" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    </div>

                    <h2 class="mb-2 font-kantumruy text-xl font-bold text-gray-800 dark:text-slate-100">{{ selectedUser.name }}</h2>
                    <p class="mb-4 line-clamp-3 px-2 text-[13px] italic text-gray-500 dark:text-slate-400 md:text-sm">"{{ selectedUser.bio }}"</p>

                    <div class="mb-4 flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-sky-300/15 dark:bg-slate-950/55">
                        <span class="text-[13px] font-bold text-gray-600 dark:text-slate-300 md:text-sm">ពិន្ទុសប្ដាហ៍មុន</span>
                        <span class="font-kantumruy text-lg font-bold text-blue-800 dark:text-sky-300 md:text-xl">{{ selectedUser.score }}</span>
                    </div>

                    <div class="flex gap-3 justify-center" v-if="selectedUser.socials && selectedUser.socials.length > 0">
                        <a v-for="(link, idx) in selectedUser.socials" :key="idx" :href="link.url" target="_blank" 
                           class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                           :class="{
                             'bg-blue-600': link.type === 'facebook',
                             'bg-blue-400': link.type === 'telegram',
                             'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500': link.type === 'instagram',
                             'bg-black': link.type === 'tiktok'
                           }">
                            <svg v-if="link.type === 'facebook'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <svg v-if="link.type === 'telegram'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                            <svg v-if="link.type === 'instagram'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
                            <svg v-if="link.type === 'tiktok'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0-1 13.6 6.84 6.84 0 0 0 6.82-6.85V9.65a7.35 7.35 0 0 0 3.41 1.28V6.69z"/></svg>
                        </a>
                    </div>
                    <div v-else class="mt-2 text-[13px] italic text-gray-400 dark:text-slate-500">
                        មិនមានគណនីបណ្តាញសង្គមទេ
                    </div>
                </div>
            </div>
        </div>
    </transition>
    </Teleport>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-weekly-shimmer {
  animation: weeklyShimmer 2.8s linear infinite;
}

@keyframes weeklyShimmer {
  0% {
    background-position: 220% 0;
  }
  100% {
    background-position: -220% 0;
  }
}
</style>
