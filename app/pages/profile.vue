<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue';
import ECertificateMinimal from '@/components/ECertificateMinimal.vue';

useHead({
  script: [
    {
      src: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
      tagPosition: 'head'
    },
    {
      src: 'https://checkout-sandbox.payway.com.kh/plugins/checkout2-0.js',
      tagPosition: 'head'
    }
  ]
});

const config    = useRuntimeConfig();
const baseUrl   = config.public.apiBase; 
const { authToken, userData, clearAuth } = useAuthState();
const router    = useRouter();

const profileData  = ref(null);
const isLoading    = ref(true);
const fetchError   = ref(null);
const isUpgrading  = ref(false);
const isVideoExpanded = ref(false);
const payForm      = ref(null);

const payUrl = ref('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase');
const payData = ref({
    hash: '', tran_id: '', amount: '', firstname: '', lastname: '', phone: '', email: '', payment_option: '', merchant_id: '', req_time: ''
});

const defaultVideoUrl = 'https://pub-527694ac75464b31baaf7bf68a76d622.r2.dev/video/1.mp4';
const treeProgress = ref({
    total_score: 0,
    current_level: 1,
    level_name: 'គ្រាប់ពូជ',
    max_level: 11,
    next_level_score: 501,
    progress_percentage: 0,
    video_url: defaultVideoUrl
});

// ── QR Modal state (NEW) ──────────────────────────────────────
const showQr       = ref(false);
const qrLoading    = ref(false);
const qrImage      = ref('');
const qrTranId     = ref('');
const qrError      = ref('');
const qrCountdown  = ref(300);
let pollTimer      = null;
let countTimer     = null;

