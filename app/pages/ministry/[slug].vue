<script setup>
import { ref, computed, watch, watchEffect, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QuizExplanationModal from '@/components/QuizExplanationModal.vue';
import QuizResultModal from '@/components/QuizResultModal.vue';
import { sectionOneExamGroup } from '~/data/examSectionOne';
import { sectionTwoExamGroup } from '~/data/examSectionTwo';
import { sectionThreeExamGroup } from '~/data/examSectionThree';
import { sectionFourExamGroup } from '~/data/examSectionFour';

const route = useRoute();
const router = useRouter();

const config    = useRuntimeConfig();
const baseUrl   = config.public.apiBase;
const authToken = useCookie('auth_token');
const user      = useCookie('user_data');

const isSubscribed = computed(() => user.value?.role === 'premium' || user.value?.role === 'admin');
const slug = route.params.slug;

const isLoginModalOpen = useState('loginModal');
const openLoginModal   = () => isLoginModalOpen.value = true;
const { open: openSubscribe } = useSubscribeModal();

const getKhmerTitle = (slug) => {
    const titles = {
        // Standard Subjects
        'geography': 'ភូមិសាស្ត្រ & ធនធាន', 'anthropology': 'នរវិទ្យា & ប្រជាសាស្ត្រ',
        'history': 'ប្រវត្តិសាស្ត្រ & អរិយធម៌', 'arts': 'សិល្បៈ & បេតិកភណ្ឌ',
        'rule-of-law': 'នីតិរដ្ឋ & ការគ្រប់គ្រង', 'religion': 'ជំនឿ & សាសនា (សីលធម៌)',
        'politics': 'នយោបាយ & យុទ្ធសាស្ត្រ', 'economy': 'សេដ្ឋកិច្ច & សង្គមកិច្ច',
        'agriculture': 'កសិកម្ម & ឧស្សាហកម្ម', 'science': 'វិទ្យាសាស្ត្រ & នវានុវត្តន៍',
        'language': 'ភាសា & ទំនាក់ទំនង', 'logic': 'តក្កវិទ្យា & QCM',


        // --- Section 1: វិស័យរដ្ឋបាល យុត្តិធម៌ និងសន្តិសុខ ---
        'ocm': 'ទីស្តីការគណៈរដ្ឋមន្ត្រី',
        'mfaic': 'ក្រសួងការបរទេស និងសហប្រតិបត្តិការអន្តរជាតិ',
        'mond': 'ក្រសួងការពារជាតិ',
        'moi': 'ក្រសួងមហាផ្ទៃ',
        'mocs': 'ក្រសួងមុខងារសាធារណៈ (ERA)',
        'moj': 'ក្រសួងយុត្តិធម៌',
        'moins': 'ក្រសួងអធិការកិច្ច',
        'acu': 'អង្គភាពប្រឆាំងអំពើពុករលួយ (ACU)',
        'ssba': 'រដ្ឋលេខាធិការដ្ឋានកិច្ចការព្រំដែន',

        // --- Section 2: វិស័យសេដ្ឋកិច្ច និងពាណិជ្ជកម្ម ---
        'mef': 'ក្រសួងសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ',
        'moc': 'ក្រសួងពាណិជ្ជកម្ម',
        'molvt': 'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ',
        'mop': 'ក្រសួងផែនការ',
        'mot': 'ក្រសួងទេសចរណ៍',
        'misti': 'ក្រសួងឧស្សាហកម្ម វិទ្យាសាស្ត្រ បច្ចេកវិទ្យា និងនវានុវត្តន៍',
        'maff': 'ក្រសួងកសិកម្ម រុក្ខាប្រមាញ់ និងនេសាទ',
        'naa': 'អាជ្ញាធរសវនកម្មជាតិ',
        'nbc': 'ធនាគារជាតិនៃកម្ពុជា',

        // --- Section 3: វិស័យអប់រំ សុខាភិបាល និងសង្គមកិច្ច ---
        'moeys': 'ក្រសួងអប់រំ យុវជន និងកីឡា',
        'moh': 'ក្រសួងសុខាភិបាល',
        'mosvy': 'ក្រសួងសង្គមកិច្ច អតីតយុទ្ធជន និងយុវនីតិសម្បទា',
        'mowa': 'ក្រសួងកិច្ចការនារី',
        'mocr': 'ក្រសួងធម្មការ និងសាសនា',
        'mcfa': 'ក្រសួងវប្បធម៌ និងវិចិត្រសិល្បៈ',
        'moinf': 'ក្រសួងពត័មាន',
        'nec': 'គណៈកម្មាធិការជាតិរៀបចំការបោះឆ្នោត (គ.ជ.ប)',

        // --- Section 4: វិស័យហេដ្ឋារចនាសម្ព័ន្ធ និងបរិស្ថាន ---
        'mlmupc': 'ក្រសួងរៀបចំដែនដី នគរូបនីយកម្ម និងសំណង់',
        'mpwt': 'ក្រសួងសាធារណការ និងដឹកជញ្ជូន',
        'moenv': 'ក្រសួងបរិស្ថាន',
        'mptc': 'ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍',
        'mowram': 'ក្រសួងធនធានទឹក និងឧតុនិយម',
        'mme': 'ក្រសួងរ៉ែ និងថាមពល',
        'mrd': 'ក្រសួងអភិវឌ្ឍន៍ជនបទ',
        'ssca': 'រដ្ឋលេខាធិការដ្ឋានអាកាសចរស៊ីវិល'
    };
    return titles[slug] || 'សំណួរទូទៅ';
};




const isKhmerSubject = computed(() => !['language', 'logic'].includes(slug));

const getOptionLabel = (key) => {
    if (!isKhmerSubject.value) return key + '.';
    const khmerMap = { 'A': 'ក.', 'B': 'ខ.', 'C': 'គ.', 'D': 'ឃ.' };
    return khmerMap[key] || key + '.';
};

const toKhmerNumeral = (num) => {
    if (!isKhmerSubject.value) return num;
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return num.toString().split('').map(d => khmerDigits[d] || d).join('');
};

const { data: quizData, pending, error } = await useFetch(`${baseUrl}/quiz/${route.params.slug}`, {
    headers: {
        'Accept':        'application/json',
        'Authorization': authToken.value ? `Bearer ${authToken.value}` : '',
        'ngrok-skip-browser-warning': '1',
    },
    server: false,
    onResponseError({ response }) {
        if (response.status === 401) {
            authToken.value = null;
            user.value = null;
            isLoginModalOpen.value = true;
        } else if (response.status === 404) {
            navigateTo('/quiz/no-questions', { replace: true });
        }
    },
});

// Backend 200 with no questions (e.g. ministry exists but ministry_questions is empty for it)
// also goes to the no-questions page rather than the inline error block.
watchEffect(() => {
    if (quizData.value && (quizData.value.total_questions === 0
            || !quizData.value.questions
            || quizData.value.questions.length === 0)) {
        navigateTo('/quiz/no-questions', { replace: true });
    }
});

const rawQuestions      = ref([]);
const pendingQuestions  = ref([]);
const score             = ref(0);
const isFinished        = ref(false);
const isLimitReached    = ref(false);
const selectedAnswer    = ref(null);
const isAnswerChecked   = ref(false);
const showExplanationModal = ref(false);
const showResultModal = ref(false);
const elapsedSeconds = ref(0);
const totalElapsedSeconds = ref(0);
const questionTimerStartedAt = ref(null);
const timerInterval = ref(null);
const isTimerPaused = ref(false);
const hasSessionStarted = ref(false);
const pauseReasons = new Set();
const hasShownResultModal = ref(false);
const resultSnapshot = ref({
    score: 0,
    attempted: 0,
    timeSpent: 0,
});
const checkpointSnapshot = ref({
    score: 0,
    attempted: 0,
    timeSpent: 0,
});

// REQ 4: Session counters restored from backend
const sessionAttempted = ref(0);  // total attempted across all visits to this slug
const sessionScore     = ref(0);  // total correct across all visits

// Current-session tracking (resets each page open)
const sessionCorrectCount = ref(0);  // correct in this session only
const sessionWrongCount   = ref(0);  // wrong in this session only

// Pause every N answers and ask the user to continue or go home.
// `lastPauseShownAt` is seeded from the persisted answered_count so a refresh
// at e.g. 31/100 does not immediately re-fire the 30-popup.
const PAUSE_EVERY = 30;
const pauseModalOpen = ref(false);
const lastPauseShownAt = ref(0);


const totalCatQuestions = computed(() => quizData.value?.total_questions || 100);


const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// --- Update the Computed Progress Section ---
const currentQuestionNumber = computed(() => sessionAttempted.value + 1);

const progressPercent = computed(() =>
    totalCatQuestions.value > 0
        ? (Math.min(sessionAttempted.value, totalCatQuestions.value) / totalCatQuestions.value) * 100
        : 0
);
const formattedElapsedTime = computed(() => formatDuration(elapsedSeconds.value));
const formattedResultTime = computed(() => formatDuration(resultSnapshot.value.timeSpent));
const formattedCheckpointTime = computed(() => formatDuration(checkpointSnapshot.value.timeSpent));
const resultAccuracy = computed(() => {
    if (!resultSnapshot.value.attempted) return 0;
    return Math.round((resultSnapshot.value.score / resultSnapshot.value.attempted) * 100);
});
const checkpointAccuracy = computed(() => {
    if (!checkpointSnapshot.value.attempted) return 0;
    return Math.round((checkpointSnapshot.value.score / checkpointSnapshot.value.attempted) * 100);
});
const isFastRun = computed(() => resultSnapshot.value.timeSpent > 0 && resultSnapshot.value.timeSpent <= 75);

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
    if (
        !hasSessionStarted.value ||
        showResultModal.value ||
        showExplanationModal.value ||
        pauseModalOpen.value
    ) return;

    if (pauseReasons.has('manual')) {
        resumeTimer('manual');
        return;
    }

    if (!timerInterval.value && pauseReasons.size === 0) {
        startTimer();
    }
};
// REQ 4: Restore session state when data loads
watch(quizData, (newData) => {
    if (newData) {
        // Use the new naming from our Controller update
        sessionAttempted.value = newData.answered_count || 0;
        sessionScore.value     = newData.current_score || 0;
        lastPauseShownAt.value = Math.floor(sessionAttempted.value / PAUSE_EVERY) * PAUSE_EVERY;

        if (newData.limit_reached || newData.requires_subscription) {
            isLimitReached.value = true;
            setTimeout(() => openSubscribe(), 500);
        } else if (newData.questions && newData.questions.length > 0) {
            rawQuestions.value     = newData.questions;
            // No need to shuffle if we want them to appear in order, 
            // but keep it if you want the batch randomized
            pendingQuestions.value = shuffleArray(newData.questions);
            if (!hasSessionStarted.value) {
                startTimer(true);
            }
        } else {
            isFinished.value = true;
        }
    }
}, { immediate: true });

