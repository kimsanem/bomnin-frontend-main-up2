<script setup>
import { ref, computed } from 'vue';
import { toJpeg } from 'html-to-image';

const props = defineProps({
  isOpen: Boolean,
  questionText: String, 
  isCorrect: Boolean,
  correctOptionKey: String,
  correctOptionText: String,
  explanation: String,
  source: String,
  optionLabelFn: Function, 
  isEnglish: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'next']);

const modalContentRef = ref(null);
const isGenerating = ref(false);

const labels = computed(() => ({
  correctAnswer: props.isEnglish ? 'Correct Answer:' : 'ចម្លើយត្រឹមត្រូវ៖',
  explanationTitle: props.isEnglish ? 'Explanation' : 'ហេតុផល និង ការបកស្រាយ',
  noExplanation: props.isEnglish ? 'No explanation available.' : 'មិនមានការពន្យល់បន្ថែមសម្រាប់សំណួរនេះទេ។',
  source: props.isEnglish ? 'Source:' : 'ប្រភព៖',
  nextBtn: props.isEnglish ? 'Next Question' : 'បន្តសំណួរ',
  save: props.isEnglish ? 'Save' : 'រក្សាទុក',
  share: props.isEnglish ? 'Share' : 'ចែករំលែក',
}));

// --- មុខងារបង្កើតរូបភាព ---
const generateImage = async () => {
  if (!modalContentRef.value) return null;
  isGenerating.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 150)); 
    const dataUrl = await toJpeg(modalContentRef.value, { 
        quality: 1.0, 
        backgroundColor: '#ffffff', 
        pixelRatio: 2 
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (error) {
    console.error('Error generating image:', error);
    alert("បរាជ័យក្នុងការបង្កើតរូបភាព");
    return null;
  } finally {
    isGenerating.value = false;
  }
};

const handleSaveImage = async () => {
  const blob = await generateImage();
  if (!blob) return;
  const link = document.createElement('a');
  link.download = `ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា-QCM-${Date.now()}.jpg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};

const handleShareImage = async () => {
  const blob = await generateImage();
  if (!blob) return;
  
  const file = new File([blob], `PCC-ប្រព័ន្ធបំណិនមន្ត្រីវិទ្យា-QCM-${Date.now()}.jpg`, { type: "image/jpeg" });
  
  // ដក title និង text ចេញទាំងអស់ ទុកតែ files មួយមុខគត់ 
  // ព្រោះ Telegram/Messenger នឹងលុបរូបចោលបើមានអក្សរភ្ជាប់មកជាមួយ
  const shareData = {
      files: [file]
  };
  
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== 'AbortError') {
          console.error('Error sharing via API:', error);
          fallbackShare(blob);
      }
    }
  } else {
     fallbackShare(blob);
  }
};

// មុខងារបម្រុង
const fallbackShare = async (blob) => {
    try {
        // Clipboard API ភាគច្រើនដើរស្រួលជាមួយ PNG បើទោះជា file ដើមជា JPG ក៏ដោយ
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        alert(props.isEnglish ? "Image copied! You can now paste it in Telegram/Messenger." : "រូបភាពត្រូវបានចម្លង! អ្នកអាច Paste វាចូលទៅក្នុងកម្មវិធីផ្សេងៗឥឡូវនេះបាន។");
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        alert(props.isEnglish ? "Your device does not support direct image sharing." : "ឧបករណ៍របស់អ្នកមិនគាំទ្រការ Share រូបភាពដោយផ្ទាល់ទេ។ សូមប្រើប៊ូតុង 'រក្សាទុក (Save)' វិញ។");
    }
};


const handleClose = () => {
  emit('next');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="handleClose">
        
        <div class="w-full max-w-[600px] flex flex-col gap-4 animate-scale-up relative">

          <button @click="handleClose" class="absolute -top-10 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div ref="modalContentRef" class="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 dark:border-white/10 dark:bg-slate-900">
            
            <div class="bg-[#e6f4ea] p-5 md:p-6 flex items-start gap-4 border-b border-[#cce5d3] dark:border-emerald-400/20 dark:bg-emerald-950/80">
               <div class="w-8 h-8 md:w-10 md:h-10 shrink-0 mt-0.5">
                   <img src="/logo.png" class="w-full h-full object-contain" alt="Logo" />
               </div>
               <h2 class="font-kantumruy font-bold text-gray-900 text-[16px] md:text-[18px] leading-relaxed dark:text-emerald-50">
                  {{ questionText }}
               </h2>
            </div>

            <div class="p-5 md:p-6 bg-white relative dark:bg-slate-900">
               <div class="border-l-[4px] border-[#d97706] pl-4 md:pl-6 py-1">
                  
                  <div class="mb-5">
                     <div class="flex items-center gap-2 mb-1.5">
                        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span class="font-kantumruy font-bold text-[#166534] text-[15px] md:text-[16px] dark:text-emerald-300">
                            {{ labels.correctAnswer }}
                        </span>
                     </div>
                     <p class="font-kantumruy font-bold text-gray-900 text-[15px] md:text-[17px] ml-7 dark:text-slate-100">
                        {{ optionLabelFn(correctOptionKey) }} {{ correctOptionText }}
                     </p>
                  </div>

                  <div class="mb-2">
                     <div class="flex items-center gap-2 mb-2">
                        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5A4.8 4.8 0 0 0 18 8 6 6 0 0 0 6 8c0 1.4.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                          </svg>
                        </span>
                        <h3 class="font-bold text-gray-800 font-kantumruy text-[15px] md:text-[16px] dark:text-slate-100">
                            {{ labels.explanationTitle }}
                        </h3>
                     </div>
                     <p class="text-gray-700 font-kantumruy leading-[1.8] text-[14px] md:text-[16px] whitespace-pre-wrap ml-7 dark:text-slate-300">
                        {{ explanation || labels.noExplanation }}
                     </p>
                  </div>
               </div>
            </div>

            <div v-if="source" class="bg-[#f8fafc] px-5 py-4 md:px-7 md:py-5 flex items-start gap-3 border-t border-gray-100 w-full overflow-hidden dark:border-white/10 dark:bg-slate-950/65">
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 7v14" />
                  <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5z" />
                  <path d="M12 3h6.5A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 0-2.5-2.5H12" />
                </svg>
              </span>
              <p class="text-gray-500 font-kantumruy text-[13px] md:text-[15px] leading-relaxed mt-1 flex-1 min-w-0 w-full break-words dark:text-slate-400">
                  <span class="font-bold">{{ labels.source }}</span> {{ source }}
              </p>
            </div>
          </div>

          <div class="mt-2 flex flex-col gap-3">
              
              <div class="flex items-center gap-3 w-full">
                  <button @click="handleSaveImage" :disabled="isGenerating" class="flex items-center justify-center gap-2 bg-[#e0e7ff] text-[#4338ca] px-5 py-3 rounded-full font-bold font-kantumruy hover:bg-[#c7d2fe] transition-colors shadow-sm text-[14px] disabled:opacity-50 dark:bg-indigo-400/15 dark:text-indigo-200 dark:hover:bg-indigo-400/25">
                      <span>{{ labels.save }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>

                  <button @click="handleShareImage" :disabled="isGenerating" class="flex-1 flex items-center justify-center gap-2 bg-[#3eb36a] text-white px-5 py-3 rounded-full font-bold font-kantumruy hover:bg-[#329858] transition-colors shadow-sm text-[14px] disabled:opacity-50">
                      <span v-if="!isGenerating">{{ labels.share }}</span>
                      <span v-else class="animate-pulse">កំពុងដំណើរការ...</span>
                      <svg v-if="!isGenerating" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </button>
              </div>

              <button @click="handleClose" class="w-full bg-[#1e3a8a] text-white px-5 py-3.5 md:py-4 rounded-2xl font-bold font-kantumruy text-[15px] md:text-[16px] hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 dark:bg-amber-600 dark:hover:bg-amber-500">
                  <span>{{ labels.nextBtn }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
              
          </div>

        </div>
      </div>

    </Transition>
  </Teleport>
</template>

<style scoped>
.font-kantumruy { font-family: 'Kantumruy Pro', 'Hanuman', sans-serif; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(15px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
