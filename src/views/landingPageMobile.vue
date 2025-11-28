<script setup>
import { ref, onMounted,onBeforeUnmount } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import 'vant/es/toast/style'
import { createFeedbackAPI } from '../apis/createFeedback'
import { recordUtmParamsAPI } from '../apis/recordUtmParams'
import { usePostHog } from '../composables/usePosthog'
import { useFbPixel } from '../composables/useFbPixel'


const { posthog } = usePostHog()
const { trackLead } = useFbPixel()

// --- REM 适配代码 ---
const DESIGN_WIDTH = 440; // 设计稿基准宽度 (px)
const ROOT_VALUE_AT_DESIGN_WIDTH = 44; // 对应 PostCSS 配置中的 rootValue

const setRem = () => {
  // 获取当前视口宽度，并限制最大宽度不超过设计稿宽度
  const viewportWidth = Math.min(document.documentElement.clientWidth || document.body.clientWidth, DESIGN_WIDTH);
  
  // 新的计算公式：
  // 根字体 = (当前视口宽度 / 设计稿宽度) * (设计稿下我们设置的 rootValue)
  const rootFontSize = (viewportWidth / DESIGN_WIDTH) * ROOT_VALUE_AT_DESIGN_WIDTH;

  // 将计算结果设置给 HTML 根元素
  document.documentElement.style.fontSize = `${rootFontSize}px`;
  
  // 可以在控制台打印查看结果，例如在 440px 屏幕上，它应该是 44px
  // console.log(`Viewport: ${viewportWidth}, Root Font Size: ${rootFontSize}px`);
}


//表单数据
const formData = ref({
  email: '',
  content: '',
  session_id: ''
})
//获取设备类型
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLocaleLowerCase()
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  return isMobile ? 'mobile' : 'pc'
}
//从url获取utm参数
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search)
  const utmParams = {
    device: getDeviceType()
  }

  const campaign_name = params.get('campaign_name')
  const adset_name = params.get('adset_name')
  const ad_name = params.get('ad_name')
  const ad_content = params.get('ad_content')
  const landingpage_content = params.get('landingpage_content')
  const landingpage_topic = params.get('landingpage_topic')

  if (campaign_name) utmParams.campaign_name = campaign_name
  if (adset_name) utmParams.adset_name = adset_name
  if (ad_name) utmParams.ad_name = ad_name
  if (ad_content) utmParams.ad_content = ad_content
  if (landingpage_content) utmParams.landingpage_content = landingpage_content
  if (landingpage_topic) utmParams.landingpage_topic = landingpage_topic
  //函数最后返回处理好的utm对象
  return utmParams
}
//将处理好的utm参数发送给后端
const recordUtmParams = async () => {
  try {
    const utmParams = getUrlParams()
    const hasUtmParams = Object.keys(utmParams).length > 1
    if (!hasUtmParams) {
      //console.log('未检测到UTM参数, 跳过记录')
      return
    }
    const res = await recordUtmParamsAPI(utmParams)
    //console.log(res, '发送post请求获取session_id')
    if (res.data?.session_id) {
      localStorage.setItem('session_id', res.data.session_id)
      formData.value.session_id = res.data.session_id
      //console.log('UTM参数已记录,session_id:', res.data.session_id)
    }
  } catch (error) {
    //console.error('记录UTM参数失败:', error)
  }
}
onMounted(() => {
   // 设置根字体大小
  setRem()
  window.addEventListener('resize', setRem) // 监听窗口变化，重新计算
  //从loacalStorage中恢复session_id针对用户从不带参数的官网直接访问的情况
  //这种情况目前看来不会发生了，都是测的带utm参数的，而且从代码层面看，下面的正常会覆盖这
  //其他代码部分的逻辑也都是从formData中获取的session_id，和这里关系不大了
  const savedSessionId = localStorage.getItem('session_id')
  if (savedSessionId) {
    formData.value.session_id = savedSessionId
  }
  //调用函数
  recordUtmParams()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setRem) // 组件卸载时移除监听器，避免内存泄漏
})


