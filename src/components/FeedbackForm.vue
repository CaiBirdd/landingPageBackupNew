<template>
  <div class="landing-content">
    <!-- 邮箱订阅区域 -->
    <section class="email-section">
      <div class="email-container">
        <h2 class="email-title">Enter your email for early beta access!</h2>
        <form @submit.prevent="handleEmailSubmit" class="email-form" novalidate> 
          <div class="input-wrapper">
            <input type="email" name="email" autocomplete="email" v-model.trim="formData.email" placeholder="Email" 
              class="email-input">
            <button type="submit" class="submit-btn">Get Notified</button>
          </div>
        </form>
      </div>
    </section>

    <!-- 痛点和功能区域 -->
    <section class="features-section">
      <!-- 在features-wrapper这里使用relative定位 后面的都是相对于他的-->
      <div class="features-wrapper">
        <!-- 白色功能卡片 -->
        <div class="features-card">
          <h3 class="features-title">Our product empowers you to:</h3>
          <div class="feature-items">
            <div class="feature-line line-1">· Personalized strategies based on participants and past data.</div>
            <div class="feature-line line-2">· Track participant behavior and key signals during meetings.</div>
            <div class="feature-line line-3">· Predict tough questions and get tailored responses.</div>
            <div class="feature-line line-4">· Get detailed post-meeting summaries.</div>
            <div class="feature-line line-5">· Improve with each meeting.</div>
            <div class="feature-line line-6">· Prepare in just 5 minutes.</div>
          </div>
        </div>
        <!-- 卡片底部的渐变装饰背景 -->
        <div class="gradient-blob left-blob"></div>
        <div class="gradient-blob left-blob-2"></div>
        <div class="gradient-blob right-blob"></div>
        <div class="gradient-blob right-blob-2"></div>

        <!-- 痛点气泡 - 使用绝对定位 -->
        <div class="pain-title-1">Struggling with<br>Meetings?</div>
        <div class="pain-title-2">Do you face any of these<br>struggles during your<br>meetings?</div>

        <div class="pain-point-bubble bubble-1">
          <span class="dot"></span>
          <span class="text">Wasting time on irrelevant details</span>
        </div>

        <div class="pain-point-bubble bubble-2">
          <span class="dot"></span>
          <span class="text">Unsure where to focus</span>
        </div>

        <div class="pain-point-bubble bubble-3">
          <span class="dot"></span>
          <span class="text">Stuck on how to answer tough questions</span>
        </div>

        <div class="pain-point-bubble bubble-4">
          <span class="dot"></span>
          <span class="text">Forgetting key info from past meetings</span>
        </div>

        <!-- 图片 - 使用绝对定位 -->
        <img src="../assets/ImageWithFallback-5.png" alt="feature" class="feature-img img-1">
        <img src="../assets/ImageWithFallback-3.png" alt="feature" class="feature-img img-2">
        <img src="../assets/ImageWithFallback-2.png" alt="feature" class="feature-img img-3">
        <img src="../assets/ImageWithFallback-4.png" alt="feature" class="feature-img img-4">
        <img src="../assets/ImageWithFallback-1.png" alt="feature" class="feature-img img-5">
        <img src="../assets/ImageWithFallback.png" alt="feature" class="feature-img img-6">
      </div>
    </section>

    <!-- 建议区域 -->
    <section class="feedback-section">
      <div class="feedback-header">
        <span class="optional-badge">Optional</span>
        <span class="feedback-prompt">Anything you'd like this product to do? Let us know!</span>
      </div>
      <div class="feedback-input-wrapper">
        <input v-model.trim="formData.content" @keydown.enter="handleContentSubmit" placeholder=" Tell Us What You Think...." class="feedback-input"></input>
        <button type="button" @click="handleContentSubmit" class="feedback-submit-btn">
          <img src="../assets/arrow_forward.svg" alt="Submit" class="arrow-icon">
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from "vue-toastification"
import { createFeedbackAPI } from '../apis/createFeedback'
import { recordUtmParamsAPI } from '../apis/recordUtmParams'
import { usePostHog } from '../composables/usePosthog'
import { useFbPixel } from '../composables/useFbPixel'

// ========== 初始化工具实例 ==========
// PostHog 用户行为分析工具
const { posthog } = usePostHog()
// Facebook Pixel 广告追踪工具
const { trackLead } = useFbPixel()
// Toast 消息提示插件
const toast = useToast()

