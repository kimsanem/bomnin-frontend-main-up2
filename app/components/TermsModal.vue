<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['accepted']);

const user = useCookie('user_data', { maxAge: 60 * 60 * 24 * 30, path: '/' });
const accepted = ref(false);
const submitting = ref(false);
const errorMsg = ref('');

const handleAccept = async () => {
  if (!accepted.value || submitting.value) return;
  submitting.value = true;
  errorMsg.value = '';
  try {
    const res = await $api('/user/accept-terms', { method: 'POST' });
    if (user.value) user.value = { ...user.value, terms_accepted_at: res.terms_accepted_at };
    emit('accepted');
  } catch (e) {
    errorMsg.value = 'មិនអាចរក្សាទុកបានទេ សូមព្យាយាមម្តងទៀត។';
    console.error(e);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="terms-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-500/20 p-3 backdrop-blur-md sm:p-4"
      >
        <div class="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-slate-900">

          <div class="flex items-center gap-3 border-b border-[#cce5d3] bg-[#e6f4ea] px-4 py-4 dark:border-emerald-400/20 dark:bg-emerald-950/80 sm:px-6 sm:py-5">
            <img src="/logo.png" class="h-8 w-8 object-contain sm:h-9 sm:w-9" alt="Logo" />
            <h2 class="font-kantumruy text-[16px] font-black leading-7 text-slate-900 dark:text-emerald-50 sm:text-[19px]">
              លក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាព
            </h2>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 font-kantumruy text-[15px] leading-[1.8] text-slate-700 dark:text-slate-200 sm:px-6 sm:py-5 sm:text-[15px]">
            <p class="mb-4 leading-[1.85] text-slate-700 dark:text-slate-200">
              សូមស្វាគមន៍មកកាន់ <strong>ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា</strong>។ មុនពេលបន្តប្រើប្រាស់ សូមអានលក្ខខណ្ឌខាងក្រោម៖
            </p>
            <ul class="mb-3 list-disc space-y-3 pl-5 leading-[1.9] text-slate-600 marker:text-slate-500 dark:text-slate-200 dark:marker:text-slate-400">
              <li>ព័ត៌មានរបស់លោកអ្នក (ឈ្មោះ អ៊ីមែល រូបតំណាង) ប្រើសម្រាប់តែបញ្ជាក់អត្តសញ្ញាណ និងតារាងចំណាត់ថ្នាក់ប៉ុណ្ណោះ។</li>
              <li>យើងប្តេជ្ញាមិនចែករំលែកទិន្នន័យនេះទៅតតិយជនឡើយ។</li>
              <li>រាល់ខ្លឹមសារ វិញ្ញាសា និងសំណួរ-ចម្លើយនៅក្នុងប្រព័ន្ធនេះ ត្រូវបានដកស្រង់យ៉ាងសម្រិតសម្រាំង និងផ្អែកទាំងស្រុងលើឯកសារជាតិ លិខិតបទដ្ឋានគតិយុត្ត និងឯកសារផ្លូវការរបស់ក្រសួង-ស្ថាប័នជាធរមាន។ </li>
              <li>ទេាះជាយ៉ាងណា ប្រព័ន្ធនេះត្រូវបានបង្កើតឡើងសម្រាប់គោលដៅជា "ថ្នាលអប់រំ និងជំនួយស្មារតី" ប៉ុណ្ណោះ។ សម្រាប់ការប្រើប្រាស់ជាអំណះអំណាងផ្លូវច្បាប់និងផ្លូវការ លោកអ្នកត្រូវយោងទៅលើឯកសារច្បាប់ដើមដោយផ្ទាល់។</li>
              <li>លោកអ្នកមានសិទ្ធិស្នើសុំកែប្រែ ឬលុបទិន្នន័យរបស់ខ្លួនចេញពីប្រព័ន្ធនៅពេលណាក៏បាន។</li>
            </ul>
            
          </div>

          <div class="border-t border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/65 sm:px-6">
            <label
              class="mb-4 flex cursor-pointer select-none items-start gap-3 rounded-xl border-2 p-3.5 transition-colors"
              :class="accepted
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400'
                : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-500'"
            >
              <input
                v-model="accepted"
                type="checkbox"
                class="sr-only peer"
              />
              <span
                class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all"
                :class="accepted
                  ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
                  : 'border-slate-400 bg-white dark:border-slate-500 dark:bg-slate-800'"
              >
                <svg
                  v-if="accepted"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span class="font-kantumruy text-[14px] leading-7 text-slate-800 dark:text-slate-100 sm:text-[15px]">
                ខ្ញុំបានអាន និងយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាព។
              </span>
            </label>

            <p v-if="errorMsg" class="mb-3 font-kantumruy text-[13px] text-red-500">{{ errorMsg }}</p>

            <button
              :disabled="!accepted || submitting"
              @click="handleAccept"
              class="w-full rounded-2xl bg-[#1e3a8a] px-5 py-3.5 font-kantumruy text-[15px] font-bold text-white shadow-[0_16px_32px_rgba(30,58,138,0.18)] transition-all active:scale-[0.98] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:shadow-[0_16px_32px_rgba(217,119,6,0.18)] dark:hover:bg-amber-500 md:text-[16px]"
            >
              {{ submitting ? 'កំពុងរក្សាទុក...' : 'យល់ព្រម និងបន្ត' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.font-kantumruy { font-family: 'Kantumruy Pro', 'Hanuman', sans-serif; }
.terms-fade-enter-active, .terms-fade-leave-active { transition: opacity 0.3s ease; }
.terms-fade-enter-from, .terms-fade-leave-to { opacity: 0; }
</style>
