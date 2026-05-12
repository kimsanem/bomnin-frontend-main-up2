<script setup>
useHead({
  title: 'អនុវត្តប្រចាំថ្ងៃ',
});
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QuizExplanationModal from '@/components/QuizExplanationModal.vue';
import QuizResultModal from '@/components/QuizResultModal.vue';

const router = useRouter();
const { authToken, userData: user } = useAuthState();

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const isSubscribed = computed(() => user.value?.role === 'premium' || user.value?.role === 'admin');

const isLoginModalOpen = useState('loginModal');
const openLoginModal = () => isLoginModalOpen.value = true;
const { open: openSubscribe } = useSubscribeModal();

// ហៅទិន្នន័យពេល Load ទំព័រដំបូង
const { data: apiResponse, pending, error } = await useFetch(`${baseUrl}/daily-quiz`, {
    headers: {
        'Accept': 'application/json',
        'Authorization': authToken.value ? `Bearer ${authToken.value}` : ''
    }
});

const rawQuestions = ref([]);
const pendingQuestions = ref([]);
const isFinished = ref(false);
const isLimitReached = ref(false); 
const selectedAnswer = ref(null);
const isAnswerChecked = ref(false); 
const showExplanationModal = ref(false);
const showResultModal = ref(false);
const debugShowResultModal = ref(false);
const elapsedSeconds = ref(0);
const totalElapsedSeconds = ref(0);
const questionTimerStartedAt = ref(null);
const timerInterval = ref(null);
const isTimerPaused = ref(false);
const hasSessionStarted = ref(false);
const hasShownCompletionModal = ref(false);
const pauseReasons = new Set();
const averageQuestionTime = 75;
const resultSnapshot = ref({
    score: 0,
    timeSpent: 0,
});

// 🔥 ប្រើប្រាស់អថេរ ៣ នេះដើម្បីគ្រប់គ្រង Progress ប្រចាំថ្ងៃ
// - sessionAttempted: ចំនួនសំណួរដែលបានឆ្លើយ (ត្រូវ + ខុស) — ប្រើសម្រាប់លេខសំណួរ
// - sessionScore: ចំនួនឆ្លើយត្រូវ — ប្រើសម្រាប់ Score
const sessionAttempted = ref(0);
const sessionScore = ref(0);
const dailyLimit = ref(100);

// Countdown to next Asia/Phnom_Penh midnight (UTC+7, no DST) for the
// "completed — try again in 24h" screen. Ticks once per second on the client.
const PP_OFFSET_SECONDS = 7 * 3600;
const nowMs = ref(Date.now());
let countdownInterval = null;
const startCountdown = () => {
    if (!import.meta.client || countdownInterval) return;
    nowMs.value = Date.now();
    countdownInterval = setInterval(() => { nowMs.value = Date.now(); }, 1000);
};
const stopCountdown = () => {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
};
const secondsUntilReset = computed(() => {
    const nowS = Math.floor(nowMs.value / 1000);
    const ppDay = Math.floor((nowS + PP_OFFSET_SECONDS) / 86400);
    const nextResetS = (ppDay + 1) * 86400 - PP_OFFSET_SECONDS;
    return Math.max(0, nextResetS - nowS);
});
const formattedResetCountdown = computed(() => {
    const s = secondsUntilReset.value;
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
});

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Only sync sessionAttempted / sessionScore from the backend on the *initial*
// load. Mid-session, the frontend's optimistic counter is canonical: each
// answered question increments it locally. If we re-synced on every batch
// fetch, a slow /save-progress (still in flight when /daily-quiz GET runs)
// would make today_answered lag the local count and the UI would jump
// backwards — which is the "back to question 1" bug.
const hasSyncedFromBackend = ref(false);

watch(apiResponse, (newData) => {
  if (!newData) return;

  if (!hasSyncedFromBackend.value) {
      sessionAttempted.value = newData.today_answered || 0;
      sessionScore.value = newData.current_score || 0;
      hasSyncedFromBackend.value = true;
  }
  dailyLimit.value = newData.daily_limit || 100;

  if (newData.limit_reached) {
      isLimitReached.value = true;
  } else if (newData.questions && newData.questions.length > 0) {
      rawQuestions.value = newData.questions;
      pendingQuestions.value = shuffleArray(newData.questions);
  } else {
      isFinished.value = true;
  }
}, { immediate: true });

