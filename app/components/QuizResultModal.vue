<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  score: { type: [String, Number], default: '' },
  timeSpent: { type: String, default: '' },
  accuracy: { type: [String, Number], default: '' },
  isFastRun: { type: Boolean, default: false },
})

const emit = defineEmits<{
  close: []
  home: []
  continue: []
}>()

const animatedScoreValue = ref<string | number>('')
let scoreAnimationFrame: number | null = null

const parsedScoreParts = computed(() => {
  if (typeof props.score === 'number') {
    return { current: props.score, total: null }
  }

  const rawScore = String(props.score || '').trim()
  const match = rawScore.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/)

  if (!match) {
    return { current: null, total: null }
  }

  return {
    current: Number(match[1]),
    total: Number(match[2]),
  }
})

const isPerfectScore = computed(() => {
  const { current, total } = parsedScoreParts.value
  return total !== null && total > 0 && current === total
})

const displayScore = computed(() => {
  const { current, total } = parsedScoreParts.value

  if (current === null) {
    return props.score || '-- / --'
  }

  if (total === null) {
    return animatedScoreValue.value
  }

  return `${animatedScoreValue.value} / ${total}`
})

const stopScoreAnimation = () => {
  if (scoreAnimationFrame !== null) {
    cancelAnimationFrame(scoreAnimationFrame)
    scoreAnimationFrame = null
  }
}

const startScoreAnimation = () => {
  stopScoreAnimation()

  const { current } = parsedScoreParts.value

  if (current === null) {
    animatedScoreValue.value = props.score || '-- / --'
    return
  }

  if (current <= 0) {
    animatedScoreValue.value = 0
    return
  }

  animatedScoreValue.value = 0
  const duration = 1100
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const nextValue = Math.round(current * eased)

    animatedScoreValue.value = Math.min(nextValue, current)

    if (progress < 1) {
      scoreAnimationFrame = requestAnimationFrame(tick)
      return
    }

    animatedScoreValue.value = current
    scoreAnimationFrame = null
  }

  scoreAnimationFrame = requestAnimationFrame(tick)
}

const normalizedAccuracy = computed(() => {
  if (props.accuracy === '' || props.accuracy === null || props.accuracy === undefined) {
    return ''
  }

  return String(props.accuracy).includes('%') ? String(props.accuracy) : `${props.accuracy}%`
})

const stats = computed(() => [
  {
    label: 'រយៈពេល',
    value: props.timeSpent || '--:--',
  },
  {
    label: 'ភាពត្រឹមត្រូវ',
    value: normalizedAccuracy.value || '--%',
  },
])