const sendData = async (data, submitType) => {
  try {
    //console.log('实际发送的数据:', data)
    const res = await createFeedbackAPI(data)
    //console.log(res, '发送post请求提交邮箱或反馈')

    if (res.status === 201) {
      if (submitType === 'email') {
        //showSuccessToast('Email submission successful! Thank you.')
        showSuccessToast({
          message: 'Email submission successful! Thank you.',
          wordBreak: 'break-word',
        })
      } else {
        //showSuccessToast('Thank you for your feedback!')
        showSuccessToast({
          message: 'Thank you for your feedback!',
          wordBreak: 'break-word',
        })
      }
      //posthog相关
      posthog.capture('feedback_submitted', {
        //强制转换为布尔值 第一个叹号是将值转换为布尔值，然后取反。第二个叹号是将第一次取反，从而的到该值的原始布尔值表示
        email: data.email || '',
        feedback_content: data.content || '',
        session_id: data.session_id,
        submit_type: submitType,
        has_feedback: !!data.content,
        has_email: !!data.email,
        feedback_length: data.content ? data.content.length : 0
      })
      if (data.email) {
        posthog.identify(data.email, {
          email: data.email,
          last_feedback_time: new Date().toISOString()
        })
      }
      trackLead({
        content_name: submitType === 'email' ? 'Email Submission' : 'Feedback Submission',
        content_category: 'Lead',
        value: 1.00,
        currency: 'USD'
      })
    } else {
      showToast('Submission failed, please check your network.')
      posthog.capture('feedback_submit_failed', {
        email: data.email || '',
        session_id: data.session_id,
        submit_type: submitType,
        error_status: res.status
      })
    }

  } catch (error) {
    showToast('Submission failed, please check your network.')
    posthog.capture('feedback_submit_error', {
      email: data.email || '',
      session_id: data.session_id,
      submit_type: submitType,
      error_message: error.message
    })
  }
}
//提交邮箱
const handleEmailSubmit = () => {
  //邮箱非空校验
  if (!formData.value.email) {
    //showFailToast('Please enter your email address.')
    showFailToast({
          message: 'Please enter your email address.',
          wordBreak: 'break-word',
          className: 'custom-feedback-toast'
        })
    return
  }
  //邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    //showFailToast('Please enter a valid email address.')
    showFailToast({
          message: 'Please enter a valid email address.',
          wordBreak: 'break-word',
        })
    return
  }
  const emailData = {
    email: formData.value.email,
    session_id: formData.value.session_id
  }
  sendData(emailData, 'email')
}
//提交反馈内容
const handleContentSubmit = () => {
  if (!formData.value.content) {
    //showFailToast('Please fill in the feedback content.')
    showFailToast({
          message: 'Please fill in the feedback content.',
          wordBreak: 'break-word',
        })
    return
  }
  const contentData = {
    content: formData.value.content,
    session_id: formData.value.session_id
  }
  sendData(contentData, 'content')
}

</script>

