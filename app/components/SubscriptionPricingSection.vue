<script setup lang="ts">
import LucideCheckCircle from '@/components/LucideCheckCircle.vue';

const { open: openSubscribe } = useSubscribeModal();

type PricingPlan = {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  inlineNote?: string;
  title: string;
  badge?: string;
  badgeClass?: string;
  accent: string;
  buttonLabel: string;
  buttonClass: string;
  features: string[];
  highlighted?: boolean;
};

// make three cards 
const plans: PricingPlan[] = [

  // first card 2$
  {
    name: 'មូលដ្ឋានគ្រឹះចំណេះទូទៅ',
    subtitle: 'Basic',
    price: '$2',
    inlineNote: 'KEYs & MCQ : 30 000+',
    period: '/ ខែ',
    title: 'Unlock មុំទាំង ១២',
    accent: 'from-emerald-400/30 via-emerald-300/10 to-transparent dark:from-emerald-500/12 dark:via-emerald-400/4 dark:to-transparent',
    buttonLabel: 'ជ្រើសរើសកញ្ចប់នេះ',
    buttonClass:
      'border border-slate-300/90 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-indigo-300 hover:bg-indigo-50/70 hover:shadow-[0_14px_30px_rgba(99,102,241,0.12)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-emerald-300/55 dark:hover:bg-emerald-400/10',
    features: [
      'វិញ្ញាសាចំណេះដឹងទូទៅប្រចាំថ្ងៃ',
      'មូលដ្ឋានគ្រឹះចំណេះដឹងទូទៅ',
      'ប្រវត្តិសាស្ត្រ អរិយធម៌ បេតិកភណ្ឌ',
      'ច្បាប់ រដ្ឋបាល ហិរញ្ញវត្ថុ គោលនយោបាយ បច្ចេកវិទ្យា',
      ' អង់គ្លេស (TOEFL) ករណីសិក្សា តក្កវិទ្យា',
      'បណ្ណាល័យឯកសារ មុំទាំង១២',
      'AI Chat Bot សំណួរ-ចម្លើយ',
      'វិញ្ញាបនបត្រ (E-Certificate) បញ្ជាក់ពិន្ទុ',
    ],
  },

  // second card 3.5$
  {
    name: 'កម្ពុជា ក្រសួងស្ថាប័នរដ្ឋ',
    subtitle: 'Pro',
    price: '$3.5',
    inlineNote: 'KEYs & MCQ : 50 000+',
    period: '/ ខែ',
    title: 'Unlock ៣៤ ក្រសួង-ស្ថាប័ន',
    accent: 'from-sky-400/30 via-sky-300/10 to-transparent dark:from-sky-500/12 dark:via-sky-400/4 dark:to-transparent',
    buttonLabel: 'ជ្រើសរើសកញ្ចប់នេះ',
    buttonClass:
      'border border-slate-300/90 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-indigo-300 hover:bg-indigo-50/70 hover:shadow-[0_14px_30px_rgba(99,102,241,0.12)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-300/55 dark:hover:bg-sky-400/10',
    features: [
      'ក្របខណ្ឌគតិយុត្ត ឯកសារគោលជាតិ',
      'ចំណេះដឹងក្រសួងស្ថាប័នរដ្ឋទាំង ៣៤',
      'វិញ្ញាសាត្រៀមប្រឡង ក្រសួងស្ថាប័នរដ្ឋទាំង៣៤',
      'វិញ្ញាសាធ្លាប់ប្រឡង​ ក្រសួងស្ថាប័នរដ្ឋទាំង៣៤',
      'បណ្ណាល័យឯកសារ ក្រសួងស្ថាប័នរដ្ឋទាំង៣៤',
      'AI Chat Bot សំណួរ-ចម្លើយ',
      'វិញ្ញាបនបត្រ (E-Certificate) បញ្ជាក់ពិន្ទុ',
    ],
  },

  // third card (special card ) most popular
  {
    name: 'ទិន្នន័យទាំងអស់',
    subtitle: 'Full Access',
    price: '$4',
    inlineNote: 'KEYs & MCQ : 100 000+',
    period: '/ ខែ',
    title: 'Full Unlock',
    badge: 'Most Popular',
    accent: 'from-violet-500/40 via-indigo-400/25 to-fuchsia-400/20',
    buttonLabel: 'ចុះឈ្មោះឥឡូវនេះ',
    buttonClass:
      'border border-violet-300/40 bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-[0_14px_32px_rgba(199,210,254,0.95)] hover:from-violet-400 hover:to-indigo-500 dark:shadow-[0_10px_24px_rgba(79,70,229,0.28)]',
    highlighted: true,
    features: [
      'Full Unlock មុំទាំង១២',
      'Full Unlock ក្រសួងស្ថាប័នរដ្ឋទាំង៣៤',
      'វប្បធម៌ទូទៅ ចំណេះទូទៅ អនុវត្តប្រចាំថ្ងៃ',
      'ក្របខណ្ឌគតិយុត្ត ឯកសារគោលជាតិ',
      'វិញ្ញាសាត្រៀមប្រឡង និងធ្លាប់ប្រឡង ក្រសួងស្ថាប័នរដ្ឋទាំង៣៤',
      'ចូលមើលវិញ្ញាសា និងឯកសារគ្រប់ប្រភេទ',
      'AI Chat Bot សំណួរ-ចម្លើយ',
      'វិញ្ញាបនបត្រ (E-Certificate) បញ្ជាក់ពិន្ទ',
    ],
  },
];
</script>