const currentQ = computed(() => pendingQuestions.value[0]);

// 🔥 គណនាភាគរយផ្អែកលើ កូតាជាក់ស្ដែង (50 ឬ 100)
const progressPercent = computed(() => (sessionAttempted.value / dailyLimit.value) * 100);
const formattedElapsedTime = computed(() => formatDuration(elapsedSeconds.value));
const formattedResultTime = computed(() => formatDuration(resultSnapshot.value.timeSpent));
const isFastRun = computed(() => resultSnapshot.value.timeSpent > 0 && resultSnapshot.value.timeSpent <= averageQuestionTime);
const isSessionComplete = computed(() => isLimitReached.value || isFinished.value || (!pending.value && !error.value && rawQuestions.value.length === 0));
const isResultModalVisible = computed(() => debugShowResultModal.value || showResultModal.value);
const resultAccuracy = computed(() => {
    if (!sessionAttempted.value) return 0;
    return Math.round((resultSnapshot.value.score / sessionAttempted.value) * 100);
});

const isEnglishSubject = ref(false); 

const getOptionLabel = (key) => {
    const khmerMap = { 'A': 'ក.', 'B': 'ខ.', 'C': 'គ.', 'D': 'ឃ.' };
    return khmerMap[key] || key + '.';
};

const toKhmerNumeral = (num) => {
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return num.toString().split('').map(digit => khmerDigits[digit] || digit).join('');
};

const formatDuration = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
    const secs = String(safeSeconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
};

const stopTimer = () => {
    if (!import.meta.client) return;
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    }
};

const startTimer = (reset = false) => {
    if (!import.meta.client) return;
    if (reset || !hasSessionStarted.value || !questionTimerStartedAt.value) {
        elapsedSeconds.value = 0;
        questionTimerStartedAt.value = Date.now();
        hasSessionStarted.value = true;
        hasShownCompletionModal.value = false;
        isTimerPaused.value = false;
    }

    stopTimer();
    timerInterval.value = setInterval(() => {
        if (!questionTimerStartedAt.value) return;
        elapsedSeconds.value = Math.floor((Date.now() - questionTimerStartedAt.value) / 1000);
    }, 1000);
};

const pauseTimer = (reason = 'manual') => {
    pauseReasons.add(reason);
    stopTimer();
    if (reason === 'manual') {
        isTimerPaused.value = true;
    }
};

const resumeTimer = (reason = 'manual') => {
    pauseReasons.delete(reason);

    if (reason === 'manual') {
        isTimerPaused.value = false;
    }

    if (!hasSessionStarted.value || pauseReasons.size > 0) return;
    questionTimerStartedAt.value = Date.now() - (elapsedSeconds.value * 1000);
    startTimer();
};

const toggleTimerPause = () => {
    if (isTimerPaused.value) {
        resumeTimer('manual');
        return;
    }
    pauseTimer('manual');
};

const resumeTimerForNextQuestion = () => {
    if (!hasSessionStarted.value || showResultModal.value || showExplanationModal.value) return;
    if (pauseReasons.has('manual')) {
        resumeTimer('manual');
        return;
    }
    if (!timerInterval.value && pauseReasons.size === 0) {
        startTimer();
    }
};

const normalizedCorrectAnswer = computed(() => {
    const rawAnswer = currentQ.value?.correct_answer;
    if (!rawAnswer) return null;
    const cleanAnswer = rawAnswer.toUpperCase().replace('.', '').trim();
    const reverseKhmerMap = { 'ក': 'A', 'ខ': 'B', 'គ': 'C', 'ឃ': 'D' };
    return reverseKhmerMap[cleanAnswer] || cleanAnswer;
});

const isCorrectAnswer = computed(() => selectedAnswer.value === normalizedCorrectAnswer.value);

