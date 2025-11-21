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
  margin-bottom: 80px;

  //logo部分先注释掉了
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
      position: relative; //图标和字体对不齐 相对于原位置向上移动文字
      top: -5px;
    }
  }

  .main-title {
    color: #000;
    font-family: Martel;
    font-size: 64px;
    font-weight: 800;
    line-height: 169%;
    /* 108.16px */
    letter-spacing: 3.2px;
    margin-bottom: 37px;

    .line-1 {
      margin-bottom: 10px;
    }

    .line-2 {
      display: flex;
      justify-content: center;

      .highlight {
        display: inline-block;
        background-color: #B4EA7E;
        border-radius: 50px;
        padding: 0px 30px;
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
    line-height: 131%;
    /* 26.2px */
    letter-spacing: 1px;
  }
}

/* 移动端适配 (小于 768px) */
@media (max-width: 768px) {
  /* Header 区域紧凑化 */
  .header-section {
    margin-bottom: 40px;
    /* 间距减半 */

    /* Logo 缩小 */
    .logo {
      margin-bottom: 20px;

      .logo-icon-img {
        width: 32px;
        /* 图标变小 */
        height: 32px;
        padding: 6px;
        margin-right: 10px;
      }

      .logo-text {
        font-size: 24px;
        /* 文字变小 */
      }
    }

    /* 核心标题适配 */
    .main-title {
      font-size: 24px;
      /* 大幅缩小字号 */
      letter-spacing: 1px;
      /* 间距也缩小 */

      .line-2 .highlight {
        padding: 0 12px;
        /* 胶囊变瘦 */
        margin: 0 5px;
        /* 左右间距变小 */
        border-radius: 30px;
        transform: rotate(1deg);
        /* 旋转幅度减小，防止遮挡 */

        /* 关键：防止胶囊内部文字换行难看，或者允许它换行 */
        white-space: nowrap;
      }
    }

    /* 副标题适配 */
    p {
      font-size: 12px;
      line-height: 1.6;
      padding: 0 10px;
      /* 防止贴边 */
    }
  }
}
</style>