<template>
  <section class="relative overflow-hidden bg-slate-50/80 px-4 py-8 dark:bg-transparent sm:px-5 lg:px-6 lg:py-12">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(165,180,252,0.2),rgba(255,255,255,0)_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.72),rgba(15,23,42,0.96)_42%,rgba(2,6,23,1)_100%)]"></div>
    <div class="mx-auto max-w-5xl">
      <div class="mx-auto mb-8 max-w-4xl text-center">

        <!-- // use amber color for bedget -->
        <span class="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-800 shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200">
          Subscription Pricing
        </span>
        <!-- <h2 class="mt-4 font-kantumruy text-2xl font-black text-indigo-950 dark:text-white sm:text-3xl lg:text-[2rem]">
          ជ្រើសរើសកញ្ចប់ដែលសមស្របសម្រាប់ការរៀនរបស់អ្នក
        </h2>
        <p class="mt-3 font-kantumruy text-[11px] leading-5 text-slate-600 dark:text-slate-300 sm:text-xs lg:text-xs">
          បើកបទពិសោធន៍សិក្សាបែប Premium ជាមួយមាតិកា វិញ្ញាសា និងឯកសារដែលរៀបចំសម្រាប់ការត្រៀមប្រឡងយ៉ាងមានប្រសិទ្ធភាព។
        </p> -->
        
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.name"
          class="group relative h-full overflow-hidden rounded-[1.65rem] p-[1px] transition-transform duration-300 hover:-translate-y-2"
          :class="
            plan.highlighted
              ? 'bg-slate-300/80 shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:bg-[#4a4a45] dark:shadow-[0_26px_70px_rgba(15,23,42,0.24)]'
              : plan.subtitle === 'Pro'
                ? 'bg-sky-200/80 shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:bg-[#39536e] dark:shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
                : 'bg-emerald-200/80 shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:bg-[#2f4f53] dark:shadow-[0_24px_60px_rgba(15,23,42,0.18)]'
          "
        >
          <div
            class="relative flex h-full flex-col rounded-[calc(1.65rem-1px)] border border-slate-300/90 bg-white/95 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-md transition-colors duration-300 group-hover:border-slate-400 dark:border-white/10 dark:bg-slate-900/50 dark:shadow-none dark:backdrop-blur-xl dark:group-hover:border-white/20 sm:p-5 lg:p-6"
            :class="
              plan.highlighted
                ? 'border-slate-300/90 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#2f302d] dark:shadow-[0_20px_55px_rgba(0,0,0,0.22)]'
                : plan.subtitle === 'Pro'
                  ? 'border-slate-300/90 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#2d4056] dark:shadow-[0_20px_55px_rgba(0,0,0,0.18)]'
                  : 'border-slate-300/90 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#2a4247] dark:shadow-[0_20px_55px_rgba(0,0,0,0.18)]'
            "
          >
            <div
              class="pointer-events-none absolute inset-0 rounded-[calc(1.65rem-1px)] bg-gradient-to-br opacity-80"
              :class="
                plan.highlighted
                  ? 'from-transparent via-transparent to-transparent opacity-0'
                  : plan.subtitle === 'Pro'
                    ? 'from-sky-300/8 via-transparent to-sky-100/6 opacity-100'
                    : 'from-emerald-300/8 via-transparent to-cyan-100/6 opacity-100'
              "
            ></div>
            <div class="hidden"></div>

            <div class="relative flex h-full flex-col">
              <div class="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p
                    class="font-kantumruy text-sm font-bold text-slate-900 dark:text-slate-300"
                    :class="plan.highlighted ? 'text-slate-900 dark:text-slate-200' : 'text-slate-900 dark:text-slate-100'"
                  >
                    {{ plan.name }}
                  </p>
                  <span
                    class="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:px-2.5 sm:py-0.5 sm:text-[10px]"
                    :class="
                      plan.highlighted
                        ? 'border-slate-300/90 bg-[#2d2d28] text-white dark:border-white/10 dark:bg-[#262723] dark:text-slate-200'
                        : plan.subtitle === 'Pro'
                          ? 'border-sky-300/80 bg-sky-50 text-sky-600 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-200'
                          : 'border-emerald-300/80 bg-emerald-50 text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200'
                    "
                  >
                    {{ plan.subtitle }}
                  </span>
                </div>
                <span
                  v-if="plan.badge"
                  class="pricing-badge relative overflow-hidden rounded-full border border-green-400/50 bg-green-100 px-3 py-1 text-[10px] font-semibold tracking-[0.03em] text-green-700 shadow-[0_12px_26px_rgba(34,197,94,0.12)] dark:border-green-500/30 dark:bg-green-900/80 dark:text-green-300 dark:shadow-[0_12px_26px_rgba(34,197,94,0.18)] sm:text-xs"
                >
                  <span class="relative z-10">{{ plan.badge }}</span>
                  <span class="pricing-badge-glow absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/15 dark:bg-green-200/10"></span>
                </span>
              </div>

              <div
                class="relative mb-5"
                :class="plan.highlighted ? 'border-b border-slate-200/90 pb-6 dark:border-white/10' : 'border-b border-slate-200/90 pb-6 dark:border-white/10'"
              >
                <div class="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    class="text-3xl font-black leading-none tracking-tight text-indigo-600 dark:text-slate-100 sm:text-4xl lg:text-[2.6rem]"
                    :class="plan.highlighted ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'"
                  >
                    {{ plan.price }}
                  </span>
                  <span
                    class="pt-2 font-kantumruy text-sm text-slate-500 dark:text-slate-400 sm:text-base"
                    :class="plan.highlighted ? 'text-slate-500 dark:text-slate-300' : 'text-slate-500 dark:text-slate-300'"
                  >
                    {{ plan.period }}
                  </span>
                  <span
                    v-if="plan.inlineNote"
                    class="ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] shadow-[0_12px_24px_rgba(59,130,246,0.22)] sm:text-[11px]"
                    :class="
                      plan.highlighted
                        ? 'border-blue-400/20 bg-blue-900/70 text-blue-200'
                        : 'border-blue-400/20 bg-blue-900/70 text-blue-200 dark:border-blue-400/20 dark:bg-blue-900/70 dark:text-blue-200'
                    "
                  >
                    {{ plan.inlineNote }}
                  </span>
                </div>
                <h3
                  class="mt-3 font-kantumruy text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl"
                  :class="plan.highlighted ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'"
                >
                  {{ plan.title }}
                </h3>
              </div>

              <ul
                class="relative mb-6 space-y-3 rounded-2xl border border-slate-300/90 bg-slate-100/75 p-4 font-kantumruy text-[13px] leading-6 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_28px_rgba(15,23,42,0.05)] dark:border-transparent dark:bg-transparent dark:p-0 dark:text-slate-300 dark:shadow-none sm:text-sm"
                :class="plan.highlighted ? 'border-transparent bg-transparent p-0 text-slate-600 shadow-none dark:text-slate-300' : 'border-transparent bg-transparent p-0 text-slate-600 shadow-none dark:text-slate-300'"
              >
                <li
                  v-for="feature in plan.features"
                  :key="feature"
                  class="flex items-start gap-3"
                >
                  <LucideCheckCircle class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="relative mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 text-center font-kantumruy text-sm font-bold transition-all duration-300"
                :class="
                  plan.highlighted
                    ? 'border border-slate-200 bg-stone-100 text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:bg-white dark:border-white/80 dark:shadow-[0_12px_28px_rgba(255,255,255,0.16)]'
                    : 'border border-slate-300/90 bg-slate-50 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.06)] hover:bg-white dark:border-white/80 dark:bg-stone-100 dark:text-slate-900 dark:shadow-[0_12px_28px_rgba(255,255,255,0.14)] dark:hover:bg-white'
                "
                @click="openSubscribe"
              >
                {{ plan.buttonLabel }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-badge {
  animation: badgePulse 2.8s ease-in-out infinite;
}

.pricing-badge-glow {
  animation: badgeSweep 2.8s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    box-shadow: 0 10px 24px rgba(139, 92, 246, 0.08);
  }
  50% {
    box-shadow: 0 12px 28px rgba(245, 158, 11, 0.18);
  }
}

@keyframes badgeSweep {
  0% {
    transform: translateX(-180%) skewX(-12deg);
    opacity: 0;
  }
  18% {
    opacity: 0.9;
  }
  45% {
    transform: translateX(420%) skewX(-12deg);
    opacity: 0;
  }
  100% {
    transform: translateX(420%) skewX(-12deg);
    opacity: 0;
  }
}
</style>