const qrTimeLabel = computed(() => {
    const m = Math.floor(qrCountdown.value / 60).toString().padStart(2, '0');
    const s = (qrCountdown.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
});

const stopTimers = () => {
    clearInterval(pollTimer);
    clearInterval(countTimer);
};

const closeQr = () => {
    stopTimers();
    showQr.value    = false;
    qrImage.value   = '';
    qrTranId.value  = '';
    qrError.value   = '';
    qrLoading.value = false;
    qrCountdown.value = 300;
};

const openExpandedVideo = () => {
    isVideoExpanded.value = true;
};

const closeExpandedVideo = () => {
    isVideoExpanded.value = false;
};

const handleSignOut = async () => {
    clearAuth();
    await router.push('/');
};
// ─────────────────────────────────────────────────────────────

const fetchProfile = async () => {
    isLoading.value  = true;
    fetchError.value = null;

    if (!authToken.value) {
        fetchError.value = 'អ្នកមិនទាន់បាន Login ទេ (Missing Auth Token)។';
        isLoading.value  = false;
        return;
    }

    try {
        const response = await $fetch(`${baseUrl}/user/profile-dashboard`, {
            headers: {
                'Accept':        'application/json',
                'Authorization': `Bearer ${authToken.value}`,
                'ngrok-skip-browser-warning': '1',
            }
        });

        const user = response?.user ?? response?.data ?? response ?? {};

        profileData.value = {
            name:          user.name          || user.full_name || user.username || 'Student',
            email:         user.email         || '',
            avatar:        user.avatar        || user.photo     || user.picture  || user.profile_photo_url || null,
            role:          user.role          || 'free',
            premium_until: user.premium_until || user.subscription_expires_at   || null,
            total_score:   user.total_score   || user.score     || user.xp       || 0,
            rank:          user.rank          || null,
            ...user,
        };

    } catch (err) {
        console.error('Failed to fetch profile:', err);
        fetchError.value = err?.data?.message || err?.message || 'មិនអាចទាញយកទិន្នន័យប្រវត្តិរូបបានទេ។';
    } finally {
        isLoading.value = false;
    }
};

const fetchTreeProgress = async () => {
    if (!authToken.value) return;

    try {
        const response = await $fetch(`${baseUrl}/tree-progress`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken.value}`,
                'ngrok-skip-browser-warning': '1',
            }
        });

        if (response) {
            treeProgress.value = {
                ...treeProgress.value,
                ...response,
                video_url: response.video_url || defaultVideoUrl,
            };
        }
    } catch (error) {
        console.error('Failed to fetch tree progress:', error);
        treeProgress.value.video_url = defaultVideoUrl;
    }
};

const getOptimizedAvatar = (url, name) => {
    const defaultName = name || 'User';
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=1e3a8a&color=fff`;
    if (url.includes('googleusercontent.com')) return url.split('=')[0] + '=s128-c';
    return url;
};

const certificateData = computed(() => ({
    name: profileData.value?.name || '',
    learnerId: profileData.value?.id ? `SCT-${profileData.value.id}` : '',
    email: profileData.value?.email || '',
    totalHours: '',
    solvedMcqs: '',
    totalSeason: '',
    totalSeasonRange: '',
    highestRank: profileData.value?.rank ? `Rank #${profileData.value.rank}` : '',
    treeOfLife: treeProgress.value?.current_level ? `Tree of Life LV.${treeProgress.value.current_level}` : '',
    effectiveDate: profileData.value?.joined_at || '',
}));

// ── handleUpgrade — replaced to show QR modal (NEW) ──────────
const handleUpgrade = async () => {
    isUpgrading.value = true;
    qrError.value     = '';
    showQr.value      = true;
    qrLoading.value   = true;
    qrImage.value     = '';
    qrTranId.value    = '';
    qrCountdown.value = 300;

    const headers = {
        'Accept':                     'application/json',
        'Authorization':              `Bearer ${authToken.value}`,
        'ngrok-skip-browser-warning': '1',
    };

    try {
        const data = await $fetch(`${baseUrl}/payway/get-qr`, {
            method:  'POST',
            headers,
        });

        console.log('[PayWay] response:', data);

        // ABA returns status.code as integer 0 or string '00' for success
        const abaCode = String(data?.status?.code ?? '');
        const isSuccess = abaCode === '0' || abaCode === '00';
        if (!isSuccess) {
            const raw = JSON.stringify(data).slice(0, 300);
            throw new Error(data?.status?.message || `ABA response: ${raw}`);
        }

        if (!data.qrImage) {
            throw new Error('ABA did not return a QR image. Response: ' + JSON.stringify(data).slice(0, 200));
        }

        qrImage.value  = data.qrImage;
        qrTranId.value = data.tran_id;
        qrLoading.value = false;

        // 5-min countdown
        countTimer = setInterval(() => {
            qrCountdown.value--;
            if (qrCountdown.value <= 0) {
                stopTimers();
                qrError.value   = 'QR Code ផុតកំណត់ — សូមចុចម្ដងទៀត';
                qrImage.value   = '';
                qrLoading.value = false;
            }
        }, 1000);

        // Poll every 3s — stop after 3 consecutive errors
        let pollErrors = 0;
        pollTimer = setInterval(async () => {
            try {
                const result = await $fetch(`${baseUrl}/payway/result`, {
                    params:  { tran_id: qrTranId.value },
                    headers,
                });
                pollErrors = 0;
                if (result.status === 'success') {
                    stopTimers();
                    closeQr();
                    await fetchProfile();
                } else if (result.status === 'failed') {
                    stopTimers();
                    qrImage.value = '';
                    qrError.value = 'ការទូទាត់ត្រូវបានបដិសេធ';
                }
            } catch (_) {
                pollErrors++;
                if (pollErrors >= 3) {
                    clearInterval(pollTimer);
                    console.warn('[PayWay] Polling stopped after 3 errors');
                }
            }
        }, 3000);

    } catch (err) {
        console.error('[PayWay] error:', err);
        qrError.value   = err?.data?.message || err?.message || 'មិនអាចភ្ជាប់ ABA Pay';
        qrLoading.value = false;
        qrImage.value   = '';
    } finally {
        isUpgrading.value = false;
    }
};
// ─────────────────────────────────────────────────────────────

onMounted(() => {
    fetchProfile();
    fetchTreeProgress();
});
onUnmounted(stopTimers);
</script>

<template>
  <div class="flex flex-1 flex-col font-kantumruy px-3 py-6 -mt-4 sm:px-4 sm:py-8 sm:-mt-8 lg:-mt-6">
    <div class="flex flex-1 flex-col w-full max-w-6xl mx-auto">

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p class="text-gray-500 font-bold">កំពុងទាញយកប្រវត្តិរូបរបស់អ្នក...</p>
      </div>

      <div v-else-if="fetchError" class="text-center py-20 text-red-500 bg-white/95 rounded-[2rem] shadow-[0_24px_70px_rgba(15,23,42,0.16)] p-8 border border-red-100 backdrop-blur-lg dark:border-red-400/20 dark:bg-slate-900/90">
        <p class="font-bold text-lg mb-4">{{ fetchError }}</p>
        <button @click="fetchProfile" class="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
          សាកល្បងម្ដងទៀត
        </button>
      </div>

      <div v-else-if="profileData" class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-stretch md:gap-8">
        <div class="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.22)] backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_32px_100px_rgba(0,0,0,0.55)] md:rounded-[2.5rem] md:p-12">
          <div class="absolute right-0 top-0 h-56 w-56 rounded-bl-full bg-gradient-to-bl from-blue-100/60 to-transparent dark:from-sky-500/10"></div>
          <div class="absolute bottom-0 left-0 h-40 w-40 rounded-tr-full bg-gradient-to-tr from-amber-100/70 to-transparent dark:from-amber-400/10"></div>
          <div class="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"></div>

          <div class="relative z-10 flex flex-col items-center text-center">

            <div class="relative mb-7">
              <div class="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl dark:bg-sky-300/15"></div>
              <img :src="getOptimizedAvatar(profileData.avatar, profileData.name)" referrerpolicy="no-referrer" class="relative h-32 w-32 rounded-full border-2 border-white object-cover shadow-[0_20px_50px_rgba(15,23,42,0.22),0_0_34px_rgba(96,165,250,0.22)] dark:border-white/80 dark:shadow-[0_22px_54px_rgba(0,0,0,0.48),0_0_36px_rgba(56,189,248,0.18)] md:h-40 md:w-40" />
            </div>

            <h1 class="mt-1 mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">{{ profileData.name }}</h1>
            <p class="mb-7 max-w-full truncate px-4 text-sm font-normal text-slate-400 dark:text-slate-400">{{ profileData.email }}</p>

            <div class="mb-8 grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center rounded-[1.5rem] border border-slate-200/70 bg-white/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_44px_rgba(0,0,0,0.28)]">
              <div class="text-center leading-tight">
                <p class="text-2xl font-black text-blue-600 dark:text-sky-300">{{ profileData.total_score || 0 }}</p>
                <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">ពិន្ទុ</p>
              </div>
              <div class="h-12 w-px bg-slate-200/80 dark:bg-white/10" aria-hidden="true"></div>
              <div class="text-center leading-tight">
                <p class="text-2xl font-black text-amber-500 drop-shadow-[0_0_14px_rgba(245,158,11,0.18)] dark:text-amber-300 dark:drop-shadow-[0_0_16px_rgba(251,191,36,0.28)]">#{{ profileData.rank || '–' }}</p>
                <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">ចំណាត់ថ្នាក់</p>
              </div>
            </div>

            <div v-if="profileData.role !== 'premium'" class="w-full max-w-sm">
              <!-- <div class="bg-gray-50 rounded-2xl p-4 mb-5 text-left border border-gray-100">
                <p class="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Premium រួមមាន</p>
                <div class="space-y-2">
                  <div v-for="f in premiumFeatures" :key="f" class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">✓</span>
                    {{ f }}
                  </div>
                </div>
              </div> -->

              <!-- Payment Options -->
              <!-- <div class="w-full bg-[#222222] p-5 rounded-2xl mt-4">
                <h3 class="text-white font-bold text-lg mb-4 text-left">Payment method</h3>
                
                <div class="border border-gray-600 rounded-lg p-3 flex items-center gap-4 mb-6 bg-[#1a1a1a]">
                  <img src="https://dev.angkordc.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fabakhqr.6904738a.png&w=3840&q=75" alt="ABA KHQR" class="w-[50px] h-[50px] rounded-xl object-contain shrink-0" />
                  <div class="text-left">
                    <h4 class="text-white font-bold text-[16px] mb-0.5">ABA KHQR</h4>
                    <p class="text-gray-400 text-[14px]">Scan to pay with any banking app</p>
                  </div>
                </div>

                <button 
                  @click="handleUpgrade" 
                  :disabled="isUpgrading"
                  class="w-full bg-[#a6a6ef] text-black font-bold text-[16px] py-3.5 rounded-md hover:bg-[#3f3fff] transition-colors active:scale-[0.98] flex justify-center items-center"
                >
                  <span v-if="!isUpgrading">Top Up</span>
                  <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </button>
              </div> -->

            </div>

            <div v-else class="w-full max-w-sm">
              <div class="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 text-center dark:border-amber-300/25 dark:from-amber-400/10 dark:to-slate-950/40">
                <p class="text-yellow-700 font-black text-lg">Premium User</p>
                <p class="text-yellow-500 text-sm mt-1" v-if="profileData.premium_until">
                  រហូតដល់ {{ profileData.premium_until }}
                </p>
                <div class="mt-4 space-y-1.5">
                  <div v-for="f in premiumFeatures" :key="f" class="flex items-center gap-2 text-sm text-yellow-700">
                    <span class="text-green-500">✓</span> {{ f }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="w-full self-stretch overflow-hidden rounded-[1.5rem] border-[3px] border-[#7dd3fc] bg-black shadow-[0_0_20px_rgba(125,211,252,0.5)] dark:shadow-[0_0_28px_rgba(125,211,252,0.36)] xl:mt-0 xl:h-full">
          <div class="relative aspect-[2.5/4] min-h-[24rem] w-full sm:min-h-[28rem] xl:h-full xl:min-h-0 xl:aspect-auto">
            <div class="absolute left-1/2 top-5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#1e3a8a] px-5 py-2 text-[11px] font-bold tracking-widest text-white shadow-lg">
              កម្រិតទី {{ treeProgress.current_level }} ៖ {{ treeProgress.level_name }}
            </div>

            <button
              type="button"
              class="absolute right-4 top-4 z-20 hidden items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-[11px] font-bold tracking-[0.14em] text-white shadow-lg backdrop-blur-md transition hover:bg-black/60 md:inline-flex"
              @click="openExpandedVideo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
              
            </button>

            <video
              :key="treeProgress.video_url"
              :src="treeProgress.video_url"
              autoplay
              loop
              muted
              playsinline
              class="absolute inset-0 z-10 h-full w-full object-cover"
            ></video>

            <div class="absolute bottom-4 left-1/2 z-20 w-3/4 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
              <div class="mb-1.5 flex justify-between text-[11px] font-bold text-white drop-shadow-md">
                <span>ឆ្ពោះទៅកម្រិតបន្ទាប់</span>
                <span>{{ treeProgress.progress_percentage }}%</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-600/50">
                <div class="h-full rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all duration-700" :style="{ width: `${treeProgress.progress_percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="md:col-span-3 xl:col-span-2 overflow-hidden rounded-[1.5rem]">
          <ECertificateMinimal
            :name="certificateData.name"
            :learner-id="certificateData.learnerId"
            :email="certificateData.email"
            :total-hours="certificateData.totalHours"
            :solved-mcqs="certificateData.solvedMcqs"
            :total-season="certificateData.totalSeason"
            :total-season-range="certificateData.totalSeasonRange"
            :highest-rank="certificateData.highestRank"
            :tree-of-life="certificateData.treeOfLife"
            :effective-date="certificateData.effectiveDate"
          />
        </div>

        <div class="md:col-span-3 xl:col-span-2 space-y-8">
          <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 relative overflow-hidden dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] dark:backdrop-blur-xl">
            <div class="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50 z-0 dark:from-slate-950/70 dark:to-slate-900/30 dark:opacity-100"></div>

            <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div class="space-y-6">
                <h3 class="font-kantumruy text-2xl text-gray-800 text-center dark:text-slate-100">"Tree of Life"</h3>
                <p class="text-gray-600 italic leading-relaxed text-md md:text-lg dark:text-slate-200">
                  "Tree of Life" ឬ "ដើមឈើជីវិត" តំណាងឱ្យការលូតលាស់នៃចំណេះដឹង។ ការសិក្សាប្រៀបដូចជាការដាំដើមឈើ ចាប់ផ្តើមពីគ្រាប់ពូជ រហូតដល់ក្លាយជាដើមឈើធំដែលផ្ដល់ផ្លែផ្កា។ ប្រព័ន្ធរបស់យើងប្រើប្រាស់វិធីសាស្ត្រ Gamification ដើម្បីធ្វើឱ្យការសិក្សាកាន់តែមានប្រសិទ្ធភាព។
                </p>
                <div class="flex justify-center md:justify-start items-center gap-6 md:gap-12 mt-4">
                  <div class="flex flex-col items-center">
                    <img :src="'/icons/tree_evolution/1.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Seedling">
                    <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">គ្រាប់ពូជ</span>
                  </div>
                  <div class="text-gray-300 dark:text-slate-500">➜</div>
                  <div class="flex flex-col items-center">
                    <img :src="'/icons/tree_evolution/2.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Sapling">
                    <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">កូនឈើ</span>
                  </div>
                  <div class="text-gray-300 dark:text-slate-500">➜</div>
                  <div class="flex flex-col items-center">
                    <img :src="'/icons/tree_evolution/3.png'" :class="'w-7 h-7 object-contain mb-4'" alt="Mature Tree">
                    <span class="font-kantumruy text-md md:text-lg text-gray-600 dark:text-slate-300">ដើមឈើធំ</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="w-full max-w-[400px] h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-500 dark:border-white/10 dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                  <img :src="'/icons/tree_evolution/4.png'" class="w-full h-full object-cover" alt="Tree">
                </div>
              </div>
            </div>
          </div>

          <div class="px-2">
            <div class="bg-white border-4 double-border-gold rounded-2xl p-8 md:p-12 text-center shadow-md relative max-w-4xl mx-auto dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
              <h2 class="font-kantumruy text-2xl leading-none text-red-800 mb-6">ការប្តេជ្ញាចិត្តរបស់យើង</h2>
              <p class="text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium text-md md:text-xl dark:text-slate-200">
                ការប្តេជ្ញាចិត្តដ៏មោះមុតបំផុតរបស់យើង គឺការរក្សានូវ «តម្លាភាព និងភាពត្រឹមត្រូវ» ជាដាច់ខាត ។ រាល់សំណួរ ចម្លើយ និង «ខ្លឹមសារសង្ខេប» ទាំងអស់នៅក្នុងប្រព័ន្ធនេះ មិនមែនជាការប្រឌិតឡើយ ប៉ុន្តែត្រូវបានចម្រាញ់ចេញពីឯកសារគោលនយោបាយ ច្បាប់ និងបទដ្ឋានយោងផ្លូវការដែលត្រូវបានផ្ទៀងផ្ទាត់យ៉ាងហ្មត់ចត់បំផុត។ យើងធានាជូននូវប្រភពឯកសារដែលច្បាស់លាស់ ដើម្បីឱ្យអ្នកសិក្សាទទួលបាននូវចំណេះដឹងដែលជាការពិត និងអាចយកទៅប្រើប្រាស់ជាផ្លូវការបានដោយទំនុកចិត្តខ្ពស់បំផុត។
              </p>
            </div>
          </div>
          <div class="flex justify-center px-2">
            <button
              type="button"
              @click="handleSignOut"
              class="group flex w-full max-w-4xl items-center justify-center gap-3 rounded-2xl border border-red-200 bg-white px-6 py-4 text-red-600 shadow-[0_18px_45px_rgba(239,68,68,0.1)] transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-[0_24px_55px_rgba(239,68,68,0.16)] dark:border-red-400/20 dark:bg-slate-900/80 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100 transition group-hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </span>
              <span class="text-base font-bold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-1 items-center justify-center text-center text-gray-400">
        <p>មិនមានទិន្នន័យត្រូវបង្ហាញទេ។</p>
      </div>

      <form ref="payForm" method="POST" target="aba_webservice" :action="payUrl" id="aba_merchant_request" style="display: none;">
          <input type="hidden" name="hash" :value="payData.hash" id="hash" />
          <input type="hidden" name="tran_id" :value="payData.tran_id" id="tran_id" />
          <input type="hidden" name="amount" :value="payData.amount" id="amount" />
          <input type="hidden" name="firstname" :value="payData.firstname" />
          <input type="hidden" name="lastname" :value="payData.lastname" />
          <input type="hidden" name="phone" :value="payData.phone" />
          <input type="hidden" name="email" :value="payData.email" />
          <input type="hidden" name="payment_option" :value="payData.payment_option" />
          <input type="hidden" name="merchant_id" :value="payData.merchant_id" />
          <input type="hidden" name="req_time" :value="payData.req_time" />
      </form>

    </div>
  </div>

  <!-- ── QR Payment Modal (NEW) ───────────────────────────── -->
  <Teleport to="body">
    <Transition name="qr-fade">
      <div
        v-if="isVideoExpanded"
        class="fixed inset-0 z-[9998] flex items-center justify-center overflow-auto p-4 font-kantumruy"
        style="background:rgba(2,6,23,0.88);backdrop-filter:blur(10px)"
        @click="closeExpandedVideo"
      >
        <div
          class="relative w-[min(92vw,34rem)] max-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border-[3px] border-[#7dd3fc] bg-black shadow-[0_0_40px_rgba(56,189,248,0.28)]"
          @click.stop
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-white backdrop-blur-md transition hover:bg-slate-800"
            @click="closeExpandedVideo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="relative aspect-[2.5/4] max-h-[calc(100vh-2rem)] w-full bg-black">
            <div class="absolute left-1/2 top-5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#1e3a8a] px-5 py-2 text-[11px] font-bold tracking-widest text-white shadow-lg">
              កម្រិតទី {{ treeProgress.current_level }} – {{ treeProgress.level_name }}
            </div>

            <video
              :key="`${treeProgress.video_url}-expanded`"
              :src="treeProgress.video_url"
              autoplay
              loop
              muted
              playsinline
              class="absolute inset-0 h-full w-full object-cover"
            ></video>

            <div class="absolute bottom-4 left-1/2 z-20 w-[72%] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
              <div class="mb-1.5 flex justify-between text-[11px] font-bold text-white drop-shadow-md">
                <span>ឆ្ពោះទៅកម្រិតបន្ទាប់</span>
                <span>{{ treeProgress.progress_percentage }}%</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-600/50">
                <div class="h-full rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all duration-700" :style="{ width: `${treeProgress.progress_percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="qr-fade">
      <div v-if="showQr"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-kantumruy"
        style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px)">

        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden" @click.stop>

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div>
              <p class="text-blue-300 text-[11px] font-bold uppercase tracking-widest">Subscription</p>
              <p class="text-white font-black text-base">Premium <span class="text-yellow-300">$2.00</span><span class="text-blue-300 text-sm font-normal">/ខែ</span></p>
            </div>
            <button @click="closeQr" class="text-blue-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="p-6">

            <!-- Loading -->
            <div v-if="qrLoading" class="flex flex-col items-center py-10 gap-3">
              <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p class="text-gray-500 font-bold text-sm">កំពុងបង្កើត QR Code...</p>
            </div>

            <!-- QR Image -->
            <div v-else-if="qrImage" class="flex flex-col items-center gap-4">

              <!-- Countdown -->
              <div class="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="text-amber-600 font-black font-mono text-sm">{{ qrTimeLabel }}</span>
                <span class="text-amber-500 text-xs">ផុតកំណត់</span>
              </div>

              <!-- QR -->
              <div class="border-2 border-gray-100 rounded-2xl p-3">
                <img :src="qrImage" alt="ABA QR Code" class="w-56 h-56 object-contain" />
              </div>

              <!-- Steps -->
              <div class="w-full bg-blue-50 rounded-2xl p-4 space-y-2">
                <p class="text-blue-800 font-black text-sm mb-2">របៀបទូទាត់</p>
                <div v-for="(s, i) in ['បើក ABA Mobile App','ចុច Scan QR','Scan QR Code ខាងលើ','បញ្ជាក់ $2.00']" :key="i" class="flex items-center gap-2">
                  <span class="w-5 h-5 bg-blue-600 text-white rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0">{{ i+1 }}</span>
                  <span class="text-blue-700 text-sm">{{ s }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 text-gray-400 text-xs">
                <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                រង់ចាំការបញ្ជាក់...
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="qrError" class="flex flex-col items-center py-6 gap-3 text-center">
              <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-3xl">⚠️</div>
              <p class="text-gray-800 font-black">មានបញ្ហាកើតឡើង</p>
              <p class="text-red-500 text-sm break-all">{{ qrError }}</p>
              <button @click="handleUpgrade" class="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-blue-700 transition text-sm">
                សាកល្បងម្ដងទៀត
              </button>
            </div>

          </div>

          <div class="px-6 pb-4 text-center">
            <p class="text-gray-300 text-[11px]">🔒 Secured by ABA PayWay</p>
          </div>
        </div>

        <!-- Click outside to close -->
        <div class="absolute inset-0 -z-10" @click="closeQr"></div>
      </div>
    </Transition>
  </Teleport>
  <!-- ─────────────────────────────────────────────────────── -->
</template>

<style scoped>
.qr-fade-enter-active, .qr-fade-leave-active { transition: opacity 0.2s ease; }
.qr-fade-enter-from, .qr-fade-leave-to { opacity: 0; }
</style>

<script>
const premiumFeatures = [
    'AI ChatBot គ្មានកំណត់',
    'ការវិភាគស្ថិតិប្រចាំសប្ដាហ៍',
    'វិញ្ញាបនប័ត្រជំនាញ',
    'ទាញយកមាតិការ PDF',
    'គ្មានការ Limit',
];
</script>