watch(
  () => [props.isOpen, props.score],
  ([isOpen]) => {
    if (isOpen) {
      startScoreAnimation()
      return
    }

    stopScoreAnimation()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopScoreAnimation()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="result-modal-fade" appear>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_30%),rgba(248,250,252,0.82)] px-3 py-4 backdrop-blur-xl dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_30%),rgba(2,6,23,0.72)] sm:px-4 sm:py-6"
        @click.self="emit('close')"
      >
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="result-orb absolute left-[-7rem] top-[-4rem] h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/15"></div>
          <div class="result-orb delay-2 absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-violet-500/15 blur-3xl dark:bg-indigo-500/15"></div>
          <div class="result-orb delay-4 absolute left-[8%] top-[60%] h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl"></div>
          <div class="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]"></div>

          <template v-if="isFastRun">
            <span class="particle left-[12%] top-[18%]"></span>
            <span class="particle delay-1 left-[22%] top-[72%]"></span>
            <span class="particle delay-2 left-[78%] top-[22%]"></span>
            <span class="particle delay-3 left-[84%] top-[68%]"></span>
            <span class="particle delay-4 left-[50%] top-[12%]"></span>
            <span class="particle delay-5 left-[58%] top-[82%]"></span>
          </template>

          <template v-if="isPerfectScore">
            <span class="burst burst-1 left-[14%] top-[16%]"></span>
            <span class="burst burst-2 left-[25%] top-[24%]"></span>
            <span class="burst burst-3 left-[76%] top-[14%]"></span>
            <span class="burst burst-4 left-[85%] top-[24%]"></span>
            <span class="burst burst-5 left-[18%] top-[74%]"></span>
            <span class="burst burst-6 left-[80%] top-[76%]"></span>
            <span class="burst burst-7 left-[48%] top-[10%]"></span>
            <span class="burst burst-8 left-[52%] top-[82%]"></span>
          </template>
        </div>

        <div
          class="result-shell relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.94))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-3xl dark:border-white/15 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.58)] sm:rounded-[32px] sm:p-7 md:rounded-[36px] md:p-10"
        >
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.4),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_45%)]"></div>
          <div class="result-shine absolute -left-[30%] top-0 h-full w-[42%] -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10"></div>
          <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/90 to-transparent dark:via-white/35 sm:inset-x-10"></div>

          <div class="relative grid gap-6 sm:gap-7 md:gap-9">
            <section class="result-stage result-stage-1 grid justify-items-center text-center">
              <div class="relative inline-flex items-center justify-center">
                <div
                  class="absolute inset-[-26px] rounded-full bg-gradient-to-br from-amber-500/28 via-orange-500/20 to-transparent blur-2xl shadow-[0_0_60px_rgba(249,115,22,0.2)]"
                ></div>
                <div class="absolute inset-[-10px] rounded-full border border-amber-300/20"></div>

                <div class="result-ring rounded-full bg-[conic-gradient(from_210deg_at_50%_50%,#f59e0b_0deg,#fb923c_120deg,#facc15_240deg,#f59e0b_360deg)] p-[3px]">
                  <div
                    class="score-core flex h-32 w-32 flex-col items-center justify-center rounded-full border border-amber-200/60 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.28),rgba(255,255,255,0.98)_58%)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_36px_rgba(245,158,11,0.12)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),rgba(15,23,42,0.96)_58%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(15,23,42,0.35)] sm:h-36 sm:w-36 md:h-40 md:w-40"
                  >
                    <span class="font-kantumruy text-xs font-bold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300 sm:text-sm sm:tracking-[0.28em]">
                      Score
                    </span>
                    <span class="mt-1.5 font-kantumruy text-[2rem] font-black text-slate-900 dark:text-white sm:mt-2 sm:text-3xl">
                      {{ displayScore }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section class="result-stage result-stage-2 space-y-3 text-center">
              <h2 class="font-kantumruy text-[1.75rem] font-black text-slate-900 dark:text-white sm:text-2xl md:text-[2rem]">
                អស្ចារ្យណាស់! សូមអបអរសាទរ!
              </h2>
              <p class="mx-auto max-w-xl px-2 font-kantumruy text-[14px] leading-6 text-slate-600 dark:text-slate-300/80 md:text-base md:leading-7">
                សូមបន្តរៀនជារៀងរាល់ថ្ងៃ ដើម្បីបង្កើនភាពជោគជ័យ និងប្រាជ្ញា
              </p>
            </section>

            <section class="result-stage result-stage-3 rounded-[24px] border border-slate-200/90 bg-white/70 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-[30px] sm:p-3">
              <div class="grid grid-cols-2 gap-0 divide-x divide-slate-200/80 dark:divide-white/10">
                <div
                  v-for="item in stats"
                  :key="item.label"
                  class="mx-1 rounded-[18px] border border-transparent bg-white/85 px-3 py-4 text-center shadow-sm dark:bg-slate-950/20 sm:mx-2 sm:rounded-[20px] sm:bg-white/90 sm:px-4 sm:shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:sm:bg-slate-950/24 dark:sm:shadow-none"
                >
                  <p class="font-kantumruy text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.2em]">
                    {{ item.label }}
                  </p>
                  <p class="mt-2 font-kantumruy text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                    {{ item.value }}
                  </p>
                </div>
              </div>
            </section>

            <section class="result-stage result-stage-4 flex flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                class="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 font-kantumruy text-sm font-bold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:shadow-none dark:hover:bg-white/[0.1] dark:hover:text-white"
                @click="emit('home')"
              >
                ទៅទំព័រដើម
              </button>

              <button
                type="button"
                class="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] px-4 py-3.5 font-kantumruy text-sm font-black text-white shadow-[0_16px_34px_rgba(79,70,229,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(79,70,229,0.42)] active:scale-95 sm:px-7"
                @click="emit('continue')"
              >
                <span>អនុវត្តបន្ត</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.font-kantumruy {
  font-family: 'Kantumruy Pro', 'Hanuman', sans-serif;
}

.result-modal-fade-enter-active,
.result-modal-fade-leave-active {
  transition: opacity 0.32s ease;
}

.result-modal-fade-enter-from,
.result-modal-fade-leave-to {
  opacity: 0;
}

.result-modal-fade-enter-active .result-shell {
  animation: modal-pop 0.62s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.result-modal-fade-enter-active .result-shine {
  animation: shine-pass 1.1s ease 0.18s both;
}

.result-stage {
  opacity: 1;
  transform: translateY(0);
}

.result-modal-fade-enter-from .result-stage {
  opacity: 0;
  transform: translateY(28px) scale(0.98);
}

.result-modal-fade-enter-active .result-stage {
  animation: stage-rise 0.62s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.result-stage-1 { animation-delay: 0.06s; }
.result-stage-2 { animation-delay: 0.14s; }
.result-stage-3 { animation-delay: 0.22s; }
.result-stage-4 { animation-delay: 0.3s; }

.result-ring {
  animation: ring-breathe 2.8s ease-in-out infinite;
  transform-origin: center;
  will-change: transform, box-shadow, opacity, filter;
}

.result-modal-fade-enter-active .result-ring {
  animation: ring-reveal 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both, ring-breathe 2.8s ease-in-out 0.95s infinite;
}

.result-modal-fade-enter-active .score-core {
  animation: score-bounce 0.9s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.12s both;
}

.result-orb {
  animation: orb-float 8s ease-in-out infinite;
}

.particle {
  position: absolute;
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(249, 115, 22, 0.85));
  box-shadow: 0 0 18px rgba(249, 115, 22, 0.35);
  animation: drift 3.8s ease-in-out infinite;
}

.burst {
  position: absolute;
  height: 0.9rem;
  width: 0.9rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(250,204,21,0.95) 45%, rgba(249,115,22,0.92) 100%);
  box-shadow: 0 0 22px rgba(250, 204, 21, 0.38);
  opacity: 0;
}

.delay-1 { animation-delay: 0.4s; }
.delay-2 { animation-delay: 0.8s; }
.delay-3 { animation-delay: 1.2s; }
.delay-4 { animation-delay: 1.6s; }
.delay-5 { animation-delay: 2s; }

.burst-1 { animation: burst-pop 1.9s ease-out 0.05s infinite; }
.burst-2 { animation: burst-pop 2.1s ease-out 0.22s infinite; }
.burst-3 { animation: burst-pop 1.8s ease-out 0.12s infinite; }
.burst-4 { animation: burst-pop 2.2s ease-out 0.34s infinite; }
.burst-5 { animation: burst-pop 2s ease-out 0.18s infinite; }
.burst-6 { animation: burst-pop 2.15s ease-out 0.28s infinite; }
.burst-7 { animation: burst-pop 1.7s ease-out 0s infinite; }
.burst-8 { animation: burst-pop 2s ease-out 0.4s infinite; }

@keyframes modal-pop {
  0% {
    transform: translateY(36px) scale(0.94);
    opacity: 0;
  }
  60% {
    transform: translateY(-4px) scale(1.01);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes stage-rise {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }
  65% {
    opacity: 1;
    transform: translateY(-2px) scale(1.005);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ring-breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(245, 158, 11, 0);
  }
  50% {
    transform: scale(1.035);
    box-shadow: 0 0 36px rgba(249, 115, 22, 0.18);
  }
}

@keyframes ring-reveal {
  0% {
    transform: scale(0.72);
    opacity: 0;
    filter: blur(4px);
  }
  60% {
    transform: scale(1.06);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes orb-float {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -12px, 0) scale(1.04);
  }
}

@keyframes score-bounce {
  0% {
    transform: scale(0.72);
    opacity: 0;
  }
  55% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes burst-pop {
  0% {
    transform: translate3d(0, 12px, 0) scale(0.2);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  60% {
    transform: translate3d(0, -18px, 0) scale(1.08);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -34px, 0) scale(0.35);
    opacity: 0;
  }
}

@keyframes shine-pass {
  0% {
    transform: translateX(-140%) skewX(-12deg);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  100% {
    transform: translateX(340%) skewX(-12deg);
    opacity: 0;
  }
}

@keyframes drift {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(0.9);
    opacity: 0.45;
  }
  50% {
    transform: translate3d(0, -16px, 0) scale(1.08);
    opacity: 1;
  }
}
</style>