// ========== 响应式数据 ==========
// 表单数据：包含用户输入的邮箱、反馈内容和会话ID
const formData = ref({
  email: '',        // 用户邮箱
  content: '',      // 反馈内容
  session_id: ''    // 会话ID，用于关联UTM追踪和反馈记录
})

// ========== 工具函数 ==========
/**
 * 获取设备类型
 * 通过 User Agent 判断用户使用的是移动设备还是PC
 * @returns {string} 'mobile' 或 'pc'
 */
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLocaleLowerCase()
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  return isMobile ? 'mobile' : 'pc'
}

/**
 * 从URL获取UTM参数
 * UTM参数用于追踪广告来源和用户行为
 * 例如：?campaign_name=test&adset_name=test&ad_name=test
 * @returns {Object} 包含设备类型和UTM参数的对象
 */
const getUrlParams = () => {
  //window.location是浏览器提供的对象，包含当前页面的URL信息
  //.search专门指URL中？开始，包含问号及其后面的所有内容
  //window.location.search拿到的是？后面的字符串
  //new URLSearchParams()将字符串转换为URLSearchParams对象，方便后续获取参数
  //这个params对象和普通对象不同，它是一个类数组对象，通过.get()方法获取参数值，普通对象用.key获取
  const params = new URLSearchParams(window.location.search)
  // 初始化参数对象，必须包含设备类型
  const utmParams = {
    device: getDeviceType()
  }

  // 从URL中提取各个UTM参数
  const campaign_name = params.get('campaign_name')          // 广告活动名称
  const adset_name = params.get('adset_name')                // 广告组名称
  const ad_name = params.get('ad_name')                      // 广告名称
  const ad_content = params.get('ad_content')                // 广告内容
  const landingpage_content = params.get('landingpage_content') // 落地页内容标识
  const landingpage_topic = params.get('landingpage_topic')  // 落地页主题

  // 只添加有值的参数（避免发送空字段）
  if (campaign_name) utmParams.campaign_name = campaign_name
  if (adset_name) utmParams.adset_name = adset_name
  if (ad_name) utmParams.ad_name = ad_name
  if (ad_content) utmParams.ad_content = ad_content
  if (landingpage_content) utmParams.landingpage_content = landingpage_content
  if (landingpage_topic) utmParams.landingpage_topic = landingpage_topic

  return utmParams
}

/**
 * 记录UTM参数并获取session_id
 * 当用户通过广告链接访问时，记录UTM参数到后端
 * 后端会生成唯一的session_id用于追踪用户的完整行为链路
 */
const recordUtmParams = async () => {
  try {
    const utmParams = getUrlParams()
    // 判断是否有UTM参数（长度>1表示除了device还有其他参数）
    //Object.keys()返回utmParams对象的所有键名key为一个数组，长度>1表示除了默认的device还有其他参数
    const hasUtmParams = Object.keys(utmParams).length > 1

    if (!hasUtmParams) {
      //console.log('未检测到UTM参数，跳过记录')
      return
    }

    // 发送UTM参数到后端，获取session_id
    const res = await recordUtmParamsAPI(utmParams)
    //console.log(res, '发送post请求获取session_id')
    if (res.data?.session_id) {
      // 保存session_id到localStorage和表单数据中
      localStorage.setItem('session_id', res.data.session_id)
      formData.value.session_id = res.data.session_id
      //console.log('UTM参数已记录，session_id:', res.data.session_id)
    }
  } catch (error) {
    //console.error('记录UTM参数失败:', error)
  }
}

// ========== 生命周期钩子 ==========
/**
 * 组件挂载时执行
 * 1. 从localStorage恢复session_id（如果存在）
 * 2. 记录UTM参数（如果URL中有）
 */
onMounted(() => {
  // 尝试恢复之前保存的session_id
  const savedSessionId = localStorage.getItem('session_id')
  if (savedSessionId) {
    formData.value.session_id = savedSessionId
  }
  // 记录UTM参数
  recordUtmParams()
})

// ========== 业务逻辑 ==========
/**
 * 通用的数据发送函数
 * @param {Object} data - 要发送的数据对象
 * @param {string} submitType - 提交类型：'email' 或 'content'
 */
