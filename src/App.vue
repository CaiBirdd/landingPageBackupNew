<template>
  <div>
    <LandingPage v-if="!isMobile" />
    <LandingPageMobile v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LandingPage from './views/landingPage.vue'
import LandingPageMobile from './views/landingPageMobile.vue'

const isMobile = ref(false)

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  isMobile.value = /mobile|android|iphone|ipad|phone|blackberry|iemobile|wpdesktop/i.test(userAgent)
}

onMounted(() => {
  detectDevice()
  window.addEventListener('resize', detectDevice)
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
