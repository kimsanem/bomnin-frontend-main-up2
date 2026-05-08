<script setup>
useHead({
  title: 'ទំព័រដើម',
});
import { ref, onMounted, computed, watchEffect, inject } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter(); 

// --- USER STATE ---
const user = useCookie('user_data', { maxAge: 60 * 60 * 24 * 30, path: '/' }); 
const authToken = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 30, path: '/' });

const isEditingBio = ref(false);
const newBio = ref('');
const isSavingBio = ref(false);
const selectedLeaderboardUser = ref(null);

// 🔥 តារាងកិត្តិយស និងដើមឈើ
const leaderboardUsers = ref([]);
const isLeaderboardLoading = ref(true);

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

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


const socialLinks = ref([]);
const isAddingSocial = ref(false);
const newSocialType = ref('facebook');
const newSocialUrl = ref('');

watchEffect(() => {
    if (user.value) {
        newBio.value = user.value.bio || '';
        socialLinks.value = user.value.socials || []; 
    }
});

const fetchUser = async () => {
    if (authToken.value) {
        try {
            const data = await $api('/user');
            if (data) {
                user.value = data; 
                fetchTreeProgress(); 
            }
        } catch (error) {
            console.error("Session sync issue:", error);
        }
    }
};

const fetchTreeProgress = async () => {
    if (!authToken.value) return;
    try {
        const data = await $api('/tree-progress');
        if (data) {
            treeProgress.value = data;
            
            // ១. ពេល API ដើរ តែមិនមានលីងវីដេអូជាប់មក
            if (!treeProgress.value.video_url) {
                treeProgress.value.video_url = defaultVideoUrl;
            }
        }
    } catch (error) {
        console.error("Failed to fetch tree progress:", error);
        
        // ២. ពេល Server Backend គាំង ឱ្យវាទាញវីដេអូពី Local ទៅបង្ហាញតែម្តង
        treeProgress.value.video_url = defaultVideoUrl;
    }
};

const fetchLeaderboard = async () => {
    isLeaderboardLoading.value = true;
    try {
        const response = await $api('/leaderboard/honor-roll');
        if (response) {
            leaderboardUsers.value = response;
        }
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
    } finally {
        isLeaderboardLoading.value = false;
    }
};

const openLeaderboardUser = (userItem) => {
    selectedLeaderboardUser.value = userItem;
};

const closeLeaderboardUser = () => {
    selectedLeaderboardUser.value = null;
};

const saveSocialsToDB = async (updatedSocials) => {
    if (!authToken.value) return;
    try {
        await $api('/user/socials', {
            method: 'PUT',
            body: { socials: updatedSocials }
        });
        if(user.value) user.value.socials = updatedSocials; 
    } catch (err) {
        console.error("Failed to save socials:", err);
    }
};