const sendData = async (data, submitType) => {
  try {
    // 构建payload：只发送有值的字段，避免发送空字符串
    // *注意：后端不接受空字符串，但接受不存在的字段
    // const payload = {}
    // if (data.email) payload.email = data.email
    // if (data.content) payload.content = data.content
    // if (data.session_id) payload.session_id = data.session_id
    // 目前的data都是处理好的，不用再验空构建payload了

    //console.log('实际发送的数据:', data)

    // 发送请求到后端
    const res = await createFeedbackAPI(data)
    //console.log(res, '发送post请求提交邮箱或反馈')

    // ========== 处理成功响应 ==========
    if (res.status === 201) {
      // 根据提交类型显示不同的成功消息
      if (submitType === 'email') {
        toast.success("Email submission successful! Thank you.")
      } else {
        toast.success("Thank you for your feedback!")
      }

      // ========== PostHog 用户行为追踪 ==========
      // 记录提交事件
      posthog.capture('feedback_submitted', {
        email: data.email || '',
        feedback_content: data.content || '',
        session_id: data.session_id,
        submit_type: submitType,
        has_feedback: !!data.content,
        has_email: !!data.email,
        feedback_length: data.content ? data.content.length : 0
      })

      // 如果有email，关联用户身份
      if (data.email) {
        posthog.identify(data.email, {
          email: data.email,
          last_feedback_time: new Date().toISOString()
        })
      }

      // ========== Facebook Pixel 广告转化追踪 ==========
      trackLead({
        content_name: submitType === 'email' ? 'Email Submission' : 'Feedback Submission',
        content_category: 'Lead',
        value: 1.00,
        currency: 'USD'
      })

    } else {
      // ========== 处理非201状态码 ==========
      toast.warning("Submission failed, please check your network.")
      posthog.capture('feedback_submit_failed', {
        email: data.email || '',
        session_id: data.session_id,
        submit_type: submitType,
        error_status: res.status
      })
    }
  } catch (error) {
    // ========== 处理网络错误或其他异常 ==========
    toast.warning("Submission failed, please check your network.")
    posthog.capture('feedback_submit_error', {
      email: data.email || '',
      session_id: data.session_id,
      submit_type: submitType,
      error_message: error.message
    })
  }
}

/**
 * 处理邮箱提交
 * 只发送 email + session_id
 * 后端会根据session_id自动合并数据
 */
const handleEmailSubmit = () => {
  // 因为去除了email input的required属性，所以需要自己验证邮箱是否为空和格式是否正确
  // 获取并去除空格 这里的formData.value.email通过v-model.trim="formData.email"已经处理好了，不用再手动去除了
  //const email = formData.value.email ? formData.value.email.trim() : ''

  // 验空
  if (!formData.value.email) {
    toast.warning("Please enter your email address.")
    return
  }

  // 验邮箱的格式
  // 以下是一个通用的邮箱正则
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    toast.warning("Please enter a valid email address.")
    return
  }
  //console.log('=== 邮箱提交 ===')
  //console.log('邮箱:', formData.value.email)
  //console.log('会话ID:', formData.value.session_id)
  //console.log('提交时间:', new Date().toLocaleString())
  //console.log('================')

  // 构建只包含email的数据
  const emailData = {
    email: formData.value.email,
    session_id: formData.value.session_id
  }

  sendData(emailData, 'email')
}

/**
 * 处理反馈内容提交
 * 只发送 content + session_id
 * 后端会根据session_id自动合并数据
 */
const handleContentSubmit = () => {
  // 验证：content不能为空 这里的formData.value.content通过v-model.trim="formData.content"已经处理好了，不用再手动去除了
  if (!formData.value.content) {
    toast.warning("Please fill in the feedback content.")
    return
  }

  //console.log('=== 反馈提交 ===')
  //console.log('反馈内容:', formData.value.content)
  //console.log('会话ID:', formData.value.session_id)
  //console.log('提交时间:', new Date().toLocaleString())
  //console.log('================')

  // 构建只包含content的数据
  const contentData = {
    content: formData.value.content,
    session_id: formData.value.session_id
  }

  sendData(contentData, 'content')
}
</script>

<style lang="scss" scoped>
.landing-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

