<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const config = useRuntimeConfig();
const hasGoogleClientId = computed(() => !!config.public.googleClientId);

const user = useCookie('user_data', { maxAge: 60 * 60 * 24 * 30, path: '/' });
const authToken = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30, path: '/' });

const isProfileMenuOpen = ref(false);
const isLoading = ref(false);
const isLoginModalOpen = useState('loginModal', () => false);
const isCheckingSession = ref(!!authToken.value && !user.value);
const isEmbeddedBrowser = ref(false);
const copiedBrowserLink = ref(false);
const { theme, toggleTheme } = useTheme();

const openLoginModal = () => isLoginModalOpen.value = true;
const closeLoginModal = () => isLoginModalOpen.value = false;
const toggleProfileMenu = () => isProfileMenuOpen.value = !isProfileMenuOpen.value;

const handleSignOut = async () => {
  authToken.value = null;
  user.value = null;
  isProfileMenuOpen.value = false;
  await router.push('/');
};

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false;
};

const goToProfile = async () => {
  isProfileMenuOpen.value = false;
  await router.push('/profile');
};

const detectEmbeddedBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';

  return /FBAN|FBAV|Instagram|Messenger|Line\/|MicroMessenger|wv\)|Telegram|TikTok|Snapchat/i.test(ua);
};

const copyCurrentUrl = async () => {
  if (typeof window === 'undefined' || !navigator?.clipboard) return;

  try {
    await navigator.clipboard.writeText(window.location.href);
    copiedBrowserLink.value = true;
    window.setTimeout(() => {
      copiedBrowserLink.value = false;
    }, 2200);
  } catch (error) {
    console.error('មិនអាចចម្លងតំណភ្ជាប់បានទេ', error);
  }
};

const getOptimizedAvatar = (url, name) => {
  const defaultName = name || 'Guest';
  if (!url) return `https://ui-avatars.com/api/?name=${defaultName}&background=1e3a8a&color=fff`;

  if (url.includes('googleusercontent.com')) {
    return url.split('=')[0] + '=s120-c';
  }
  return url;
};

const handleImageError = (event) => {
  event.target.onerror = null;
  const name = encodeURIComponent(user.value?.name || 'User');
  event.target.src = `https://ui-avatars.com/api/?name=${name}&background=1e3a8a&color=fff&rounded=true&bold=true`;
};