const currentQ = computed(() => pendingQuestions.value[0]);

const normalizedCorrectAnswer = computed(() => {
    const rawAnswer = currentQ.value?.correct_answer;
    if (!rawAnswer) return null;
    const cleanAnswer = rawAnswer.toUpperCase().replace('.', '').trim();
    const reverseKhmerMap = { 'ក': 'A', 'ខ': 'B', 'គ': 'C', 'ឃ': 'D' };
    return reverseKhmerMap[cleanAnswer] || cleanAnswer;
});

const isCorrectAnswer = computed(() => selectedAnswer.value === normalizedCorrectAnswer.value);

// Ministry answers persist via /save-progress with source='ministry'. The
// backend writes to user_ministry_answers (parallel to user_answers because
// of FK constraints), updates user_quiz_progress for slug-keyed resumption,
// and bumps total_score + user_season_scores on correct answers so the
// weekly leaderboard reflects ministry play too.
const selectOption = async (key) => {
    if (isAnswerChecked.value) return;
    selectedAnswer.value  = key;
    isAnswerChecked.value = true;

    const answeredQuestion = currentQ.value;
    const wasCorrect = key === normalizedCorrectAnswer.value;

    if (authToken.value && answeredQuestion) {
        try {
            await $fetch(`${baseUrl}/save-progress`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken.value}`,
                },
                body: {
                    question_id: answeredQuestion.id,
                    is_correct: wasCorrect,
                    source: 'ministry',
                    slug: route.params.slug,
                },
            });
        } catch (err) {
            console.error("Save failed:", err);
        }
    }
};

const handleMainAction = () => {
    if (!isAnswerChecked.value) return;
    showExplanationModal.value = true;
};

// --- Update handleModalNext ---
// 2. Update handleModalNext (Add the increments here)
const handleModalNext = async () => {
    showExplanationModal.value = false;

    setTimeout(async () => {
        totalElapsedSeconds.value += elapsedSeconds.value;
        // 🔥 UPDATE UI HERE: Only increase after clicking Next
        sessionAttempted.value++;
        if (isCorrectAnswer.value) {
            sessionScore.value++;
        }

        // Shift to the next question
        pendingQuestions.value.shift();

        if (pendingQuestions.value.length === 0) {
            await fetchMoreQuestions();
        } else {
            resetQuestionState();
        }

        // Every 30 answers: ask user to continue or go home. Skip if the
        // session already ended (limit reached / finished) so we don't stack
        // a pause popup over the completion screen.
        if (
            !pauseModalOpen.value &&
            !showResultModal.value &&
            !isLimitReached.value &&
            !isFinished.value &&
            sessionAttempted.value > lastPauseShownAt.value &&
            sessionAttempted.value % PAUSE_EVERY === 0
        ) {
            lastPauseShownAt.value = sessionAttempted.value;
            checkpointSnapshot.value = {
                score: sessionScore.value,
                attempted: sessionAttempted.value,
                timeSpent: totalElapsedSeconds.value,
            };
            pauseTimer('checkpoint');
            pauseModalOpen.value = true;
        } else {
            resumeTimerForNextQuestion();
        }
    }, 300);
};

const continueAfterPause = () => {
    pauseModalOpen.value = false;
    if (currentQ.value && hasSessionStarted.value) {
        totalElapsedSeconds.value = 0;
        pauseReasons.delete('checkpoint');
        startTimer(true);
    }
};

const goHomeFromPause = () => {
    pauseModalOpen.value = false;
    stopTimer();
    isTimerPaused.value = false;
    router.push('/');
};

const fetchMoreQuestions = async () => {
    try {
        const response = await $fetch(`${baseUrl}/quiz/${route.params.slug}`, {
            headers: {
                'Accept':        'application/json',
                'Authorization': `Bearer ${authToken.value}`,
                'ngrok-skip-browser-warning': '1',
            }
        });

        if (response.limit_reached || response.requires_subscription) {
            isLimitReached.value = true;
            openSubscribe();
        } else if (response.questions && response.questions.length > 0) {
            // REQ 1: Fresh batch — update session state from response
            sessionAttempted.value = response.session_attempted || sessionAttempted.value;
            sessionScore.value     = response.session_score     || sessionScore.value;
            rawQuestions.value     = response.questions;
            pendingQuestions.value = shuffleArray(response.questions);
            if (!timerInterval.value && !isTimerPaused.value) {
                startTimer(true);
            }
            // Reset in-session counters since we got a new batch
            sessionCorrectCount.value = 0;
            sessionWrongCount.value   = 0;
            resetQuestionState();
        } else {
            isFinished.value = true;
        }
    } catch (err) {
        console.error(err);
    }
};

const resetQuestionState = () => {
    selectedAnswer.value  = null;
    isAnswerChecked.value = false;
};

const handleModalStop = () => {
    showExplanationModal.value = false;
    if (confirm('តើអ្នកពិតជាចង់បញ្ឈប់ការធ្វើតេស្តនេះមែនទេ?')) {
        stopTimer();
        isTimerPaused.value = false;
        router.back();
    }
};

const getOptionBoxClass = (key) => {
    const isCorrect  = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;
    if (!isAnswerChecked.value) {
        return isSelected
            ? 'border-slate-400 bg-slate-50 dark:border-amber-300/70 dark:bg-amber-400/10'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/45 dark:hover:border-amber-300/35 dark:hover:bg-slate-900/85';
    } else {
        if (isCorrect) return 'border-[#22c55e] border-2 bg-[#f0fdf4] z-10 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-400';
        if (isSelected && !isCorrect) return 'border-[#ef4444] border-2 bg-[#fef2f2] z-10 dark:bg-red-500/15 dark:border-red-400';
        return 'border-slate-200 bg-white opacity-50 pointer-events-none dark:border-white/10 dark:bg-slate-950/45';
    }
};

const getRadioCircleClass = (key) => {
    const isCorrect  = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;
    if (!isAnswerChecked.value) return isSelected ? 'border-slate-500 dark:border-amber-300' : 'border-slate-300 dark:border-slate-600';
    if (isCorrect) return 'border-[#22c55e]';
    if (isSelected && !isCorrect) return 'border-[#ef4444]';
    return 'border-slate-200 dark:border-slate-700';
};

const getOptionTextClass = (key) => {
    const isCorrect  = key === normalizedCorrectAnswer.value;
    const isSelected = selectedAnswer.value === key;
    if (!isAnswerChecked.value) return 'text-slate-800 dark:text-slate-100';
    if (isCorrect) return 'text-[#166534] font-bold dark:text-emerald-300';
    if (isSelected && !isCorrect) return 'text-[#991b1b] font-bold dark:text-red-300';
    return 'text-slate-500 dark:text-slate-400';
};

watch(currentQ, (newQuestion) => {
    if (newQuestion && !hasSessionStarted.value) {
        startTimer(true);
        return;
    }

    if (newQuestion && hasSessionStarted.value && !timerInterval.value && !isTimerPaused.value && !showExplanationModal.value) {
        startTimer();
    }
}, { immediate: true });

watch(showExplanationModal, (isOpen) => {
    if (isOpen) {
        pauseTimer('explanation');
    } else if (currentQ.value && hasSessionStarted.value) {
        resumeTimer('explanation');
    }
});

watch([isFinished, isLimitReached], ([finished, limited]) => {
    if (finished || limited) {
        pauseModalOpen.value = false;
        stopTimer();
        isTimerPaused.value = false;
    }

    if (finished && !hasShownResultModal.value) {
        resultSnapshot.value = {
            score: sessionScore.value,
            attempted: sessionAttempted.value,
            timeSpent: totalElapsedSeconds.value,
        };
        totalElapsedSeconds.value = 0;
        pauseTimer('result');
        showResultModal.value = true;
        hasShownResultModal.value = true;
    }
});

onBeforeUnmount(() => {
    stopTimer();
});
</script>

<template>
  <div class="mt-2 bg-transparent font-kantumruy flex items-center justify-center p-4 md:mt-5 lg:mt-2">
    <div class="w-full max-w-3xl space-y-5">

      <div v-if="pending" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 dark:bg-slate-900/85">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-[#3eb36a]"></div>
      </div>

      <div v-else-if="error" class="text-center py-20 bg-white rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-white/10 dark:bg-slate-900/85">
         <template v-if="error.statusCode === 401">
             <h1 class="text-2xl font-bold mb-3 text-red-500">តម្រូវឱ្យចូលគណនី</h1>
             <p class="text-gray-600 mb-6 dark:text-slate-300">អ្នកត្រូវតែចូលគណនី (Login) ដើម្បីចូលធ្វើតេស្តមេរៀននេះបាន។</p>
             <button @click="openLoginModal" class="bg-[#3eb36a] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#329858] transition-colors">ចូលគណនីឥឡូវនេះ</button>
         </template>
         <template v-else>
             <h1 class="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">មានបញ្ហា</h1>
             <p class="text-slate-600 dark:text-slate-300">{{ error.message }}</p>
             <button @click="router.push('/')" class="bg-gray-800 text-white px-6 py-2.5 rounded-full mt-5 font-bold shadow-md hover:bg-gray-700 dark:bg-white/10 dark:hover:bg-white/15">ត្រឡប់ទៅទំព័រដើម</button>
         </template>
      </div>

      <div v-else-if="isLimitReached" class="text-center py-20 bg-white rounded-3xl shadow-sm p-8 border border-gray-100 animate-fade-in dark:border-white/10 dark:bg-slate-900/85">
         <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-amber-400/15">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
         </div>
         <h1 class="text-2xl font-bold mb-2 text-gray-800 dark:text-slate-100">អស់ចំនួនសាកល្បងឥតគិតថ្លៃហើយ!</h1>
         <p class="text-gray-600 mb-6 dark:text-slate-300">អ្នកបានធ្វើតេស្តសាកល្បង ៥០ សំណួររួចរាល់ហើយ។</p>
         <div class="flex flex-col sm:flex-row gap-3 justify-center">
             <button @click="router.push('/')" class="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-gray-300 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15">ត្រឡប់ទៅទំព័រដើម</button>
             <button @click="openSubscribe" class="bg-[#cda043] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-yellow-600">ទិញគម្រោងឥឡូវនេះ</button>
         </div>
      </div>

      <div v-else-if="isFinished && !showResultModal" class="text-center py-20 bg-white rounded-3xl shadow-sm p-8 border border-gray-100 animate-fade-in dark:border-white/10 dark:bg-slate-900/85">
         <div class="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-400/15">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>
         <h1 class="text-2xl font-bold mb-2 text-[#166534] dark:text-emerald-300">អបអរសាទរ! 🎉</h1>
         <p class="text-gray-600 mb-6 dark:text-slate-300">អ្នកបានបញ្ចប់សំណួរទាំងអស់នៅក្នុងមេរៀននេះ។</p>
         <button @click="router.push('/')" class="bg-[#3eb36a] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#329858] transition-colors">ត្រឡប់ទៅទំព័រដើម</button>
      </div>

      <div v-else-if="!isFinished && !isLimitReached && currentQ" class="space-y-4 animate-fade-in">

        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm p-3 px-6 flex flex-col justify-center dark:border-white/10 dark:bg-slate-900/85">
            <div class="flex justify-between items-center mb-3">
                <span class="text-gray-800 font-bold text-sm md:text-[15px] tracking-wide dark:text-slate-100">
                    {{ getKhmerTitle(slug) }}
                </span>
                <!-- REQ 4: Show cumulative score across all sessions -->
                <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-1 text-sm font-semibold italic text-amber-700 shadow-sm dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200 md:text-[15px]">
                    score: <span class="text-red-600 dark:text-red-400">{{ sessionScore }}</span>
                </span>
            </div>
            <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-800">
                <div class="h-full bg-[#cda043] rounded-full transition-all duration-500 shadow-[0_0_14px_rgba(205,160,67,0.45)]" :style="{ width: `${progressPercent}%` }"></div>
            </div>
        </div>

        <div class="flex items-center justify-between gap-3 px-1 py-1">
            <p class="status-badge inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur-sm dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200">
                <span class="relative flex h-2.5 w-2.5">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70"></span>
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"></span>
                </span>
                ការអនុវត្តបានចាប់ផ្ដើម
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
            <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-[#cda043] z-10"></div>

            <div class="bg-[#dcfce7] p-3 pl-8 md:pl-10 flex items-start gap-4 border-b border-green-100 z-0 dark:border-emerald-400/20 dark:bg-emerald-950/70">
                <!-- REQ 4: Question number resumes from where they left off -->
                <div class="w-9 h-9 md:w-10 md:h-10 shrink-0 bg-[#3eb36a] text-white rounded-full flex items-center justify-center font-bold text-lg border-[3px] border-white shadow-sm mt-0.5">
                    {{ toKhmerNumeral(currentQuestionNumber) }}
                </div>
                <h2 class="text-gray-900 font-bold text-base md:text-[17px] leading-relaxed mt-1 md:mt-1.5 dark:text-emerald-50">
                    {{ currentQ.question_text }}
                </h2>
            </div>

            <div class="p-5 md:p-6 pl-8 md:pl-10 flex flex-col gap-3.5 bg-white z-0 relative dark:bg-slate-900/85">
                <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-[#cda043] z-10"></div>
                <div
                    v-for="(text, key) in currentQ.options"
                    :key="key"
                    @click="selectOption(key)"
                    class="relative rounded-xl p-3.5 pl-[52px] transition-all duration-300 cursor-pointer border"
                    :class="getOptionBoxClass(key)"
                >
                    <div class="absolute left-[16px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center bg-white shadow-sm dark:bg-slate-950"
                        :class="getRadioCircleClass(key)">
                        <div v-if="!isAnswerChecked && selectedAnswer === key" class="w-[10px] h-[10px] bg-gray-500 rounded-full dark:bg-amber-300"></div>
                        <div v-else-if="isAnswerChecked && key === normalizedCorrectAnswer" class="w-[10px] h-[10px] bg-[#22c55e] rounded-full"></div>
                        <div v-else-if="isAnswerChecked && selectedAnswer === key && key !== normalizedCorrectAnswer" class="w-[10px] h-[10px] bg-[#ef4444] rounded-full"></div>
                    </div>
                    <p class="text-[15px] md:text-base leading-relaxed tracking-wide" :class="getOptionTextClass(key)">
                       <span class="mr-1.5">{{ getOptionLabel(key) }}</span> {{ text }}
                    </p>
                </div>
            </div>

            <div class="px-5 md:px-6 pl-8 md:pl-10 flex justify-center z-0 relative">
                <div class="absolute left-0 top-0 bottom-0 w-2.5 bg-[#cda043] z-10"></div>
                <button
                    @click="handleMainAction"
                    :disabled="!isAnswerChecked"
                    class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-[15px] tracking-wide transition-all duration-200 shadow-sm"
                    :class="(!isAnswerChecked) ? 'bg-gray-400 cursor-not-allowed shadow-none dark:bg-slate-700 dark:text-slate-300' : 'bg-[#3eb36a] hover:bg-[#329858] active:scale-[0.98]'"
                >
                    {{ isKhmerSubject ? 'ពិនិត្យចម្លើយ (មើលការពន្យល់)' : 'Check Answer' }}
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
          :isEnglish="!isKhmerSubject"
          @next="handleModalNext"
          @stop="handleModalStop"
      />


      <QuizResultModal
          :is-open="pauseModalOpen"
          :score="`${checkpointSnapshot.score} / ${checkpointSnapshot.attempted}`"
          :time-spent="formattedCheckpointTime"
          :accuracy="checkpointAccuracy"
          :dismissible="false"
          @close="continueAfterPause()"
          @home="goHomeFromPause()"
          @continue="continueAfterPause()"
      />

      <QuizResultModal
          :is-open="showResultModal"
          :score="`${resultSnapshot.score} / ${resultSnapshot.attempted}`"
          :time-spent="formattedResultTime"
          :accuracy="resultAccuracy"
          :is-fast-run="isFastRun"
          @close="showResultModal = false"
          @continue="showResultModal = false"
          @home="router.push('/')"
      />

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

