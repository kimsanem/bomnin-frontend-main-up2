<script setup>
import { ref, provide, onBeforeUnmount, onMounted, watch } from 'vue';

const { authToken, userData } = useAuthState()
const hasHydratedAuth = ref(false)

// --- Global Music Player Logic ---
const isPlaying = ref(false);
const currentTrackIndex = ref(0);
let audio = null;

const playlist = [
  { title: 'Relaxing Piano & Violin 🌿' , 
    subtitle: 'Music heals the heart & blood vessels', 
    url: 'https://pub-527694ac75464b31baaf7bf68a76d622.r2.dev/music/music.mp3' 
  },
];

const loadTrack = (index) => {
  if (typeof window !== 'undefined') { 
      if (audio) { 
        audio.pause(); 
        audio.src = playlist[index].url; 
      } else { 
        audio = new Audio(playlist[index].url);
        audio.addEventListener('error', (e) => { 
            console.error("Error loading audio:", e); 
            isPlaying.value = false; 
        });
        audio.addEventListener('ended', () => {
             // Loop logic is handled by audio.loop = true
        });
      }
      audio.loop = true; 
      audio.load();
  }
};

const toggleMusic = () => {
  if (typeof window === 'undefined') return;
  
  if (!audio) loadTrack(currentTrackIndex.value);
  
  if (isPlaying.value) { 
      audio.pause(); 
  } else { 
      audio.play().catch(e => { 
          console.error("Audio play failed:", e); 
          isPlaying.value = false; 
      }); 
  }
  isPlaying.value = !isPlaying.value;
};

const nextTrack = () => {
  if (typeof window === 'undefined') return;
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length;
  loadTrack(currentTrackIndex.value);
  if (isPlaying.value) audio.play().catch(e => console.error(e));
};

const prevTrack = () => {
  if (typeof window === 'undefined') return;
  currentTrackIndex.value = (currentTrackIndex.value - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex.value);
  if (isPlaying.value) audio.play().catch(e => console.error(e));
};

// Provide music controls to all pages
provide('music', {
  isPlaying,
  currentTrackIndex,
  playlist,
  toggleMusic,
  nextTrack,
  prevTrack
});

onBeforeUnmount(() => {
    if (audio) {
        audio.pause();
        audio = null;
    }
});

onMounted(() => {
    hasHydratedAuth.value = true
})

watch([authToken, userData], async ([newToken, newUser], [oldToken, oldUser]) => {
    if (!hasHydratedAuth.value) return
    if (newToken === oldToken && newUser === oldUser) return

    await refreshNuxtData()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* ដំណោះស្រាយដ៏ល្អឥតខ្ចោះ (Perfect Fix) */
html, body {
  /* ប្រើ clip ជំនួស hidden ទើបវាមិនទៅ Break មុខងារ Sticky Navbar */
  overflow-x: clip; 
  max-width: 100%;
  
  /* លុប position: relative ចោល ព្រោះវាជាមេរោគធ្វើឱ្យ Navbar របូតរមៀលចុះក្រោម */
  background-color: #ffffff; /* ការពារកុំឱ្យលោតពណ៌ខ្មៅនៅខាងក្រោយ Background */
}
html.dark,
html.dark body {
  background-color: #0f172a;
  color: #f8fafc;
}

html.dark #__nuxt {
  min-height: 100vh;
  background-color: #0f172a;
}
</style>
