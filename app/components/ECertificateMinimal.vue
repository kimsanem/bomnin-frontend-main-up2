<script setup lang="ts">
import { computed } from 'vue';

type MetricIcon =
  | 'award'
  | 'book'
  | 'calendar'
  | 'ranking'
  | 'tree'
  | 'shield';

type MetricItem = {
  label: string;
  value?: string;
  subvalue?: string;
  icon: MetricIcon;
};

const props = withDefaults(defineProps<{
  name?: string;
  learnerId?: string;
  email?: string;
  totalHours?: string;
  solvedMcqs?: string;
  totalSeason?: string;
  totalSeasonRange?: string;
  highestRank?: string;
  treeOfLife?: string;
  effectiveDate?: string;
}>(), {
  name: '',
  learnerId: '',
  email: '',
  totalHours: '',
  solvedMcqs: '',
  totalSeason: '',
  totalSeasonRange: '',
  highestRank: '',
  treeOfLife: '',
  effectiveDate: '',
});

const displayName = computed(() => (props.name?.trim() || '').toLocaleUpperCase());

const identityLine = computed(() => {
  const learnerId = props.learnerId?.trim() || '';
  const email = props.email?.trim() || '';

  if (learnerId && email) return `${learnerId} • ${email}`;
  if (learnerId) return learnerId;
  if (email) return email;
  return '';
});

// 6 card for personal data
const metrics = computed<MetricItem[]>(() => [
  { label: 'សមិទ្ធផលសម្រេចបាន', value: props.totalHours, subvalue: 'ម៉ោងអនុវត្តសរុប', icon: 'award' },
  { label: 'ចំនួនសំណួរដែលបានដោះស្រាយ', value: props.solvedMcqs, icon: 'book' },
  { label: 'រដូវកាលសរុប', value: props.totalSeason, subvalue: props.totalSeasonRange, icon: 'calendar' },
  { label: 'ចំណាត់ថ្នាក់ខ្ពស់បំផុត', value: props.highestRank, icon: 'ranking' },
  { label: 'ដើមឈើជីវិត', value: props.treeOfLife, icon: 'tree' },
  { label: 'កាលបរិច្ឆេទមានប្រសិទ្ធភាព', value: props.effectiveDate, icon: 'shield' },
]);

// fake qr code
const qrPattern = [
  1, 0, 1, 1, 0, 1, 0, 1, 1,
  0, 1, 0, 1, 1, 0, 1, 0, 1,
  1, 1, 0, 0, 1, 1, 0, 1, 0,
  0, 1, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 0, 1, 0, 1, 1, 0,
  0, 1, 0, 1, 1, 1, 0, 1, 1,
  1, 0, 1, 1, 0, 1, 0, 0, 1,
  1, 1, 0, 0, 1, 0, 1, 1, 0,
  0, 1, 1, 0, 1, 1, 0, 1, 1,
].map((filled, index) => ({
  id: index,
  filled: Boolean(filled),
}));
</script>