<template>
  <div class="mobile-landing">
    <!-- 标题区域 -->
    <header class="header-section">
      <div class="title-wrapper">
        <div class="title-line-1">Meeting Strategist:</div>
        <div class="title-line-2">Your<span class="highlight">AI Pre-Meeting</span>Officer</div>
        <p class="subtitle">Get insights 5 minutes before the meeting about what to expect, how to respond, and how to
          win.</p>
      </div>
    </header>

    <!-- 邮箱订阅区域 -->
    <section class="email-section">
      <div class="email-container">
        <h2 class="email-title">Enter your email for early beta access!</h2>
        <form @submit.prevent="handleEmailSubmit" class="email-form" novalidate>
          <div class="input-wrapper">
            <input type="email" name="email" autocomplete="email" v-model.trim="formData.email" placeholder="Email"
              required class="email-input">
            <button type="submit" class="submit-btn">Get Notified</button>
          </div>
        </form>
      </div>
    </section>

    <!-- 痛点区域 -->
    <section class="struggles-section">
      <div class="section-header">
        <div class="decorative-line"></div>
        <h2 class="section-title">Do you face any of these struggles before or during your meetings?</h2>
        <div class="decorative-line"></div>
      </div>

      <div class="struggles-grid">
        <div class="struggle-item">
          <span class="dot"></span>
          <span class="text">Not sure what to focus on before the meeting</span>
        </div>
        <div class="struggle-item">
          <span class="dot"></span>
          <span class="text">Wasting time on unimportant details</span>
        </div>
        <div class="struggle-item">
          <span class="dot"></span>
          <span class="text">Unsure how to respond to tough questions</span>
        </div>
        <div class="struggle-item">
          <span class="dot"></span>
          <span class="text">Forgetting key details from past meetings</span>
        </div>
      </div>
    </section>

    <!-- 功能区域 -->
    <section class="features-section">


      <!-- 卡片底部的渐变装饰背景 -->
      <div class="gradient-blob left-blob"></div>
      <div class="gradient-blob left-blob-2"></div>
      <div class="gradient-blob right-blob"></div>
      <div class="gradient-blob right-blob-2"></div>

      <div class="section-header">
        <div class="decorative-line"></div>
        <h2 class="section-title">Our product empowers you to:</h2>
        <div class="decorative-line"></div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--1.png" alt="feature" class="feature-img">
          <p class="feature-text">Personalized strategies based on participants and past data.</p>
        </div>

        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--2.png" alt="feature" class="feature-img">
          <p class="feature-text">Track participant behavior and key signals during meetings.</p>
        </div>

        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--3.png" alt="feature" class="feature-img">
          <p class="feature-text">Predict tough questions and get tailored responses.</p>
        </div>

        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--4.png" alt="feature" class="feature-img">
          <p class="feature-text">Get detailed post-meeting summaries.</p>
        </div>

        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--5.png" alt="feature" class="feature-img">
          <p class="feature-text">Improve with each meeting.</p>
        </div>

        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--6.png" alt="feature" class="feature-img">
          <p class="feature-text">Prepare in just 5 minutes.</p>
        </div>
      </div>
    </section>

    <!-- 建议区域 -->
    <section class="feedback-section">
      <div class="feedback-header">
        <span class="optional-badge">Optional</span>
        <span class="feedback-prompt">Anything you'd like this product to do? Let us know!</span>
      </div>
      <div class="feedback-input-wrapper">
        <input v-model.trim="formData.content" @keydown.enter="handleContentSubmit"
          placeholder=" Tell Us What You Think...." class="feedback-input">
        <button type="button" @click="handleContentSubmit" class="feedback-submit-btn">
          <img src="../assets/arrow_forward.svg" alt="Submit" class="arrow-icon">
        </button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.mobile-landing {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 1px 10px calc(100vh - 650px); // 页面正常显示的重点 动态计算，适应不同设备
  //padding: 1px 10px 40px;
  background: #FFF;
  font-family: Martel, serif;
  overflow-x: hidden;
}
//移动端的样式都是内容撑起高度的，和PC端不同，PC端是都写出来了
.header-section {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 20px;

  .title-wrapper {
    .title-line-1 {
      font-family: Martel;
      font-size: 20px;
      font-weight: 800;
      line-height: 1.5;
      letter-spacing: 3.2px;
      color: #000;
    }

    .title-line-2 {
      font-family: Martel;
      font-size: 20px;
      font-weight: 800;
      line-height: 1.5;
      letter-spacing: 3px;
      color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

      .highlight {
        display: inline-block;
        background: #B4EA7E;
        border-radius: 50px;
        padding: 4px 12px;
        margin: 0 6px;
        font-size: 20px;
        font-weight: 800;
        line-height: 1.5;
        letter-spacing: 2px;
        transform: rotate(1.6deg);
      }
    }

    .subtitle {
      font-family: Martel;
      font-size: 9.5px;
      font-weight: 300;
      line-height: 1.375;
      letter-spacing: 1px;
      color: #000;
      margin-top: 20px;
      padding: 0 20px;
    }
  }
}