.email-section {
  margin-bottom: 60px;

  .email-container {
    background: rgba(255, 255, 255, 0.3);
    border: 1.5px solid #D4D4D4;
    border-radius: 40px;
    padding: 28.9px 77px 35px 77px;
    box-shadow: 2px 3px 8px 0px rgba(0, 0, 0, 0.15);
    //max-width: 1276px;
    margin: 0 auto;

    .email-title {
      font-family: Martel;
      font-size: 32px;
      font-weight: 600;
      line-height: 1.35;
      letter-spacing: 1.6px;
      text-align: center;
      color: #000;
      margin-bottom: 19.67px;
    }

    .email-form {
      .input-wrapper {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.5);
        border: 1.5px solid rgba(0, 0, 0, 0.6);
        border-radius: 64.5px;
        padding: 7.26px 8px;
        position: relative;
        max-width: 1118px;
        margin: 0 auto;
        height: 68.52px;

        .email-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0 57px;
          font-family: 'Microsoft JhengHei UI';
          font-size: 24px;
          font-weight: 290;
          line-height: 1.11;
          letter-spacing: 1.2px;
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
          //padding: 14px 43px;
          font-family: Martel;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.11;
          letter-spacing: 1.4px;
          color: #000;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          //height: 54.82px;
          width: 288px;
          height: 54px;
          //display: flex;
          //align-items: center;
          //justify-content: center;

          &:hover {
            opacity: 0.9;
            transform: scale(1.02);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }
  }
}

.features-section {
  margin-bottom: 80px;

  .features-wrapper {
    position: relative;
    //max-width: 1303px;
    height: 518px;
    margin: 0 auto;

    .features-card {
      position: absolute;
      left: 216px;
      top: 0;
      width: 796px;
      height: 458px;
      background: rgba(255, 255, 255, 0.9);
      border: 2.5px solid #D4D4D4;
      border-radius: 34px;
      padding: 48px 68px;
      box-shadow: 3px 4px 4px 0px rgba(0, 0, 0, 0.25);

      .features-title {
        font-family: 'Microsoft YaHei UI';
        font-size: 24px;
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: 0.72px;
        color: #000;
        position: relative;
        //left: 2px;
        //top: 0;
        //height: 33.46px;
        //margin-bottom: 0;
      }

      .feature-items {
        position: relative;
        //height: 280px;
        margin-top: -32px;

        .feature-line {
          font-family: 'Microsoft YaHei UI';
          font-size: 17px;
          font-weight: 400;
          line-height: 1.11;
          color: #000;
          position: absolute;
          //height: 18.82px;

          &.line-1 {
            top: 65.87px;
            left: 0;
          }

          &.line-2 {
            top: 116.14px;
            left: 80px;
          }

          &.line-3 {
            top: 170.41px;
            left: 218px;
          }

          &.line-4 {
            top: 220.69px;
            left: 260px;
          }

          &.line-5 {
            top: 270.96px;
            left: 244px;
          }

          &.line-6 {
            top: 323.24px;
            left: 218px;
          }
        }
      }
    }

    .gradient-blob {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      filter: blur(100px);
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


    .pain-title-1 {
      position: absolute;
      left: 0;
      top: 75.88px;
      width: 190px;
      font-family: 'Microsoft YaHei UI';
      font-size: 20px;
      font-weight: 400;
      line-height: 1.46;
      letter-spacing: 2.4px;
      color: #000;
    }

    .pain-title-2 {
      position: absolute;
      left: 1060px;
      top: 120px;
      width: 320px;
      font-family: 'Microsoft YaHei UI';
      font-size: 20px;
      font-weight: 400;
      line-height: 1.46;
      letter-spacing: 2px;
      color: #000;
    }

    .pain-point-bubble {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      //padding: 12px 25px;
      border-radius: 27.5px;
      box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.25);

      .dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin-right: 15px;
        flex-shrink: 0;
      }

      .text {
        font-family: 'Microsoft YaHei UI';
        font-size: 16px;
        font-weight: 400;
        line-height: 1.35;
        color: #000;
      }

      &.bubble-1 {
        left: 837px;
        top: 43px;
        width: 340px;
        height: 41px;
        background: rgba(202, 252, 225, 0.8);

        .dot {
          background: #FFF;
        }
      }

      &.bubble-2 {
        left: 33px;
        top: 180px;
        width: 253px;
        height: 46px;
        background: rgba(251, 252, 202, 0.8);

        .dot {
          background: #D9D9D9;
        }
      }

      &.bubble-3 {
        left: 430px;
        top: 445px;
        width: 402px;
        height: 47px;
        background: rgba(252, 228, 202, 0.8);

        .dot {
          background: #FFF;
        }
      }

      &.bubble-4 {
        left: 919px;
        top: 240px;
        width: 384px;
        height: 48px;
        background: rgba(202, 229, 252, 0.8);

        .dot {
          background: #FFF;
        }
      }
    }

    .feature-img {
      position: absolute;

      &.img-1 {
        left: 83px;
        top: 265.61px;
        width: 153.95px;
        height: 161.09px;
      }

      &.img-2 {
        left: 151px;
        top: 379.4px;
        width: 204px;
        height: 138.6px;
      }

      &.img-3 {
        left: 882px;
        top: 100.34px;
        width: 103.52px;
        height: 107.85px;
      }

      &.img-4 {
        left: 961px;
        top: 375.32px;
        width: 204px;
        height: 134.52px;
      }

      &.img-5 {
        left: 823px;
        top: 313.47px;
        width: 172.07px;
        height: 120.58px;
      }

      &.img-6 {
        left: 322px;
        top: 215.27px;
        width: 159px;
        height: 134.52px;
      }
    }
  }
}

