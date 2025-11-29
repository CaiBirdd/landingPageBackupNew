<script setup>
import Header from '../components/Header.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
</script>
<template>
  <div class="feedback-container-pc">
    <Header />
    <FeedbackForm />
  </div>
</template>
<style lang="scss" scoped>
.feedback-container-pc {
  max-width: 1440px;
  margin: 0 auto;
  padding: 60px 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

@media (max-width: 768px) {
  .feedback-container-pc {
    padding: 30px 0;
  }
}
</style>