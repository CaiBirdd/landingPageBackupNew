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
  margin: 60px auto;
  padding: 0 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
/* 移动端适配 (小于 768px) */
@media (max-width: 768px) {
  .feedback-container {
    margin-top: 30px;
    /* 手机上顶部不需要留太多白 */
  }
}
</style>