.email-section {
  margin-bottom: 20px;

  .email-container {
    background: rgba(255, 255, 255, 0.3);
    border: 1.5px solid #D4D4D4;
    border-radius: 15px;
    padding: 18px 0;
    box-shadow: 2px 3px 8px 0px rgba(0, 0, 0, 0.15);

    .email-title {
      font-family: Martel;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
      letter-spacing: 0.7px;
      text-align: center;
      color: #000;
      margin-bottom: 11px;
      padding: 0 37px;
    }

    .email-form {
      padding: 0 20px;

      .input-wrapper {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.6);
        border-radius: 64.5px;
        padding: 4.55px 8px;
        height: 37.52px;

        .email-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0 10px;
          font-family: Martel;
          font-size: 10px;
          font-weight: 290;
          line-height: 1.11;
          letter-spacing: 0.5px;
          color: rgba(0, 0, 0, 0.8);

          &::placeholder {
            color: rgba(0, 0, 0, 0.8);
          }

          &:focus {
            outline: none;
          }
        }

        .submit-btn {
          background: #B4EA7E;
          border-radius: 53px;
          //padding: 8px 15px;
          font-family: Martel;
          font-size: 10px;
          font-weight: 400;
          line-height: 1.11;
          letter-spacing: 0.5px;
          color: #000;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          width: 92px;
          height: 28px;
          // display: flex;
          // align-items: center;
          // justify-content: center;

          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }
}

.struggles-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 19.54px 24px 24px;
  margin-bottom: 22px;
  box-shadow: 2px 3px 4px 0px rgba(0, 0, 0, 0.15);
  z-index: 1;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-bottom: 16.46px;

    .decorative-line {
      width: 21.3px;
      height: 3px;
      background: #B4EA7E;
      flex-shrink: 0;
    }

    .section-title {
      font-family: Martel;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.5;
      letter-spacing: 1px;
      text-align: center;
      color: #000;
      margin: 0;
    }
  }

  .struggles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 19px 28px;

    .struggle-item {
      display: flex;
      align-items: flex-start;
      gap: 5px;

      .dot {
        width: 4.48px;
        height: 4.48px;
        background: #B4EA7E;
        border-radius: 50%;
        margin-top: 3px;
        flex-shrink: 0;
      }

      .text {
        font-family: Martel;
        font-size:10.2px;
        font-weight: 400;
        line-height: 1.44;
        color: #000;
      }
    }
  }
}

.features-section {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 0 10px 24px;
  margin-bottom: 32px;
  box-shadow: 2px 3px 4px 0px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;

  .gradient-blob {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    filter: blur(50px);
    z-index: -1;
    pointer-events: none;
    opacity: 0.7;

    &.left-blob {
      top: -139px;
      left: 4px;
      background: radial-gradient(circle, #ffe7ce 0%, rgba(255, 226, 195, 0) 80%);
    }

    &.left-blob-2 {
      top: -50px;
      left: -130px;
      background: radial-gradient(circle, #a1ff67 0%, rgba(225, 249, 209, 0) 80%);
    }

    &.right-blob {
      top: -180px;
      right: -100px;
      background: radial-gradient(circle, #c0e1ff 0%, rgba(192, 225, 255, 0) 80%);
    }

    &.right-blob-2 {
      top: -50px;
      right: -100px;
      background: radial-gradient(circle, #e5c0ff 0%, rgba(192, 225, 255, 0) 80%);
    }
  }


  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .decorative-line {
      width: 21.3px;
      height: 3px;
      background: #B4EA7E;
      flex-shrink: 0;
    }

    .section-title {
      font-family: Martel;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.5;
      letter-spacing: 1px;
      text-align: center;
      color: #000;
      margin: 20px;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .feature-card {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #D4D4D4;
      border-radius: 12px;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 65px;

      .feature-img {
        width: 39px;
        height: 39px;
        border-radius: 5px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .feature-text {
        font-family: 'Martel';
        font-size: 9.5px;
        font-weight: 400;
        line-height: 1.41;
        color: #000;
        margin: 0;
        flex: 1;
      }
    }
  }
}

.feedback-section {
  margin-bottom: 40px;

  .feedback-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 14px;

    .optional-badge {
      background: #B4EA7E;
      border-radius: 45px;
      padding: 4px 8px;
      font-family: Martel;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.2;
      color: #000;
      box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
      flex-shrink: 0;
    }

    .feedback-prompt {
      font-family: Martel;
      font-size: 10px;
      font-weight: 300;
      line-height: 1.5;
      letter-spacing: 1.5px;
      color: #000;
      flex: 1;
    }
  }

  .feedback-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 43px;
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid rgba(0, 0, 0, 0.4);
    border-radius: 30px;

    .feedback-input {
      border: none;
      flex: 1;
      border-radius: 30px;
      font-family: Martel;
      background: transparent;
      padding: 0 22px;
      font-size: 10px;
      font-weight: 300;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.2;

      &::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      &:focus {
        outline: none;
      }
    }

    .feedback-submit-btn {
      width: 60px;
      height: 30px;
      background: #B4EA7E;
      border-radius: 22px;
      margin-right: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      .arrow-icon {
        width: 30px;
        height: 30px;
      }

      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }
    }
  }
}


</style>