.feedback-section {
  margin-bottom: 60px;

  .feedback-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .optional-badge {
      background: #B4EA7E;
      border-radius: 45px;
      padding: 3px 20px;
      font-family: Martel;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.69;
      color: #000;
      margin-right: 20px;
      box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);
    }

    .feedback-prompt {
      position: relative;
      top: 1px;
      font-family: Martel;
      font-size: 20px;
      font-weight: 300;
      line-height: 1.8;
      letter-spacing: 2px;
      color: #000;
    }
  }

  .feedback-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 1280px;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid rgba(0, 0, 0, 0.4);
    border-radius: 30px;

    .feedback-input {
      /* 去除边框 */
      border: none;
      flex: 1;
      border-radius: 30px;
      font-family: Martel;
      /* 重要！去除input的背景 不然直接设置padding会遮挡外面的边框*/
      background: transparent;
      padding: 0 35px;

      &::placeholder {
        color: rgba(0, 0, 0, 0.5);
        font-size: 16px;
        font-family: Martel;
        font-weight: 300;
        line-height: 1.2;
        padding: 15px 0px;
      }

    }

    .feedback-submit-btn {
      width: 90px;
      height: 42px;
      background: #B4EA7E;
      border-radius: 22px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      .arrow-icon {
        width: 42px;
        height: 42px;
      }

      &:hover {
        opacity: 0.9;
        transform: scale(1.02);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

@media (max-width: 1200px) {
  .landing-content {
    padding: 0 40px;
  }

  .features-section .features-wrapper {
    transform: scale(0.85);
    transform-origin: top center;
    height: 440px;
  }
}

@media (max-width: 768px) {
  .landing-content {
    padding: 0 20px;
  }

  .email-section {
    margin-bottom: 40px;

    .email-container {
      padding: 20px;
      border-radius: 30px;

      .email-title {
        font-size: 20px;
        margin-bottom: 15px;
      }

      .email-form .input-wrapper {
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        border-radius: 40px;
        height: auto;

        .email-input {
          padding: 12px 20px;
          font-size: 18px;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 12px 30px;
          font-size: 22px;
          height: auto;
        }
      }
    }
  }

  .features-section {
    margin-bottom: 40px;

    .features-wrapper {
      position: static;
      height: auto;

      .features-card {
        position: static;
        width: 100%;
        height: auto;
        padding: 30px 20px;

        .features-title {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .feature-items .feature-line {
          position: static !important;
          font-size: 14px;
          margin-bottom: 15px;
          height: auto;
        }
      }

      .pain-title {
        position: static;
        width: 100%;
        font-size: 18px;
        margin-bottom: 15px;
        text-align: center;
      }

      .pain-point-bubble {
        position: static;
        width: 100% !important;
        height: auto !important;
        margin-bottom: 10px;
        padding: 10px 20px;

        .text {
          font-size: 14px;
        }
      }

      .feature-img {
        display: none;
      }
    }
  }

  .feedback-section {
    .feedback-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .optional-badge {
        font-size: 14px;
        padding: 4px 15px;
      }

      .feedback-prompt {
        font-size: 16px;
      }
    }

    .feedback-input {
      padding: 12px 20px;
      font-size: 14px;
      min-height: 100px;
      resize: none;
    }
  }
}
</style>