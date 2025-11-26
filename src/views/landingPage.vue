<script setup>
import Header from '../components/Header.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
</script>
<template>
  <div class="feedback-container">
    <Header />
    <FeedbackForm />
  </div>
</template>
<style lang="scss" scoped>
.feedback-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 60px 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

@media (max-width: 768px) {
  .feedback-container {
    padding: 30px 0;
  }
}
</style>