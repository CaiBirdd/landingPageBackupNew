<script setup>
</script>
<template>
  <!-- 头部设计区域 -->
  <header class="header-section">
    <!-- 最顶部logo 
      <div class="logo">
        <img src="../assets/logo.svg" alt="Synapnote Logo" class="logo-icon-img">
        <span class="logo-text">synapnote</span>
      </div>
      -->
    <!-- 大标题 -->
    <div class="main-title">
      <div class="line-1">
        Meeting Strategist:
      </div>
      <div class="line-2">
        Your<span class="highlight">AI Pre-Meeting</span> Officer
      </div>
    </div>
    <!-- 次标题 -->
    <p class="subtitle">
      Get insights 5 minutes before the meeting about what to expect, how to respond, and how to win.
    </p>
  </header>
</template>
<style lang="scss" scoped>
.header-section {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 50px;
  padding: 0 80px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 41px;

    .logo-icon-img {
      width: 43px;
      height: 43px;
      padding: 8px;
      flex-shrink: 0;
      background-color: #000;
      border-radius: 11px;
      margin-right: 17px;
    }

    .logo-text {
      color: #000;
      font-family: "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
      font-size: 36px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      position: relative;
      top: -5px;
    }
  }

  .main-title {
    color: #000;
    font-family: Martel;
    font-size: 58px;
    font-weight: 800;
    line-height: 1.5;
    letter-spacing: 2.9px;
    margin-bottom: 30px;

    .line-1 {
      margin-bottom: 5px;
    }

    .line-2 {
      display: flex;
      justify-content: center;
      align-items: center;

      .highlight {
        display: inline-block;
        background-color: #B4EA7E;
        border-radius: 58.5px;
        padding: 10px 38px;
        margin: 0px 20px;
        transform: rotate(1.8deg);
      }
    }
  }

  p {
    font-family: Martel;
    color: #000;
    font-size: 20px;
    font-weight: 300;
    line-height: 1.5;
    letter-spacing: 1px;
    max-width: 1051px;
    margin: 0 auto;
    white-space: nowrap;
  }
}

@media (max-width: 1200px) {
  .header-section {
    padding: 0 40px;
    
    .main-title {
      font-size: 48px;
    }
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 0 20px;
    margin-bottom: 30px;

    .logo {
      margin-bottom: 20px;

      .logo-icon-img {
        width: 32px;
        height: 32px;
        padding: 6px;
        margin-right: 10px;
      }

      .logo-text {
        font-size: 24px;
      }
    }

    .main-title {
      font-size: 24px;
      letter-spacing: 1px;

      .line-2 .highlight {
        padding: 0 12px;
        margin: 0 5px;
        border-radius: 30px;
        transform: rotate(1deg);
        white-space: nowrap;
      }
    }

    p {
      font-size: 12px;
      line-height: 1.6;
      padding: 0 10px;
    }
  }
}
</style>