const buildSocialUrl = (type, raw) => {
    let input = raw.trim();
    if (!input) return '';

    if (type === 'telegram') {
        if (/^https?:\/\//i.test(input)) return input;
        let handle = input.replace(/^@+/, '').trim();
        if (/^\+?\d[\d\s-]*$/.test(handle)) {
            const digits = handle.replace(/[^\d]/g, '');
            return `https://t.me/+${digits}`;
        }
        return `https://t.me/${handle}`;
    }

    if (type === 'tiktok') {
        if (/^https?:\/\//i.test(input)) return input;
        const handle = input.replace(/^@+/, '').trim();
        return `https://www.tiktok.com/@${handle}`;
    }

    if (/^https?:\/\//i.test(input)) return input;
    if (type === 'facebook') return `https://facebook.com/${input.replace(/^@+/, '')}`;
    if (type === 'instagram') return `https://instagram.com/${input.replace(/^@+/, '')}`;
    return input;
};

const addSocialLink = async () => {
  const url = buildSocialUrl(newSocialType.value, newSocialUrl.value);
  if (!url) return;

  socialLinks.value.push({ type: newSocialType.value, url });
  await saveSocialsToDB(socialLinks.value);

  newSocialUrl.value = '';
  isAddingSocial.value = false;
};

const removeSocialLink = async (index) => {
    socialLinks.value.splice(index, 1);
    await saveSocialsToDB(socialLinks.value); 
};

const getOptimizedAvatar = (url, name) => {
    const defaultName = name || 'Guest';
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=1e3a8a&color=fff&size=128`;
    
    if (url.includes('googleusercontent.com')) {
        return url.split('=')[0] + '=s120-c';
    }
    return url;
};

const handleImageError = (event) => {
    event.target.onerror = null; 
    const name = encodeURIComponent(user.value?.name || 'User');
    event.target.src = `https://ui-avatars.com/api/?name=${name}&background=1e3a8a&color=fff&rounded=true&bold=true&size=128`;
};

const openBioModal = () => {
    if (!user.value) {
        alert("សូមចូលគណនីជាមុនសិន ដើម្បីកែប្រែប្រវត្តិរូប។");
        return;
    }
    newBio.value = user.value.bio || '';
    isEditingBio.value = true;
};

const saveBio = async () => {
    if (!user.value) return;

    isSavingBio.value = true;
    const originalBio = user.value.bio; 
    user.value.bio = newBio.value;
    
    try {
        if (authToken.value) {
             await $api('/user/bio', {
                method: 'PUT', 
                body: { bio: newBio.value }
            });
        }
        isEditingBio.value = false;
    } catch (err) {
        console.error("Save to server failed:", err);
        alert("មានបញ្ហាក្នុងការរក្សាទុក។");
        user.value.bio = originalBio; 
        isEditingBio.value = false; 
    } finally {
        isSavingBio.value = false;
    }
};

onMounted(() => {
    fetchUser();
    fetchLeaderboard();
});

// FETCH CATEGORIES
const { data: apiResponse, pending, error } = await useFetch(`${baseUrl}/categories`, {
    headers: {
        'Accept': 'application/json',
        'Authorization': authToken.value ? `Bearer ${authToken.value}` : ''
    }
});

const courses = computed(() => {
  const staticLayout = [
    { key: 'Khmerology', header: 'ខេមរវិទ្យា និង មនុស្សសាស្ត្រ', theme: 'red', slugs: ['geography', 'anthropology', 'history', 'arts'] },
    { key: 'Administration', header: 'វិទ្យាសាស្ត្រនយោបាយ និង រដ្ឋបាល', theme: 'blue', slugs: ['rule-of-law', 'religion', 'politics', 'economy'] },
    { key: 'Skills', header: 'វិទ្យាសាស្ត្រអនុវត្ត និង ជំនាញវិជ្ជាជីវៈ', theme: 'green', slugs: ['agriculture', 'science', 'language', 'logic'] }
  ];

  const apiGroups = apiResponse.value?.data || apiResponse.value || {};
  let flatApiCategories = [];
  
  if (Array.isArray(apiGroups)) {
      flatApiCategories = apiGroups;
  } else if (typeof apiGroups === 'object') {
      flatApiCategories = Object.values(apiGroups).flat();
  }

  return staticLayout.map(section => ({
    ...section,
    items: section.slugs.map(slug => {
      // ស្វែងរកទិន្នន័យ (ដូចជា progress) ពី API បើមាន បើអត់ទេវានឹងកំណត់ត្រឹម 0 
      const apiCat = flatApiCategories.find(c => c && c.slug === slug);
      return {
        id: apiCat?.id || slug,
        slug: slug,
        title: getKhmerTitle(slug, apiCat?.name || ''), 
        quote: getQuoteForCategory(slug), 
        icon: getIconForCategory(section.icon, slug), 
        subItems: getSubItemsForCategory(slug),
        progress: apiCat?.progress || 0 
      };
    })
  }));
});

// HELPER FUNCTIONS
const getKhmerTitle = (slug, defaultName) => {
  const titles = { 'geography': 'ភូមិសាស្ត្រ & ធនធាន', 'anthropology': 'នរវិទ្យា & ប្រជាសាស្ត្រ', 'history': 'ប្រវត្តិសាស្ត្រ & អរិយធម៌', 'arts': 'សិល្បៈ & បេតិកភណ្ឌ', 'rule-of-law': 'នីតិរដ្ឋ & ការគ្រប់គ្រង', 'religion': 'ជំនឿ & សាសនា', 'politics': 'នយោបាយ & យុទ្ធសាស្ត្រ', 'economy': 'សេដ្ឋកិច្ច & សង្គមកិច្ច', 'agriculture': 'កសិកម្ម & ឧស្សាហកម្ម', 'science': 'វិទ្យាសាស្ត្រ & នវានុវត្តន៍', 'language': 'ភាសា & ទំនាក់ទំនង', 'logic': 'តក្កវិជ្ជា & QCM' };
  return titles[slug] || (defaultName || slug);
};
const getSubItemsForCategory = (slug) => {
  const mappings = { 'geography': ['ផែនទី, ព្រំដែន, ទន្លេ, រ៉ែ និងសក្តានុពលភូមិសាស្ត្រ ...'], 'anthropology': ['ជនជាតិ, ជំរឿន, យុវជន, ទេសន្តរប្រវេសន៍, កម្លាំងពលកម្ម ...'], 'history': ['សម័យកាល, ព្រឹត្តិការណ៍, មេរៀន, សន្ធិសញ្ញា, សង្គ្រាម និងសន្តិភាព, ... '], 'arts': ['ប្រាសាទ, របាំ, អក្សរសាស្ត្រ, UNESCO, បេតិកភណ្ឌ, បុណ្យជាតិ... ',], 'rule-of-law': ['រដ្ឋធម្មនុញ្ញ, លិខិតរដ្ឋបាល, សហលក្ខន្តិកៈ, វិមជ្ឈការ & វិសហមជ្ឈការ, ការផ្តល់សេវា ...',], 'religion': ['ពុទ្ធសាសនា, ទសពិធរាជធម៌, ក្រមសីលធម៌, សុខដុមនីយកម្មសាសនា ... '], 'politics': ['យុទ្ធសាស្រ្ដជាតិ, នយោបាយឈ្នះ-ឈ្នះ, ការទូត, អាស៊ាន ... '], 'economy': ['ហិរញ្ញវត្ថុសាធារណៈ, សេដ្ឋកិច្ច, ពន្ធដារ, វិនិយោគ, ពាណិជ្ជកម្មអន្តរជាតិ ...'], 'agriculture': ['ដំណាំយុទ្ធសាស្ត្រ, SME, ផលិតកម្ម, តំបន់សេដ្ឋកិច្ចពិសេស ...'], 'science': ['ឌីជីថល, AI, STEM, រដ្ឋាភិបាលឌីជីថល, សន្តិសុខសាយប័រ ...'], 'language': ['វេយ្យាករណ៍, ពាក្យ និង អំណាន, ការនិយាយ, របៀបសរសេរ ...'], 'logic': ['IQ, គណិតរដ្ឋបាល, ការគិត, ការដោះស្រាយបញ្ហា, ការគិតស៊ីជម្រៅ ... '] };
  return mappings[slug] || ['មេរៀនសង្ខេប', 'លំហាត់អនុវត្ត'];
};
const getQuoteForCategory = (slug) => {
  const quotes = { 'geography': '"ស្គាល់ទឹកដី ទើបការពារទឹកដីបាន"', 'anthropology': '"ស្គាល់មនុស្ស គឺស្គាល់កម្លាំងជាតិ"', 'history': '"ស្គាល់អតីតកាល ដើម្បីតម្រង់ទិសអនាគត"', 'arts': '"វប្បធម៌រលត់ ជាតិរលាយ"', 'rule-of-law': '"ច្បាប់ជាក្បួន តម្រាជាផ្លូវ"', 'religion': '"ចំណេះត្រូវគូនឹងគុណធម៌"', 'politics': '"ស្គាល់ស្ថានភាព ដើម្បីដឹកនាំជោគវាសនា"', 'economy': '"ពង្រឹងសេដ្ឋកិច្ច ដើម្បីឯករាជ្យភាព"', 'agriculture': '"ផលិតភាពជាមូលដ្ឋាននៃភាពរុងរឿង"', 'science': '"ទំនើបកម្ម ដើម្បីវឌ្ឍនភាព"', 'language': '"ភាសាជាស្ពាន ទំនាក់ទំនងជាកម្លាំង"', 'logic': '"គិតត្រឹមត្រូវ សម្រេចចិត្តច្បាស់លាស់"' };
  return quotes[slug] || '"ចំណេះដឹងគឺជាអំណាច"';
};
const getIconForCategory = (defaultIcon, slug) => {
    const icons = { 'history': 'history', 'arts': 'globe', 'religion': 'wheel', 'politics': 'strategy', 'economy': 'economy', 'science': 'robot', 'language': 'book', 'logic': 'gear' };
    return icons[slug] || defaultIcon;
};

const cardGradientThemes = computed(() => ({
    1:  { left: '#60a5fa', right: '#14b8a6', glow: 'rgba(59,130,246,0.1)' },
    2:  { left: '#22c55e', right: '#4ade80', glow: 'rgba(34,197,94,0.1)' },
    3:  { left: '#f59e0b', right: '#fbbf24', glow: 'rgba(245,158,11,0.1)' },
    4:  { left: '#38bdf8', right: '#2563eb', glow: 'rgba(56,189,248,0.1)' },
    5:  { left: '#60a5fa', right: '#06b6d4', glow: 'rgba(96,165,250,0.1)' },
    6:  { left: '#f472b6', right: '#fb7185', glow: 'rgba(244,114,182,0.1)' },
    7:  { left: '#34d399', right: '#22c55e', glow: 'rgba(52,211,153,0.1)' },
    8:  { left: '#facc15', right: '#f59e0b', glow: 'rgba(250,204,21,0.1)' },
    9:  { left: '#fcd34d', right: '#f59e0b', glow: 'rgba(252,211,77,0.1)' },
    10: { left: '#2dd4bf', right: '#06b6d4', glow: 'rgba(45,212,191,0.1)' },
    11: { left: '#3b82f6', right: '#60a5fa', glow: 'rgba(59,130,246,0.1)' },
    12: { left: '#a3e635', right: '#65a30d', glow: 'rgba(163,230,53,0.1)' },
}));

const getCardShellStyle = (cardNumber) => {
    const theme = cardGradientThemes.value[cardNumber] || cardGradientThemes.value[1];
    return {
        background: `linear-gradient(180deg, ${theme.left} 0%, ${theme.right} 55%, ${theme.right} 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.18), 0 6px 0 ${theme.right}, 0 16px 28px ${theme.glow}`,
    };
};

const getCardTitleBarStyle = (cardNumber) => {
    const theme = cardGradientThemes.value[cardNumber] || cardGradientThemes.value[1];
    return {
        background: `linear-gradient(to right, ${theme.left}, ${theme.right})`,
        color: '#ffffff',
    };
};

const getCardProgressTrackStyle = (cardNumber) => {
    const theme = cardGradientThemes.value[cardNumber] || cardGradientThemes.value[1];
    return {
        background: `linear-gradient(180deg, color-mix(in srgb, ${theme.left} 14%, #f8fafc), color-mix(in srgb, ${theme.right} 18%, #e2e8f0))`,
        borderColor: `color-mix(in srgb, ${theme.right} 48%, #cbd5e1)`,
        boxShadow: `inset 0 1px 5px rgba(15,23,42,0.16), 0 8px 18px ${theme.glow}`,
    };
};

const getCardProgressBarStyle = (cardNumber, progress) => {
    const theme = cardGradientThemes.value[cardNumber] || cardGradientThemes.value[1];
    return {
        width: `${progress}%`,
        background: `linear-gradient(90deg, color-mix(in srgb, ${theme.left} 78%, #0f172a), ${theme.left} 38%, ${theme.right})`,
        boxShadow: `0 0 16px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
    };
};

const getCardProgressTextStyle = (cardNumber, progress) => {
    if (progress > 45) return {};
    const theme = cardGradientThemes.value[cardNumber] || cardGradientThemes.value[1];
    return {
        color: `color-mix(in srgb, ${theme.right} 72%, #334155)`,
    };
};

const avatarLevelTheme = computed(() => {
    const level = treeProgress.value?.current_level || 1;

    if (level >= 9) {
        return {
            start: '#f59e0b',
            middle: '#fb7185',
            end: '#8b5cf6',
            glow: 'rgba(245,158,11,0.26)',
        };
    }

    if (level >= 5) {
        return {
            start: '#22c55e',
            middle: '#2dd4bf',
            end: '#3b82f6',
            glow: 'rgba(34,197,94,0.24)',
        };
    }

    return {
        start: '#60a5fa',
        middle: '#38bdf8',
        end: '#14b8a6',
        glow: 'rgba(59,130,246,0.22)',
    };
});

const avatarRingStyle = computed(() => {
    const theme = avatarLevelTheme.value;
    return {
        background: `linear-gradient(135deg, ${theme.start}, ${theme.middle}, ${theme.end})`,
        boxShadow: `0 18px 40px ${theme.glow}`,
    };
});

const currentUserRank = computed(() => {
    if (!user.value || leaderboardUsers.value.length === 0) return null;

    const currentId = user.value.id;
    const currentEmail = user.value.email;
    const currentName = user.value.name;

    const match = leaderboardUsers.value.find((item) => {
        return (currentId && item.id === currentId)
            || (currentEmail && item.email === currentEmail)
            || (currentName && item.name === currentName);
    });

    return match?.rank || null;
});

const toKhmerNumeral = (num) => {
    if (num == null) return '០';
    const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    return num.toString().split('').map(digit => khmerDigits[digit] || digit).join('');
};

// 🔥 ការកែប្រែថ្មី៖ បើ Server គាំង មិនអនុញ្ញាតឱ្យចូលមើលឡើយ ហើយលោត Error
const handleCourseClick = (item) => {
  if (error.value) {
    alert('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។');
    return;
  }
  router.push(`/quiz/${item.slug}`);
};

const { isPlaying, currentTrackIndex, playlist, toggleMusic, nextTrack, prevTrack } = inject('music');
</script>

<template>
  <div class="w-full max-w-[90rem] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 font-kantumruy bg-slate-100/88 backdrop-blur-xl border border-slate-200/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] rounded-[2rem] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_30px_90px_rgba(0,0,0,0.36)]">
    
    <div class="lg:col-span-8 space-y-8 self-start">
      
      <div v-if="pending" class="text-center py-20">
         <div class="animate-spin text-4xl mb-2">⏳</div>
         <p class="text-gray-500 font-bold">កំពុងទាញយកទិន្នន័យ...</p>
      </div>

      <div v-else v-for="(section, sIndex) in courses" :key="sIndex" class="mb-10">
        
        <div class="rounded-[2rem] border-[3px] overflow-hidden bg-white/92 backdrop-blur-md shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:bg-slate-900/80 dark:shadow-[0_18px_48px_rgba(0,0,0,0.34)]"
             :class="{
                'border-[#00d1e0]': section.theme === 'red',
                'border-[#3b82f6]': section.theme === 'blue',
                'border-[#10b981]': section.theme === 'green'
             }">
             
             <div class="px-4 py-3 md:px-6 md:py-4 text-center text-white font-kantumruy font-bold tracking-wide text-sm md:text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-2px_0_rgba(0,0,0,0.12)]"
                  :class="{
                    'bg-[linear-gradient(180deg,#e17b74_0%,#db6a61_58%,#c95b52_100%)]': section.theme === 'red',
                    'bg-[linear-gradient(180deg,#7ea4da_0%,#6e98d3_58%,#5f89c5_100%)]': section.theme === 'blue',
                    'bg-[linear-gradient(180deg,#9fd57a_0%,#90c86a_58%,#7db45a_100%)]': section.theme === 'green'
                  }">
                {{ section.header }}
             </div>

             <div class="grid grid-cols-2 gap-3 bg-white px-3 py-3 dark:bg-slate-950/50 md:gap-5 md:px-10 md:py-5">
                <div 
                    v-for="(item, iIndex) in section.items" 
                    :key="iIndex" 
                    @click="handleCourseClick(item)" 
                    class="relative h-full cursor-pointer rounded-[1.1rem] p-[2.5px] transition-all duration-300 hover:-translate-y-1 md:rounded-[1.75rem] md:p-[5px]"
                    :style="getCardShellStyle((sIndex * 4) + iIndex + 1)"
                >
                    <div
                        class="flex h-full flex-col overflow-hidden rounded-[calc(1.1rem-2.5px)] md:rounded-[calc(1.75rem-5px)]"
                        :class="{
                            'bg-[radial-gradient(circle_at_top_left,rgba(254,226,226,0.7),rgba(255,255,255,0.98)_42%,rgba(254,242,242,0.95)_100%)]': section.theme === 'red',
                            'bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.65),rgba(255,255,255,0.98)_42%,rgba(239,246,255,0.95)_100%)]': section.theme === 'blue',
                            'bg-[radial-gradient(circle_at_top_left,rgba(220,252,231,0.72),rgba(255,255,255,0.98)_42%,rgba(240,253,244,0.95)_100%)]': section.theme === 'green'
                        }"
                    >
                        <div
                            class="border-b border-black/5 px-3 py-2 text-center font-kantumruy text-[11px] font-bold tracking-widest sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3 md:text-base"
                            :style="getCardTitleBarStyle((sIndex * 4) + iIndex + 1)"
                        >
                            {{ item.title }}
                        </div>

                        <div class="flex flex-1 items-start gap-1.5 px-3 py-3 sm:gap-2 md:gap-4 md:px-5 md:py-5">
                            <div class="flex min-w-0 flex-1 flex-col pr-1 md:pr-2">
                                <div class="mb-2 flex items-center gap-1.5 md:gap-2">
                                    <img :src="'/icons/block/block1.png'" alt="Quote" class="h-4 w-4 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(59,130,246,0.18)] sm:h-7 sm:w-7 md:h-12 md:w-12">
                                    <h3 class="min-w-0 flex-1 whitespace-nowrap font-kantumruy text-[7px] font-bold leading-none tracking-tight text-[#111827] dark:text-slate-900 sm:text-[10px] md:text-[0.82rem] md:leading-tight lg:text-[0.95rem]">
                                        {{ item.quote }}
                                    </h3>
                                </div>

                                <div class="flex items-start gap-1.5 md:gap-2">
                                    <img :src="'/icons/block/block2.png'" alt="Pin" class="mt-0.5 h-4 w-4 shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(34,197,94,0.16)] sm:h-6 sm:w-6 md:h-10 md:w-10">
                                    <p class="text-[9px] font-medium leading-relaxed text-gray-600 sm:text-[10px] md:text-sm md:leading-loose lg:text-[15px]">
                                    <span class="line-clamp-3 md:line-clamp-5">
                                        {{ item.subItems.join(', ') }}
                                    </span>
                                    </p>
                                </div>
                            </div>

                            <div class="relative h-10 w-10 shrink-0 self-center sm:h-20 sm:w-20 md:h-[7.5rem] md:w-[7.5rem] lg:h-[8.75rem] lg:w-[8.75rem] lg:translate-y-3">
                               <img 
                                    :src="`/icons/categories/${(sIndex * 4) + iIndex + 1}.png`" 
                                    alt="Category Icon" 
                                    class="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-300"
                               >
                            </div>
                        </div>

                        <div class="px-3 pb-3 md:px-5 md:pb-5">
                            <div
                                class="relative w-full rounded-full h-4 md:h-5 overflow-hidden border shadow-[inset_0_1px_4px_rgba(148,163,184,0.3)]"
                                :style="getCardProgressTrackStyle((sIndex * 4) + iIndex + 1)"
                            >
                                <div 
                                    class="h-full rounded-full transition-all duration-700 ease-out relative"
                                    :style="getCardProgressBarStyle((sIndex * 4) + iIndex + 1, item.progress)"
                                ></div>
                                <div
                                   class="absolute inset-0 flex items-center justify-center text-[12px] font-bold tracking-wide"
                                   :class="item.progress > 45 ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]' : 'text-slate-400'"
                                   :style="getCardProgressTextStyle((sIndex * 4) + iIndex + 1, item.progress)"
                                >
                                   <span>{{ toKhmerNumeral(item.progress) }}%</span>
                                </div>
                            </div>

                            <!-- <div class="pt-2 text-center text-[10px] sm:text-[11px] md:text-base font-medium text-gray-600">
                                <span class="font-kantumruy">ចម្ងាយ៖</span>
                                <span> {{ toKhmerNumeral(item.progress) }}/100</span>
                            </div> -->
                        </div>
                    </div>
                </div>

             </div>
        </div>

      </div>
    </div>

    <div class="lg:col-span-4 space-y-10">
      <div class="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.20)] backdrop-blur-lg group dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_30px_95px_rgba(0,0,0,0.52)]">
        <div class="h-28 bg-gradient-to-r from-[#2d0b0d] via-[#23070b] to-black relative backdrop-blur-sm">
            <img src="https://images.unsplash.com/photo-1515462277126-2dd0c162007a?q=80&w=600&auto=format&fit=crop" class="w-full h-full object-cover opacity-35 mix-blend-overlay" alt="Banner">
            <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%,rgba(96,165,250,0.12))]"></div>
        </div>

        <div class="flex flex-col items-center -mt-12 px-5 md:px-6 py-6 md:py-7">
          
          <div class="relative z-10 flex flex-col items-center pb-3">
             <div class="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-[4%] rounded-full border border-white/40 bg-slate-900/75 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white shadow-lg">
                LV {{ treeProgress.current_level }}
             </div>
             <div class="rounded-full p-[4px]" :style="avatarRingStyle">
                 <div class="rounded-full bg-white/90 p-[4px] shadow-[0_0_34px_rgba(59,130,246,0.24)] backdrop-blur-sm dark:bg-slate-950/70 dark:shadow-[0_0_38px_rgba(59,130,246,0.20)]">
                    <div class="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-white shadow-[0_18px_42px_rgba(15,23,42,0.22),0_0_28px_rgba(96,165,250,0.22)] overflow-hidden bg-white relative group/avatar dark:border-white/80 dark:shadow-[0_18px_46px_rgba(0,0,0,0.46),0_0_30px_rgba(56,189,248,0.16)]">
                    <img
                       :src="getOptimizedAvatar(user?.avatar, user?.name)"
                       @error="handleImageError"
                       alt="Profile"
                       class="w-full h-full object-cover bg-white"
                       referrerpolicy="no-referrer"
                    >
                   </div>
                </div>
             </div>
          </div>

          <h2 class="font-kantumruy mt-3 mb-1 text-center text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ user?.name || 'Guest' }}
          </h2>

          

          <div
            class="relative mt-2 w-full text-center group/bio cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 rounded-3xl py-1.5 transition-colors"
            @click="openBioModal"
            title="ចុចដើម្បីកែប្រែប្រវត្តិរូប"
          >
              <p class="flex items-center justify-center gap-1.5 text-sm tracking-wide px-4 font-light italic transition-colors text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-300">
                  <svg
                    v-if="!user?.bio"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 flex-none text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  <span :class="{ 'text-slate-400': !user?.bio }">
                    {{ user?.bio || 'ប្រវត្តិរូប ឬទស្សនវិស័យផ្ទាល់ខ្លួន...' }}
                  </span>
              </p>
              
              <button 
                v-if="user"
                class="absolute -right-2 top-0 text-gray-400 hover:text-blue-600 opacity-0 group-hover/bio:opacity-100 transition-opacity p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
          </div>

          <div class="mt-5 grid w-full max-w-[290px] grid-cols-[1fr_auto_1fr] items-center rounded-[1.5rem] border border-slate-200/70 bg-white/70 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_44px_rgba(0,0,0,0.28)]" v-if="user">
            <div class="text-center leading-tight">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Score</span>
              <span class="mt-1 block text-2xl font-black text-blue-600 dark:text-sky-300">{{ user?.total_score || treeProgress.total_score || 0 }}</span>
            </div>
            <div class="h-10 w-px bg-slate-200/80 dark:bg-white/10" aria-hidden="true"></div>
            <div class="text-center leading-tight">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Rank</span>
              <span class="mt-1 block text-2xl font-black text-amber-500 drop-shadow-[0_0_14px_rgba(245,158,11,0.18)] dark:text-amber-300 dark:drop-shadow-[0_0_16px_rgba(251,191,36,0.28)]">
                {{ currentUserRank ? `#${currentUserRank}` : '--' }}
              </span>
            </div>
          </div>

          <div class="mt-2 w-full flex flex-col items-center">
             <div class="flex gap-3 mb-2" v-if="socialLinks.length > 0">
                <a v-for="(link, index) in socialLinks" :key="index" :href="link.url" target="_blank" class="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 text-white shadow-sm relative group"
                   :class="{
                     'bg-blue-600': link.type === 'facebook',
                     'bg-blue-400': link.type === 'telegram',
                     'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500': link.type === 'instagram',
                     'bg-black': link.type === 'tiktok'
                   }">
                    <svg v-if="link.type === 'facebook'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <svg v-if="link.type === 'telegram'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    <svg v-if="link.type === 'instagram'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
                    <svg v-if="link.type === 'tiktok'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0-1 13.6 6.84 6.84 0 0 0 6.82-6.85V9.65a7.35 7.35 0 0 0 3.41 1.28V6.69z"/></svg>

                    <button @click.prevent="removeSocialLink(index)" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </button>
                </a>
             </div>

             <button v-if="!isAddingSocial && user" @click="isAddingSocial = true" class="flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1.5 text-[11px] font-bold text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/15">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                 </svg>
                 បន្ថែមគណនី
             </button>

             <div v-if="isAddingSocial" class="w-full max-w-[270px] animate-fade-in-up rounded-3xl border border-white/60 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_18px_48px_rgba(0,0,0,0.38)]">
                 <div class="mb-3 flex items-center justify-between">
                     <div class="flex items-center gap-2">
                         <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/20" aria-hidden="true">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                 <path d="M16 8a6 6 0 0 1 0 8" />
                                 <path d="M19 5a10 10 0 0 1 0 14" />
                                 <path d="M7 8a6 6 0 0 0 0 8" />
                                 <path d="M4 5a10 10 0 0 0 0 14" />
                                 <circle cx="12" cy="12" r="2" />
                             </svg>
                         </span>
                         <span class="text-xs font-bold text-slate-600 dark:text-slate-200">បន្ថែមគណនី</span>
                     </div>
                     <button @click="isAddingSocial = false" class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-white/10">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                     </button>
                 </div>
                 
                 <select v-model="newSocialType" class="mb-2.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/15">
                     <option value="facebook">Facebook</option>
                     <option value="telegram">Telegram</option>
                     <option value="instagram">Instagram</option>
                     <option value="tiktok">TikTok</option>
                 </select>
                 
                 <input v-model="newSocialUrl" type="text" placeholder="Profile link or username..." class="mb-3 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/15">
                 
                 <button @click="addSocialLink" class="flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.26)] transition hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-400 dark:shadow-[0_10px_24px_rgba(14,165,233,0.22)]">Save</button>
             </div>
          </div>

          
          <div class="w-full px-3 md:px-4 mt-3 mb-0 space-y-3">
            <div class="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 flex flex-col items-center relative overflow-hidden group dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_20px_48px_rgba(0,0,0,0.3)]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_55%)]"></div>
                <div class="relative z-10 text-center w-full">
                    <h3 class="font-kantumruy text-base md:text-lg text-slate-800 mb-1.5 leading-tight dark:text-slate-100">{{ playlist[currentTrackIndex].title }}</h3>
                    <p class="text-sm text-slate-400 italic font-serif tracking-[0.12em] dark:text-slate-400">{{ playlist[currentTrackIndex].subtitle }}</p>
                </div>

                <div class="relative z-10 h-5 mt-2 mb-4 flex items-center justify-center text-slate-400 text-[11px] tracking-[0.2em] uppercase">
                    <span v-if="!isPlaying">Paused</span>
                    <span v-else class="text-sky-500">Now Playing</span>
                </div>

                <div class="relative z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <button @click="prevTrack" class="justify-self-end flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/50 text-slate-300 hover:text-slate-500 hover:bg-white/70 transition-all focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/15 dark:hover:text-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <div class="relative flex items-center justify-center">
                        <div class="absolute inset-0 rounded-full bg-sky-100/70 blur-xl"></div>
                    <button @click="toggleMusic" class="relative flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#38bdf8,#22c55e)] text-white shadow-[0_18px_34px_rgba(59,130,246,0.32)] hover:scale-[1.03] transition-all duration-300 z-10 border-4 border-white/80 ring-4 ring-sky-100/60 animate-soft-pulse dark:border-white/20 dark:ring-sky-300/20 dark:shadow-[0_0_36px_rgba(56,189,248,0.45)]">
                            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 pl-1"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                    <button @click="nextTrack" class="justify-self-start flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/50 text-slate-300 hover:text-slate-500 hover:bg-white/70 transition-all focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/15 dark:hover:text-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>

        <div class="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_24px_60px_rgba(15,23,42,0.1)] p-6 flex flex-col dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
            <div class="relative flex items-center justify-center gap-4 mb-6">
                <div class="relative flex h-20 w-20 shrink-0 items-center justify-center">
                    <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,251,235,0.94)_38%,rgba(254,243,199,0.9)_68%,rgba(255,255,255,0)_100%)] shadow-[0_0_25px_rgba(245,158,11,0.4)] dark:shadow-[0_0_46px_rgba(251,191,36,0.78)]"></div>
                    <div class="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#fffbeb_38%,#fef3c7_100%)] animate-honor-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="h-12 w-12 drop-shadow-[0_10px_16px_rgba(146,64,14,0.16)]" aria-hidden="true">
                            <defs>
                                <linearGradient id="honorTrophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fef3c7" />
                                    <stop offset="42%" stop-color="#d97706" />
                                    <stop offset="100%" stop-color="#92400e" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#honorTrophyGradient)" d="M20 10h24v7h8c0 11.1-6.2 18-16 19.5V45h9a3 3 0 0 1 0 6H19a3 3 0 0 1 0-6h9v-8.5C18.2 35 12 28.1 12 17h8v-7Zm-2 13.2c.6 3.8 2.7 6.8 6.1 8.9A17.4 17.4 0 0 1 20 23.2V23h-2v.2Zm28 0c0 3.3-1.4 6.3-4.1 8.9 3.4-2.1 5.5-5.1 6.1-8.9V23h-2v.2Z"/>
                            <rect x="23" y="50" width="18" height="6" rx="2" fill="url(#honorTrophyGradient)"/>
                        </svg>
                    </div>
                </div>
                <div class="text-left">
                    <h3 class="mb-2 bg-[linear-gradient(135deg,#d97706,#92400e)] bg-clip-text font-kantumruy text-xl font-bold tracking-wide text-transparent drop-shadow-[0_2px_6px_rgba(146,64,14,0.2)] dark:bg-[linear-gradient(135deg,#fde68a,#f59e0b,#fef3c7)] dark:drop-shadow-[0_0_16px_rgba(245,158,11,0.55)]">តារាងកិត្តិយស</h3>
                    <p class="inline-flex items-center gap-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow-[0_8px_20px_rgba(217,119,6,0.25)]"><span class="relative flex h-2.5 w-2.5"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70"></span><span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span></span><span>ចំណាត់ថ្នាក់កំពូលប្រចាំខែ</span></p>
                </div>
            </div>

            <div class="mb-6 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(217,119,6,0.16),rgba(217,119,6,0.75),rgba(217,119,6,0.16),transparent)]"></div>

            <div class="bg-white/60 backdrop-blur-md rounded-3xl p-4 w-full flex-1 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.28)]">
                
                <div v-if="isLeaderboardLoading" class="text-center py-10">
                    <span class="animate-spin inline-block w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full"></span>
                </div>
                
                <div v-else-if="leaderboardUsers.length === 0" class="text-center py-10 text-gray-500 text-sm">
                    មិនទាន់មានទិន្នន័យចំណាត់ថ្នាក់ទេ
                </div>

                <div v-else>
                    <div class="flex justify-between items-center text-gray-500 text-[11px] md:text-xs font-bold mb-3 px-10 dark:text-slate-400">
                        <span>ឈ្មោះសមាជិក</span>
                        <span>ពិន្ទុ</span>
                    </div>

                    <ul class="flex flex-col space-y-2 text-sm w-full max-h-[500px] overflow-y-auto custom-scrollbar">
                        <li v-for="u in leaderboardUsers" :key="u.rank" 
                            @click="openLeaderboardUser(u)"
                            class="flex cursor-pointer items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                            :class="{
                                'bg-gradient-to-r from-yellow-100/80 to-white border border-yellow-300 text-gray-800 shadow-sm dark:from-amber-400/30 dark:to-slate-900/85 dark:border-amber-300/60 dark:text-amber-50 dark:shadow-[0_0_28px_rgba(245,158,11,0.28)]': u.rank === 1,
                                'bg-gradient-to-r from-slate-200/80 to-white border border-slate-300 text-gray-800 shadow-sm dark:from-slate-300/20 dark:to-slate-900/85 dark:border-slate-300/40 dark:text-slate-100': u.rank === 2,
                                'bg-gradient-to-r from-orange-100/80 to-white border border-orange-300 text-gray-800 shadow-sm dark:from-orange-400/20 dark:to-slate-900/85 dark:border-orange-300/40 dark:text-orange-50': u.rank === 3,
                                'text-gray-700 hover:bg-gray-100 border border-transparent dark:text-slate-300 dark:hover:bg-white/5 dark:border-white/5': u.rank > 3
                            }">
                            
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="flex items-center justify-center w-8 shrink-0">
                                    <span v-if="u.rank === 1" class="text-[22px] drop-shadow-md">🥇</span>
                                    <span v-else-if="u.rank === 2" class="text-[22px] drop-shadow-md">🥈</span>
                                    <span v-else-if="u.rank === 3" class="text-[22px] drop-shadow-md">🥉</span>
                                    <span v-else class="text-gray-500 font-bold text-[15px] dark:text-slate-400">{{ u.rank }}</span>
                                </div>
                                
                                <span class="truncate font-semibold tracking-wide" :class="{'text-gray-900 dark:text-white': u.rank <= 3}">
                                    {{ u.name }}
                                </span>
                            </div>
                            
                            <span class="flex-shrink-0 font-bold tracking-wider" 
                                :class="{
                                    'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.55)]': u.rank === 1,
                                    'text-slate-400': u.rank === 2,
                                    'text-orange-900': u.rank === 3,
                                    'text-gray-500': u.rank > 3
                                }">
                                {{ u.score }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div> 
        

        <div class="w-full aspect-[2.5/4] rounded-[1.5rem] overflow-hidden bg-black relative border-[3px] border-[#7dd3fc] shadow-[0_0_20px_rgba(125,211,252,0.5)]">
    
            <div class="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#1e3a8a] text-white px-5 py-2 rounded-full font-bold text-[11px] shadow-lg z-20 tracking-widest border border-white/20 whitespace-nowrap">
                កម្រិតទី {{ treeProgress.current_level }} ៖ {{ treeProgress.level_name }}
            </div>
            
            <video
                :key="treeProgress.video_url"
                :src="treeProgress.video_url"
                autoplay
                loop
                muted
                playsinline
                class="absolute inset-0 w-full h-full object-cover z-10"
            >
                <!-- <source :src="treeProgress.video_url" type="video/mp4" /> -->
            </video>
            
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 z-20 bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                <div class="flex justify-between text-[11px] font-bold text-white mb-1.5 drop-shadow-md">
                    <span>ឆ្ពោះទៅកម្រិតបន្ទាប់</span>
                    <span>{{ treeProgress.progress_percentage }}%</span>
                </div>
                <div class="w-full h-1.5 bg-gray-600/50 rounded-full overflow-hidden">
                    <div class="h-full bg-green-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(74,222,128,0.8)]" :style="{ width: `${treeProgress.progress_percentage}%` }"></div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="selectedLeaderboardUser" class="fixed inset-0 z-[115] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div @click="closeLeaderboardUser" class="absolute inset-0"></div>

            <div class="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.58)]">
                <button @click="closeLeaderboardUser" class="absolute top-4 right-4 z-20 rounded-full bg-slate-950/50 p-2 text-slate-200 backdrop-blur-md transition-colors hover:bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>

                <div class="relative h-32 bg-gradient-to-r from-[#1e2f67] to-[#101a38]">
                    <div class="absolute -bottom-4 right-6 z-10 rounded-full border-2 border-slate-900 bg-amber-500 px-4 py-1 text-sm font-bold text-slate-950 shadow-lg">
                        Rank #{{ selectedLeaderboardUser.rank }}
                    </div>
                </div>

                <div class="relative flex flex-col items-center px-6 pb-6 pt-0 text-center">
                    <div class="-mt-12 mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-950 shadow-[0_18px_38px_rgba(0,0,0,0.45)]">
                        <img :src="getOptimizedAvatar(selectedLeaderboardUser.avatar, selectedLeaderboardUser.name)" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    </div>

                    <h2 class="mb-2 font-kantumruy text-xl font-bold text-slate-100">{{ selectedLeaderboardUser.name }}</h2>
                    <p class="mb-4 line-clamp-3 px-2 text-[13px] italic text-slate-400 md:text-sm">"{{ selectedLeaderboardUser.bio || '...' }}"</p>

                    <div class="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3">
                        <span class="text-[13px] font-bold text-slate-300 md:text-sm">ពិន្ទុប្រចាំខែ</span>
                        <span class="font-kantumruy text-lg font-bold text-sky-300 md:text-xl">{{ selectedLeaderboardUser.score }}</span>
                    </div>

                    <div class="flex gap-3 justify-center" v-if="selectedLeaderboardUser.socials && selectedLeaderboardUser.socials.length > 0">
                        <a v-for="(link, idx) in selectedLeaderboardUser.socials" :key="idx" :href="link.url" target="_blank"
                           class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                           :class="{
                             'bg-blue-600': link.type === 'facebook',
                             'bg-blue-400': link.type === 'telegram',
                             'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500': link.type === 'instagram',
                             'bg-black': link.type === 'tiktok'
                           }">
                            <svg v-if="link.type === 'facebook'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <svg v-if="link.type === 'telegram'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                            <svg v-if="link.type === 'instagram'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
                            <svg v-if="link.type === 'tiktok'" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0-1 13.6 6.84 6.84 0 0 0 6.82-6.85V9.65a7.35 7.35 0 0 0 3.41 1.28V6.69z"/></svg>
                        </a>
                    </div>
                    <div v-else class="mt-2 text-[13px] italic text-slate-500">
                        មិនមានគណនីបណ្ដាញសង្គម
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="isEditingBio" class="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md">
            <div @click.self="isEditingBio = false" class="absolute inset-0"></div>
            <div class="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_24px_90px_rgba(0,0,0,0.5)] md:p-6">
                <div class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-500"></div>
                <div class="mb-5 flex items-center justify-center gap-2">
                    <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-sky-300 dark:ring-sky-300/20" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                    </span>
                    <h3 class="font-moul text-base text-blue-900 text-center dark:text-sky-100 md:text-lg">កែប្រែប្រវត្តិរូបសង្ខេប</h3>
                </div>
                
                <textarea 
                    v-model="newBio" 
                    rows="4" 
                    autofocus
                    class="min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 p-4 font-kantumruy text-sm leading-7 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-sky-400/15"
                    placeholder="Share your story or motto..."
                    maxlength="250"
                ></textarea>
                <div class="mt-2 flex justify-end">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 dark:bg-white/10 dark:text-slate-400">{{ newBio.length }}/250</span>
                </div>

                <div class="grid grid-cols-2 gap-3 mt-6">
                    <button @click="isEditingBio = false" class="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">Cancel</button>
                    <button 
                        @click="saveBio" 
                        :disabled="isSavingBio"
                        class="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:hover:bg-sky-400 dark:shadow-[0_12px_28px_rgba(14,165,233,0.22)]"
                    >
                        <span v-if="isSavingBio" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        {{ isSavingBio ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
    </Teleport>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-soft-pulse {
  animation: softPulse 3.2s ease-in-out infinite;
}

.animate-honor-bounce {
  animation: honorBounce 4.2s ease-in-out infinite;
}

@keyframes softPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 18px 34px rgba(96, 165, 250, 0.28);
  }
  50% {
    transform: scale(1.035);
    box-shadow: 0 22px 42px rgba(96, 165, 250, 0.4);
  }
}

@keyframes honorBounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

</style>