onMounted(async () => {
  isEmbeddedBrowser.value = detectEmbeddedBrowser();

  if (authToken.value) {
    try {
      const data = await $fetch(`${config.public.apiBase}/user`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken.value}`,
        },
      });
      if (data) {
        user.value = data;
      }
    } catch (error) {
      console.error('Session sync issue:', error);
      if (error.response?.status === 401) {
        authToken.value = null;
        user.value = null;
      }
    } finally {
      isCheckingSession.value = false;
    }
  }
});

const handleGoogleLoginSuccess = async (response) => {
  try {
    isLoading.value = true;

    const data = await $fetch(`${config.public.apiBase}/auth/google/callback`, {
      method: 'POST',
      body: {
        credential: response.credential,
        driver: 'google',
      },
    });

    if (data.token) {
      authToken.value = data.token;
      user.value = data.user;
      closeLoginModal();
    }
  } catch (err) {
    console.error('Backend Verification Failed:', err);
    alert('មានបញ្ហាក្នុងការភ្ជាប់គណនី Google');
  } finally {
    isLoading.value = false;
  }
};

const menuItems = [
  { name: 'ទំព័រដើម', id: 'home', to: '/' },
  { name: 'វិញ្ញាសាប្រឡងក្របខណ្ឌ', id: 'exam', to: '/exam' },
  { name: 'អនុវត្តប្រចាំថ្ងៃ', id: 'daily', to: '/daily' },
  { name: 'ពិន្ទុសរុប', id: 'weekly', to: '/weekly' },
  { name: 'ប្រភពគោល', id: 'source', to: '/source' },

];

const isMenuItemActive = (to) => route.path === to;

watch(() => route.fullPath, () => {
  closeProfileMenu();
});
</script>

<template>
  <div class="relative w-full">
    <nav class="relative z-[140] border-b border-blue-500/60 bg-[#1e3a8a] text-white shadow-[0_14px_40px_rgba(30,58,138,0.28)] dark:border-white/10 dark:bg-[#10245f] dark:shadow-[0_18px_48px_rgba(2,6,23,0.42)]">
      <div class="mx-auto flex max-w-[120rem] flex-wrap items-center justify-between gap-y-3 px-3 py-3 md:px-6 lg:flex-nowrap lg:gap-6 lg:px-8">
        <div class="order-1 flex shrink-0 items-center">
          <NuxtLink to="/" class="flex h-14 items-center justify-center rounded-2xl px-2 transition-opacity hover:opacity-90 md:h-16 lg:h-[4.5rem]">
            <img src="/logo.png" alt="Logo" class="h-10 w-auto object-contain md:h-12 lg:h-[3.85rem]" />
          </NuxtLink>
        </div>

        <div class="order-2 lg:order-3 relative z-20 flex shrink-0 items-center justify-end gap-1.5 md:gap-3">
          <NuxtLink
            to="/chat"
            class="group flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 px-3 text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.42)] ring-1 ring-yellow-200/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(250,204,21,0.58)] md:h-11 md:gap-2 md:px-5"
          >
              <svg xmlns="http://www.w3.org/2000/svg" class="hidden shrink-0 text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] md:block md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="4" r="1"></circle>
              <line x1="12" y1="5" x2="12" y2="9"></line>
              <rect x="5" y="9" width="14" height="10" rx="3"></rect>
              <path d="M5 12H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1"></path>
              <path d="M19 12h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1"></path>
              <path d="M9 13h.01" stroke-width="2.5"></path>
              <path d="M15 13h.01" stroke-width="2.5"></path>
              <path d="M9.5 15.5a2.5 2.5 0 0 0 5 0"></path>
            </svg>
            <span class="whitespace-nowrap font-kantumruy text-[10px] font-bold tracking-wide text-white md:text-[14px] lg:text-[15px]">
              AI ChatBot
            </span>
          </NuxtLink>

          <NuxtLink
            to="/pricing"
            class="group flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-violet-300/35 bg-gradient-to-r from-violet-500 to-indigo-500 px-3 text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-[1.02] hover:from-violet-400 hover:to-indigo-400 hover:shadow-[0_0_28px_rgba(129,140,248,0.48)] md:h-11 md:gap-2 md:px-5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="hidden h-5 w-5 shrink-0 md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1v22"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span class="whitespace-nowrap font-kantumruy text-[10px] font-bold tracking-wide md:text-[14px] lg:text-[15px]">
              Pricing
            </span>
          </NuxtLink>

          <button
            type="button"
            class="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-300/55 bg-white/12 text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_26px_rgba(15,23,42,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-200 hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-yellow-300/70 dark:border-yellow-300/55 dark:bg-slate-950/65 dark:text-sky-100 md:h-11 md:w-11"
            :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="theme === 'dark'"
            @click="toggleTheme"
          >
            <span class="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_65%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"></span>
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="relative z-10 h-4 w-4 fill-current drop-shadow-[0_0_10px_rgba(186,230,253,0.55)] md:h-5 md:w-5" viewBox="0 0 24 24">
              <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="relative z-10 h-4 w-4 drop-shadow-[0_0_10px_rgba(252,211,77,0.55)] md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
          </button>

          <ClientOnly>
            <div v-if="isCheckingSession" class="h-10 w-10 animate-pulse rounded-full bg-blue-800/50 ring-1 ring-blue-700/40 md:h-11 md:w-11"></div>

            <div v-else-if="user" class="relative shrink-0">
              <button @click="toggleProfileMenu" class="flex items-center gap-2 rounded-full focus:outline-none transition-transform hover:scale-105">
                <div class="h-10 w-10 overflow-hidden rounded-full border-2 border-yellow-400 shadow-md md:h-11 md:w-11">
                  <img :src="getOptimizedAvatar(user?.avatar, user?.name)" @error="handleImageError" alt="Profile" class="h-full w-full object-cover bg-white" referrerpolicy="no-referrer">
                </div>
              </button>

              <div v-if="isProfileMenuOpen" @click.stop class="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.24)] backdrop-blur-xl z-[160] animate-fade-in-up dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
                <div class="rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5">
                  <p class="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{{ user?.name }}</p>
                  <p class="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{{ user?.email }}</p>
                </div>

                <div class="my-2 h-px bg-slate-200/80 dark:bg-white/10"></div>

                <button
                  type="button"
                  @click="goToProfile"
                  class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 font-kantumruy dark:text-slate-200 dark:hover:bg-sky-400/10 dark:hover:text-sky-200"
                >
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                    </svg>
                  </span>
                  <span>គណនីរបស់ខ្ញុំ</span>
                </button>

                <button type="button" @click="handleSignOut" class="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 font-siemreap dark:text-red-300 dark:hover:bg-red-500/10">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100 transition group-hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="m16 17 5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                  </span>
                  <span>ចាកចេញ</span>
                </button>
              </div>

            </div>

            <button
              v-else
              @click="openLoginModal"
              class="flex h-8 min-w-[88px] shrink-0 items-center justify-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 font-kantumruy text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-all hover:bg-white/16 hover:border-white/45 md:h-11 md:min-w-[120px] md:gap-2 md:px-5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0 md:h-5 md:w-5">
                <line x1="15" y1="12" x2="3" y2="12"></line>
                <polyline points="10 7 15 12 10 17"></polyline>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              </svg>
              <span class="whitespace-nowrap text-[10px] font-semibold md:text-[14px] lg:text-[15px]">Login</span>
            </button>

            <template #fallback>
              <div class="h-10 w-10 animate-pulse rounded-full bg-white/10 ring-1 ring-white/10 md:h-11 md:w-11"></div>
            </template>
          </ClientOnly>
        </div>

        <div class="order-3 flex w-full items-center justify-start gap-1 overflow-x-auto border-t border-blue-700/50 pt-1.5 hide-scrollbar sm:gap-1.5 lg:order-2 lg:mt-0 lg:flex-1 lg:justify-center lg:gap-5 lg:border-transparent lg:pt-0">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 font-kantumruy text-[11px] font-medium leading-6 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-yellow-300 sm:px-3 sm:text-[12px] lg:px-5 lg:py-2 lg:text-[1.05rem]"
            :class="isMenuItemActive(item.to) ? 'bg-white/10 text-yellow-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : ''"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="relative flex h-10 items-center overflow-hidden border-t border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white dark:border-white/10 dark:from-slate-900 dark:to-blue-950">
      <div class="absolute flex w-full items-center overflow-hidden">
        <div class="animate-marquee flex items-center whitespace-nowrap font-kantumruy">
          <span class="mr-4 pt-1 text-sm text-yellow-300 md:text-lg">ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា សូមស្វាគមន៍!</span>
          <span class="pt-1 text-sm md:text-lg">ភាពជោគជ័យដ៏អស្ចារ្យ ផ្ដើមចេញពីការយល់ដឹងអំពីឫសគល់នៃជាតិ និងស្រុកទេសរបស់ខ្លួនបានច្បាស់ល្អ។</span>
        </div>
      </div>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="isLoginModalOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div @click.self="closeLoginModal" class="absolute inset-0"></div>
            <div class="relative flex w-full max-w-[480px] flex-col items-center rounded-3xl bg-white p-8 shadow-2xl md:p-12 dark:border dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <button @click="closeLoginModal" class="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="mb-6 mt-4">
                <img src="/logo.png" alt="Logo" class="w-32 object-contain md:w-40" />
              </div>

              <h2 class="mb-6 text-center font-kantumruy text-xl font-bold tracking-tight text-[#1e3a8a] md:text-3xl dark:text-slate-100">
                ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា
              </h2>

              <div class="relative mb-6 flex w-full flex-col items-center justify-center">
              <div v-if="isLoading" class="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80 dark:bg-slate-950/75">
                <div class="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>

              <div
                v-if="isEmbeddedBrowser"
                class="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left dark:border-amber-300/25 dark:bg-amber-400/10"
              >
                <p class="font-kantumruy text-sm font-bold text-amber-900 dark:text-amber-100">
                  ការចូលប្រើ Google មិនទាន់គាំទ្រលើ Browser នេះទេ
                </p>
                <p class="mt-2 font-kantumruy text-sm leading-6 text-amber-800/80 dark:text-amber-100/80">
                  សូមបើកក្នុង Chrome ឬ Safari ដើម្បីអាចចូលប្រើតាម Google បាន។
                </p>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                  >
                    បើកក្នុង Browser
                  </a>
                  <button
                    type="button"
                    @click="copyCurrentUrl"
                    class="inline-flex items-center justify-center rounded-full border border-amber-300/70 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 dark:border-amber-300/30 dark:text-amber-100 dark:hover:bg-amber-300/10"
                  >
                    {{ copiedBrowserLink ? 'បានចម្លងតំណភ្ជាប់' : 'ចម្លងតំណភ្ជាប់' }}
                  </button>
                </div>
              </div>

              <div v-else-if="hasGoogleClientId" class="transform transition-transform duration-300 hover:scale-105">
                <GoogleLogin :client-id="config.public.googleClientId" :callback="handleGoogleLoginSuccess" />
              </div>

              <div v-else class="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center font-kantumruy text-sm text-amber-800">
                មិនអាចចូលប្រើតាម Google បានទេ ដោយសារមិនទាន់បានកំណត់ `GOOGLE_CLIENT_ID`។
              </div>
            </div>

              <div class="space-y-2 text-center">
                <p class="font-serif text-sm font-medium italic text-gray-500 md:text-lg">"Know yourself, Know your country."</p>
                <p class="font-kantumruy text-sm text-gray-400 md:text-lg">ស្គាល់ខ្លួនឯង ស្គាល់ប្រទេសជាតិ</p>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.animate-marquee {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-100%, 0); }
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out;
}
</style>