const selectOption = async (key) => {
    if (isAnswerChecked.value) return;
    selectedAnswer.value = key;
    isAnswerChecked.value = true;

    if (authToken.value && currentQ.value) {
        try {
            // 🔥 ប្រើ $fetch ដើម ដើម្បីធានាថាការ Save ដើរ 100%
            await $fetch(`${baseUrl}/save-progress`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken.value}`
                },
                body: {
                    question_id: currentQ.value.id,
                    is_correct: isCorrectAnswer.value === true,
                    source: 'daily'
                }
            });
        } catch (err) {
            console.error("កំហុសក្នុងការ Save:", err);
        }
    }
};

const handleMainAction = () => {
    if (!isAnswerChecked.value) return;
    showExplanationModal.value = true;
};

const handleModalNext = async () => {
    showExplanationModal.value = false;

    setTimeout(async () => {
        totalElapsedSeconds.value += elapsedSeconds.value;
        // 🔥 លេខសំណួរកើនឡើងរាល់ការឆ្លើយ (ត្រូវឬខុស) — ដូច slug quiz
        sessionAttempted.value++;
        if (isCorrectAnswer.value) {
            sessionScore.value++;
        }

        pendingQuestions.value.shift();

        if (pendingQuestions.value.length === 0) {
            await fetchMoreQuestions();
        }
        resetQuestionState();
        resumeTimerForNextQuestion();
    }, 300);
};

// 🔥 ជួសជុលមុខងារទាញសំណួរបន្ថែម ដោយប្រើ $fetch ដើម
const fetchMoreQuestions = async () => {
    try {
        const response = await $fetch(`${baseUrl}/daily-quiz`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken.value}`
            }
        });

        // បោះទិន្នន័យទៅកាន់ watch() ដើម្បីធ្វើការ Update Progress និង Limit ដោយស្វ័យប្រវត្តិ
        apiResponse.value = response;

    } catch (err) {
        console.error(err);
    }
};

const resetQuestionState = () => {
    selectedAnswer.value = null;
    isAnswerChecked.value = false;
};

const handleModalStop = () => {
    showExplanationModal.value = false;
    if(confirm("តើអ្នកពិតជាចង់បញ្ឈប់ការអនុវត្តនេះមែនទេ?")) {
        stopTimer();
        isTimerPaused.value = false;
        router.back();
    }
};

watch(currentQ, (newQuestion) => {
    if (newQuestion && !hasSessionStarted.value) {
        startTimer(true);
        return;
    }

    if (newQuestion && hasSessionStarted.value && !timerInterval.value && !showResultModal.value && !isTimerPaused.value) {
        startTimer();
    }
}, { immediate: true });

watch(showResultModal, (isOpen) => {
    if (isOpen) {
        pauseTimer('result');
        isTimerPaused.value = false;
    }
});

watch(showExplanationModal, (isOpen) => {
    if (isOpen) {
        pauseTimer('explanation');
    } else {
        resumeTimer('explanation');
    }
});

watch(isSessionComplete, (isComplete) => {
    if (!isComplete) {
        stopCountdown();
        return;
    }
    startCountdown();

    if (!hasSessionStarted.value || hasShownCompletionModal.value) return;

    stopTimer();
    resultSnapshot.value = {
        score: sessionScore.value,
        timeSpent: totalElapsedSeconds.value,
    };
    showResultModal.value = true;
    hasShownCompletionModal.value = true;
}, { immediate: true });

onMounted(() => {
    if (isSessionComplete.value) startCountdown();
});

onBeforeUnmount(() => {
    stopTimer();
    stopCountdown();
});

const getOptionBoxClass = (key) => {
    const isCorrect = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;

    if (!isAnswerChecked.value) {
        return isSelected
            ? 'border-slate-400 bg-slate-50 dark:border-violet-300/70 dark:bg-violet-400/10'
            : 'border-gray-200 bg-white hover:border-violet-300 dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-violet-300/35 dark:hover:bg-slate-900/85';
    } else {
        if (isCorrect) return 'border-[#22c55e] border-2 bg-[#f0fdf4] z-10 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400';
        if (isSelected && !isCorrect) return 'border-[#ef4444] border-2 bg-[#fef2f2] z-10 dark:bg-red-500/15 dark:border-red-400';
        return 'border-gray-200 bg-white opacity-50 pointer-events-none dark:border-white/10 dark:bg-slate-950/45';
    }
};

