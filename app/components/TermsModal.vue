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
        class="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <div class="w-full max-w-[560px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">

          <div class="bg-[#e6f4ea] dark:bg-emerald-950/80 px-6 py-5 border-b border-[#cce5d3] dark:border-emerald-400/20 flex items-center gap-3">
            <img src="/logo.png" class="w-9 h-9 object-contain" alt="Logo" />
            <h2 class="font-kantumruy font-bold text-gray-900 dark:text-emerald-50 text-[17px] md:text-[19px]">
              លក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាព
            </h2>
          </div>

          <div class="px-6 py-5 overflow-y-auto flex-1 text-[14px] md:text-[15px] leading-[1.9] font-kantumruy text-gray-700 dark:text-slate-300">
            <p class="mb-3">
              សូមស្វាគមន៍មកកាន់ <strong>ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា</strong>។ មុនពេលបន្តប្រើប្រាស់ សូមអានលក្ខខណ្ឌខាងក្រោម៖
            </p>
            <ul class="list-disc pl-5 space-y-2 mb-3">
              <li>ព័ត៌មានរបស់លោកអ្នក (ឈ្មោះ អ៊ីមែល រូបតំណាង) ប្រើសម្រាប់តែបញ្ជាក់អត្តសញ្ញាណ និងតារាងចំណាត់ថ្នាក់ប៉ុណ្ណោះ។</li>
              <li>យើងប្តេជ្ញាមិនចែករំលែកទិន្នន័យនេះទៅតតិយជនឡើយ។</li>
              <li>រាល់ខ្លឹមសារ វិញ្ញាសា និងសំណួរ-ចម្លើយនៅក្នុងប្រព័ន្ធនេះ ត្រូវបានដកស្រង់យ៉ាងសម្រិតសម្រាំង និងផ្អែកទាំងស្រុងលើឯកសារជាតិ លិខិតបទដ្ឋានគតិយុត្ត និងឯកសារផ្លូវការរបស់ក្រសួង-ស្ថាប័នជាធរមាន។ </li>
              <li>ទេាះជាយ៉ាងណា ប្រព័ន្ធនេះត្រូវបានបង្កើតឡើងសម្រាប់គោលដៅជា "ថ្នាលអប់រំ និងជំនួយស្មារតី" ប៉ុណ្ណោះ។ សម្រាប់ការប្រើប្រាស់ជាអំណះអំណាងផ្លូវច្បាប់និងផ្លូវការ លោកអ្នកត្រូវយោងទៅលើឯកសារច្បាប់ដើមដោយផ្ទាល់។</li>
              <li>លោកអ្នកមានសិទ្ធិស្នើសុំកែប្រែ ឬលុបទិន្នន័យរបស់ខ្លួនចេញពីប្រព័ន្ធនៅពេលណាក៏បាន។</li>
            </ul>
            
          </div>

          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-[#f8fafc] dark:bg-slate-950/65">
            <label
              class="flex items-start gap-3 cursor-pointer mb-4 p-3 rounded-xl border-2 transition-colors select-none"
              :class="accepted
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400'
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'"
            >
              <input
                v-model="accepted"
                type="checkbox"
                class="sr-only peer"
              />
              <span
                class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all"
                :class="accepted
                  ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400'
                  : 'bg-white border-gray-400 dark:bg-slate-800 dark:border-slate-500'"
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
              <span class="font-kantumruy text-[14px] text-gray-800 dark:text-slate-200 leading-relaxed">
                ខ្ញុំបានអាន និងយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាព។
              </span>
            </label>

            <p v-if="errorMsg" class="text-red-500 font-kantumruy text-[13px] mb-3">{{ errorMsg }}</p>

            <button
              :disabled="!accepted || submitting"
              @click="handleAccept"
              class="w-full bg-[#1e3a8a] dark:bg-amber-600 hover:bg-gray-800 dark:hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-2xl font-bold font-kantumruy text-[15px] md:text-[16px] shadow-lg active:scale-[0.98] transition-all"
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