<template>
  <section class="flex items-center justify-center overflow-x-hidden bg-white p-3 text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.78),rgba(15,23,42,0.96)_42%,rgba(2,6,23,1)_100%)] sm:p-6 lg:p-8">
    <div class="mx-auto flex w-full justify-center">
      <div class="w-full max-w-[297mm]">
        <div class="certificate-shell certificate-a4 mx-auto w-full rounded-[1.75rem] p-[10px] shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
          <div class="certificate-frame relative flex h-full flex-col rounded-[1.45rem] bg-white px-5 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-5">
            <header class="relative z-10 border-b border-[#d8c7a0] pb-4 text-center">
              <div class="flex items-start justify-between gap-4">

                <!-- logo image  -->
                <div class="mx-auto flex flex-col items-center">
                  <div class="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-[#d8c7a0] bg-transparent p-2.5 shadow-none sm:h-20 sm:w-20">
                    <img src="/logo.png" alt="Scientia Officialis Logo" class="h-full w-full object-contain" />
                  </div>
                  
                  <h1 class="certificate-title text-3xl sm:text-4xl lg:text-[2.9rem]">
                    វិញ្ញាបនបត្រ
                  </h1>
                  <p class="mt-1.5 font-kantumruy text-sm text-slate-700 sm:text-base">
                    លិខិតបញ្ជាក់ការខិតខំប្រឹងប្រែង និងសមិទ្ធផលសិក្សា
                  </p>
                </div>
              </div>
            </header>

            <div class="relative z-10 py-2 text-center sm:py-3">
              <p class="font-kantumruy text-sm tracking-[0.18em] text-slate-500 sm:text-base">
                ប្រគល់ជូន
              </p>

              <!-- // show the english name as the upper case -->
              <h2 class="mt-1.5 font-kohsantepheap text-3xl font-black tracking-[0.08em] text-slate-950 sm:text-4xl lg:text-[2.6rem]">
                {{ displayName || ' ' }}
              </h2>
              <div class="mx-auto mt-2 h-[2px] w-52 max-w-full rounded-full bg-[linear-gradient(90deg,transparent,rgba(181,138,42,0.95),transparent)]"></div>
              <p class="mt-1.5 font-kantumruy text-sm text-slate-500 sm:text-base">
                {{ identityLine || ' ' }}
              </p>
            </div>

            <div class="relative z-10 grid gap-4 border-y border-[#e2d5b5] py-4 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-3 lg:py-4">
              <div
                v-for="metric in metrics"
                :key="metric.label"
                class="flex items-start gap-4 rounded-2xl border border-[#efe5d0] bg-transparent px-4 py-3"
              >
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8c7a0] bg-transparent text-[#8b6a22] shadow-none">
                  <svg v-if="metric.icon === 'award'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="5"></circle>
                    <path d="M8.5 13.5 7 21l5-2.8L17 21l-1.5-7.5"></path>
                  </svg>
                  <svg v-else-if="metric.icon === 'book'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <svg v-else-if="metric.icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                    <path d="M16 2v4"></path>
                    <path d="M8 2v4"></path>
                    <path d="M3 10h18"></path>
                  </svg>
                  <svg v-else-if="metric.icon === 'ranking'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 20V10"></path>
                    <path d="M12 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                  <svg v-else-if="metric.icon === 'tree'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22v-7"></path>
                    <path d="M7 15c-2.2 0-4-1.8-4-4 0-1.7 1.1-3.2 2.6-3.8A5.5 5.5 0 0 1 11 3a5.8 5.8 0 0 1 5.7 4.6A4.5 4.5 0 0 1 21 12c0 2.2-1.8 4-4 4H7z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7z"></path>
                    <path d="M9.5 12.5l1.7 1.7 3.8-4.2"></path>
                  </svg>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="font-kantumruy text-sm font-bold text-slate-700 sm:text-[15px]">{{ metric.label }}</p>
                  <p class="mt-1 font-sans text-xl font-semibold text-slate-950 sm:text-[1.7rem]">
                    {{ metric.value || ' ' }}
                  </p>
                  <p v-if="metric.subvalue" class="mt-1 font-kantumruy text-sm text-slate-500">
                    {{ metric.subvalue }}
                  </p>
                </div>
              </div>
            </div>

            <!-- // footer of the certificate -->
            <div class="relative z-10 mt-auto flex items-end justify-between gap-2 pt-0.5 pb-1.5 lg:pb-2">
              <div class="flex-1 pr-2 text-left">
                <p class="font-kantumruy text-[10px] italic leading-4.5 text-slate-500 sm:text-[11px]">
                  កំណត់សម្គាល់៖ បុគ្គលដែលក្លែងបន្លំវិញ្ញាបនបត្រទទួលស្គាល់សមត្ថភាព ដែលចេញដោយស្ថាប័ន Scientia Officialis នឹងត្រូវផ្តន្ទាទោសតាមច្បាប់ជាធរមាន។
                </p>
              </div>

              <div class="w-[7.5rem] shrink-0 text-center">
                <div class="qr-verify mx-auto">
                  <div class="qr-finder qr-finder-tl"></div>
                  <div class="qr-finder qr-finder-tr"></div>
                  <div class="qr-finder qr-finder-bl"></div>
                  <div class="qr-grid">
                    <span
                      v-for="cell in qrPattern"
                      :key="cell.id"
                      class="qr-cell"
                      :class="cell.filled ? 'qr-cell-filled' : 'qr-cell-empty'"
                    ></span>
                  </div>
                  <div class="qr-badge" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                </div>
                <div class="mt-0.5 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(44,62,92,0.85),transparent)]"></div>
                <p class="mt-0.5 font-kantumruy text-[10px] text-slate-700">ស្កេនផ្ទៀងផ្ទាត់</p>
                <p class="mt-0.5 font-sans text-[9px] uppercase tracking-[0.12em] text-slate-400">QR Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.certificate-shell {
  background: #fbf4e6;
  border: 1px solid #ead7b3;
}

.certificate-a4 {
  width: 100%;
  max-width: 297mm;
  aspect-ratio: 297 / 210;
  height: auto;
  min-height: 0;
}

.certificate-frame {
  border: 1px solid #efe2c7;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.98);
}

.certificate-title {
  font-family: 'Khmer OS Muol Light', 'Moul', 'Koh Santepheap', serif;
  display: inline-block;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.35;
  padding-top: 0.14em;
  background: linear-gradient(180deg, #d9ba6b 0%, #b58321 44%, #7f5d1d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.qr-verify {
  position: relative;
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto;
  border: 1px solid #d1d5db;
  border-radius: 0.35rem;
  background: #fff;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  width: 2.35rem;
  height: 2.35rem;
}

.qr-cell {
  border-radius: 1px;
}

.qr-cell-filled {
  background: #4b5563;
  opacity: 0.8;
}

.qr-cell-empty {
  background: transparent;
}

.qr-finder {
  position: absolute;
  width: 0.7rem;
  height: 0.7rem;
  border: 2px solid #111827;
  background: #fff;
}

.qr-finder::after {
  content: '';
  position: absolute;
  inset: 0.12rem;
  background: #111827;
}

.qr-finder-tl {
  top: 0.3rem;
  left: 0.3rem;
}

.qr-finder-tr {
  top: 0.3rem;
  right: 0.3rem;
}

.qr-finder-bl {
  bottom: 0.3rem;
  left: 0.3rem;
}

.qr-badge {
  position: absolute;
  display: grid;
  place-items: center;
  width: 0.95rem;
  height: 0.95rem;
  border: 2px solid #fff;
  border-radius: 9999px;
  background: #4ade80;
  color: #fff;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.22);
}

@media (max-width: 1024px) {
  .certificate-a4 {
    min-height: auto;
  }
}

@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  .certificate-a4 {
    width: 297mm;
    min-width: 297mm;
    max-width: 297mm;
    height: 210mm;
    min-height: 210mm;
    max-height: 210mm;
    aspect-ratio: auto;
    border-radius: 0;
    box-shadow: none;
  }

  .certificate-frame {
    border-radius: 0;
  }
}
</style>