const getRadioCircleClass = (key) => {
    const isCorrect = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;

    if (!isAnswerChecked.value) {
         return isSelected ? 'border-[#7c3aed] dark:border-violet-300' : 'border-gray-300 dark:border-slate-600';
    } else {
        if (isCorrect) return 'border-[#22c55e] dark:border-emerald-400';
        if (isSelected && !isCorrect) return 'border-[#ef4444] dark:border-red-400';
        return 'border-gray-200 dark:border-slate-700';
    }
};

const getOptionTextClass = (key) => {
    const isCorrect = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;

    if (!isAnswerChecked.value) {
        return isSelected ? 'text-[#7c3aed] font-medium dark:text-violet-200' : 'text-gray-800 dark:text-slate-100';
    } else {
        if (isCorrect) return 'text-[#166534] font-bold dark:text-emerald-300';
        if (isSelected && !isCorrect) return 'text-[#991b1b] font-bold dark:text-red-300';
        return 'text-gray-500 dark:text-slate-400';
    }
};
</script>

<template>
  <div class="bg-transparent font-kantumruy flex flex-1 flex-col px-4">
    <div class="flex flex-1 flex-col w-full max-w-3xl mx-auto space-y-5">
      
      <div v-if="pending" class="flex flex-1 flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 dark:bg-slate-900/85">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600"></div>
      </div>

      <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-white/10 dark:bg-slate-900/85">
         <template v-if="error.statusCode === 401">
             <h1 class="text-2xl font-bold mb-3 text-red-500">តម្រូវឱ្យចូលគណនី</h1>
             <p class="text-gray-600 mb-6 dark:text-slate-300">អ្នកត្រូវតែភ្ជាប់គណនី (Login) ជាមុនសិនទើបអាចអនុវត្តបាន។</p>
             <button @click="openLoginModal" class="bg-violet-600 text-white px-8 py-3 rounded-full shadow-md hover:bg-violet-700 transition-colors">ចូលគណនីឥឡូវនេះ</button>
         </template>
         <template v-else>
             <h1 class="text-2xl text-red-500 font-bold mb-2 dark:text-red-300">មិនមានទិន្នន័យទេ</h1>
             <button @click="router.push('/')" class="bg-violet-600 text-white px-6 py-2.5 rounded-full mt-5 shadow-md hover:bg-violet-700">ត្រឡប់ទៅទំព័រដើម</button>
         </template>
      </div>

      <div v-else-if="(isLimitReached || isFinished || (!pending && !error && rawQuestions.length === 0)) && !isResultModalVisible" class="flex flex-1 flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm p-8 border border-gray-100 animate-fade-in dark:border-white/10 dark:bg-slate-900/85">
         <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-400/15">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-emerald-600 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>

         <h1 class="text-2xl font-bold mb-2 text-gray-800 dark:text-slate-100">បញ្ចប់ការអនុវត្តប្រចាំថ្ងៃ!</h1>
         <p class="text-gray-600 mb-2 dark:text-slate-300">
             អ្នកបានឆ្លើយ <span class="font-bold text-violet-600 dark:text-violet-300">{{ toKhmerNumeral(sessionAttempted) }}/{{ toKhmerNumeral(dailyLimit) }}</span>
             — ពិន្ទុប្រចាំថ្ងៃ <span class="font-bold text-emerald-600 dark:text-emerald-300">{{ sessionScore }}</span>
         </p>
         <p class="text-gray-500 mb-4 dark:text-slate-400">សំណួរថ្មីនឹងបន្តក្នុងរយៈពេល ២៤ ម៉ោងទៀត</p>

         <div class="mb-6 inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 dark:border-violet-300/20 dark:bg-violet-400/10">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-violet-500 dark:text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <circle cx="12" cy="12" r="9" />
                 <path d="M12 7v5l3 2" />
             </svg>
             <span class="font-mono text-2xl font-black tracking-[0.16em] text-violet-700 dark:text-violet-200 tabular-nums">{{ formattedResetCountdown }}</span>
         </div>

         <button @click="router.push('/')" class="bg-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-violet-700 transition-colors">ត្រឡប់ទៅទំព័រដើម</button>
      </div>

      <div v-else-if="!isFinished && !isLimitReached && currentQ" class="space-y-4 py-6 md:py-8 animate-fade-in">

        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm p-3 px-6 flex flex-col justify-center dark:border-white/10 dark:bg-slate-900/85">
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-800 font-bold text-sm md:text-[15px] tracking-wide dark:text-slate-100">
                    អនុវត្តប្រចាំថ្ងៃ ({{ toKhmerNumeral(Math.min(sessionAttempted + 1, dailyLimit)) }}/{{ toKhmerNumeral(dailyLimit) }})
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-1 text-sm font-semibold italic text-amber-700 shadow-sm dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200 md:text-[15px]">
                    Score: <span class="text-red-600 dark:text-red-400">{{ sessionScore }}</span>
                </span>
            </div>
            <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-800">
                <div class="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" :style="{ width: `${progressPercent}%` }"></div>
            </div>
        </div>

        <div class="flex items-center justify-between gap-3 px-1 py-1">
            <p class="status-badge mr-2 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur-sm dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200">
                ការអនុវត្តបានចាប់ផ្តើម
            </p>
            <div class="flex items-center gap-2">
            <button
                type="button"
                @click="toggleTimerPause"
                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-amber-300/70 bg-white/80 px-3 text-amber-600 shadow-sm transition hover:border-amber-300 hover:text-amber-600 dark:border-amber-300/40 dark:bg-slate-900/80 dark:text-amber-200 dark:hover:border-amber-300/40 dark:hover:text-amber-200"
                :aria-label="isTimerPaused ? 'Resume timer' : 'Pause timer'"
            >
                <svg v-if="isTimerPaused" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Z" />
                </svg>
                <span class="text-xs font-bold">
                    {{ isTimerPaused ? 'បន្ត' : 'ផ្អាក' }}
                </span>
            </button>
            <div class="inline-flex items-center gap-1.5 rounded-full bg-slate-800/30 px-3 py-1 text-amber-200 ring-1 ring-amber-300/20 backdrop-blur-md">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" :class="isTimerPaused ? '' : 'animate-[tick_1.2s_ease-in-out_infinite]'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M12 7.5v5l3 2" />
                    </svg>
                </span>
                <span class="font-mono text-[11px] font-semibold tracking-[0.12em] sm:text-sm sm:tracking-[0.18em]">
                    {{ formattedElapsedTime }}
                </span>
            </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative pb-4 dark:border-white/10 dark:bg-slate-900/85">
            <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-violet-500 z-10"></div>
            
            <div class="bg-violet-50 p-3 pl-8 md:pl-10 flex items-start gap-4 border-b border-violet-100 z-0 dark:border-violet-300/20 dark:bg-violet-950/70">
                <div class="w-9 h-9 md:w-10 md:h-10 shrink-0 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-[3px] border-white shadow-sm mt-0.5 dark:border-violet-200/20">
                    {{ toKhmerNumeral(Math.min(sessionAttempted + 1, dailyLimit)) }}
                </div>
                <h2 class="text-gray-900 font-bold text-base md:text-[17px] leading-relaxed mt-1 md:mt-1.5 dark:text-violet-50">
                    {{ currentQ.question_text }}
                </h2>
            </div>

            <div class="p-5 md:p-6 pl-8 md:pl-10 flex flex-col gap-3.5 bg-white z-0 relative dark:bg-slate-900/85">
                <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-violet-500 z-10"></div>
                <div 
                    v-for="(text, key) in currentQ.options" 
                    :key="key"
                    @click="selectOption(key)"
                    class="relative rounded-xl p-3.5 pl-[52px] transition-all duration-300 cursor-pointer border"
                    :class="getOptionBoxClass(key)"
                >
                    <div class="absolute left-[16px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center bg-white shadow-sm dark:bg-slate-950"
                        :class="getRadioCircleClass(key)">
                        <div v-if="!isAnswerChecked && selectedAnswer === key" class="w-[10px] h-[10px] bg-violet-600 rounded-full"></div>
                        <div v-else-if="isAnswerChecked && key === normalizedCorrectAnswer" class="w-[10px] h-[10px] bg-[#22c55e] rounded-full"></div>
                        <div v-else-if="isAnswerChecked && selectedAnswer === key && key !== normalizedCorrectAnswer" class="w-[10px] h-[10px] bg-[#ef4444] rounded-full"></div>
                    </div>
                    <p class="text-[15px] md:text-base leading-relaxed tracking-wide" :class="getOptionTextClass(key)">
                       <span class="mr-1.5">{{ getOptionLabel(key) }}</span> {{ text }}
                    </p>
                </div>
            </div>

            <div class="px-5 md:px-6 pl-8 md:pl-10 flex justify-center z-0 relative">
                <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-violet-500 z-10"></div>
                
                <button 
                    @click="handleMainAction"
                    :disabled="!isAnswerChecked"
                    class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-[15px] tracking-wide transition-all duration-200 shadow-sm"
                    :class="(!isAnswerChecked) ? 'bg-gray-400 cursor-not-allowed shadow-none dark:bg-slate-700 dark:text-slate-300' : 'bg-violet-600 hover:bg-violet-700 active:scale-[0.98]'"
                >
                    ពិនិត្យចម្លើយ (មើលការពន្យល់)
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>
        </div>
      </div> 

      <QuizExplanationModal 
          v-if="currentQ"
          :isOpen="showExplanationModal"
          :questionText="currentQ.question_text"
          :isCorrect="isCorrectAnswer"
          :correctOptionKey="normalizedCorrectAnswer"
          :correctOptionText="currentQ.options[normalizedCorrectAnswer]"
          :explanation="currentQ.short_note"
          :source="currentQ.source_reference"
          :optionLabelFn="getOptionLabel"
          :isEnglish="isEnglishSubject"
          @next="handleModalNext"
          @stop="handleModalStop"
      />

      <Teleport to="body">
        <Transition name="results-pop">
          <div
            v-if="false && showResultModal"
            class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            @click.self="showResultModal = false"
          >
            <div
              class="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-white/40 bg-white/75 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90 md:p-7"
              :class="isFastRun ? 'fast-glow' : ''"
            >
              <div v-if="isFastRun" class="pointer-events-none absolute inset-0 overflow-hidden">
                <span class="confetti-dot left-[12%] top-[18%]"></span>
                <span class="confetti-dot delay-150 left-[78%] top-[16%]"></span>
                <span class="confetti-dot delay-300 left-[22%] top-[76%]"></span>
                <span class="confetti-dot delay-500 left-[84%] top-[68%]"></span>
              </div>

              <div class="relative">
                <div class="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.32em] text-violet-500/80 dark:text-violet-300/80">
                      Daily Quiz
                    </p>
                    <h3 class="mt-2 font-kantumruy text-2xl font-black text-slate-950 dark:text-white">
                      លទ្ធផលនៃការប្រឡង
                    </h3>
                  </div>
                  <div class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {{ isFastRun ? 'Fast Finish' : 'Completed' }}
                  </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="rounded-3xl border border-white/50 bg-white/55 p-5 shadow-inner shadow-orange-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div class="mb-3 flex items-center gap-3">
                      <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.24)] dark:text-orange-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2c.6 2.6-.8 4.4-2.1 6.1-1.1 1.3-2 2.5-2 4.2a4.1 4.1 0 0 0 8.2 0c0-2.1-1.1-3.5-2.3-5C12.8 6 11.9 4.7 12 2Z" />
                          <path d="M8.7 14.5c.2 2 1.5 3.5 3.3 3.5 1.7 0 3-1.3 3.3-3.1.2-1.2-.1-2.3-.8-3.3-.6 1.2-1.6 2.1-2.8 2.6-1 .4-2.1.5-3 .3Z" />
                        </svg>
                      </span>
                      <div>
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Score</p>
                        <p class="font-kantumruy text-2xl font-black text-slate-950 dark:text-white">
                          {{ toKhmerNumeral(resultSnapshot.score) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-white/50 bg-white/55 p-5 shadow-inner shadow-cyan-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div class="mb-3 flex items-center gap-3">
                      <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-500 shadow-[0_0_22px_rgba(34,211,238,0.28)] dark:text-cyan-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-[pulse_2.2s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="13" r="7" />
                          <path d="M12 13V9.5" />
                          <path d="M12 13l2.5 1.5" />
                          <path d="M9 2h6" />
                          <path d="M12 2v4" />
                        </svg>
                      </span>
                      <div>
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Time Spent</p>
                        <p class="font-kantumruy text-2xl font-black tracking-[0.16em] text-slate-950 dark:text-white">
                          {{ formattedResultTime }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="isFastRun" class="mt-5 font-kantumruy text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  ល្បឿនលឿនជាងមធ្យម ប្រសើរណាស់
                </p>

                <div class="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    @click="showResultModal = false"
                    class="flex-1 rounded-2xl border border-slate-300/70 bg-white/70 px-5 py-3 font-kantumruy text-sm font-bold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    បិទ
                  </button>
                  <button
                    @click="router.push('/')"
                    class="results-home-button flex-1 rounded-2xl bg-violet-600 px-5 py-3 font-kantumruy text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
                  >
                    មើលការពន្យល់
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <QuizResultModal
        :is-open="isResultModalVisible"
        :score="`${resultSnapshot.score} / ${sessionAttempted}`"
        :time-spent="formattedResultTime"
        :accuracy="resultAccuracy"
        :is-fast-run="isFastRun"
        @close="debugShowResultModal = false; showResultModal = false"
        @continue="debugShowResultModal = false; showResultModal = false"
        @home="router.push('/')"
      />

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.results-pop-enter-active,
.results-pop-leave-active {
  transition: opacity 0.28s ease;
}
.results-pop-enter-active > div,
.results-pop-leave-active > div {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
}
.results-pop-enter-from,
.results-pop-leave-to {
  opacity: 0;
}
.results-pop-enter-from > div,
.results-pop-leave-to > div {
  opacity: 0;
  transform: scale(0.94) translateY(14px);
}
.fast-glow::before {
  content: '';
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.22), transparent 55%);
  animation: shimmer 3s ease-in-out infinite;
}
.confetti-dot {
  position: absolute;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(59, 130, 246, 0.95));
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.35);
  animation: floatBurst 2.8s ease-in-out infinite;
}
.delay-150 { animation-delay: 150ms; }
.delay-300 { animation-delay: 300ms; }
.delay-500 { animation-delay: 500ms; }
.status-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.42);
  padding: 0.38rem 0.8rem 0.38rem 1.35rem;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}
.status-badge::before {
  content: '';
  position: absolute;
  left: 0.62rem;
  top: 50%;
  height: 0.38rem;
  width: 0.38rem;
  border-radius: 9999px;
  background: #4ade80;
  transform: translateY(-50%);
  box-shadow: 0 0 0 rgba(74, 222, 128, 0.4);
  animation: statusDot 1.8s ease-in-out infinite;
}
.status-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.22) 45%, transparent 72%);
  transform: translateX(-140%);
  animation: statusSweep 3.4s ease-in-out infinite;
}
.dark .status-badge {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}
.results-home-button {
  color: transparent;
  position: relative;
}
.results-home-button::after {
  content: 'ទៅទំព័រដើម';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
@keyframes tick {
  0%, 100% { transform: scale(1) rotate(0deg); }
  40% { transform: scale(1.08) rotate(-6deg); }
  70% { transform: scale(1) rotate(4deg); }
}
@keyframes statusSweep {
  0%, 100% { transform: translateX(-140%); }
  55% { transform: translateX(140%); }
}
@keyframes statusDot {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.42);
  }
  50% {
    transform: translateY(-50%) scale(1.15);
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
}
@keyframes shimmer {
  0%, 100% { opacity: 0.55; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.08); }
}
@keyframes floatBurst {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.55; }
  50% { transform: translateY(-10px) scale(1.15); opacity: 1; }
}
</style>
