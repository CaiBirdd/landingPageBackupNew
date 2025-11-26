<script setup>
import { ref, onUnmounted } from 'vue'
import { useToast } from "vue-toastification"
import { createFeedbackAPI } from '../apis/createFeedback'
import { usePostHog } from '../composables/usePosthog'
import { useFbPixel } from '../composables/useFbPixel'

const { posthog } = usePostHog()
const { trackLead } = useFbPixel()
const toast = useToast()

let timerId = null
const formData = ref({
  email: '',
  content: '',
  device: 'mobile'
})

const handleSubmit = () => {
  console.log('=== 新的反馈提交 ===')
  console.log('邮箱:', formData.value.email)
  console.log('提交时间:', new Date().toLocaleString())
  console.log('设备类型:', formData.value.device)
  console.log('反馈意见:', formData.value.content)
  console.log('==================')

  const sendFormdata = async (obj) => {
    if (formData.value.email === '') {
    toast.warning("请输入邮箱")
    return
  }
    try {
      const res = await createFeedbackAPI(obj)
      
      if (res.status === 201) {
        toast.success("感谢您的反馈！")
        
        posthog.capture('feedback_submitted', {
          email: formData.value.email,
          feedback_content: formData.value.content,
          device_type: formData.value.device,
          has_feedback: !!formData.value.content,
          feedback_length: formData.value.content.length
        })
        
        posthog.identify(formData.value.email, {
          email: formData.value.email,
          last_feedback_time: new Date().toISOString()
        })

        trackLead({
          content_name: 'Feedback Submission',
          content_category: 'Lead',
          value: 1.00,
          currency: 'USD'
        })
      } else {
        toast.warning("提交失败，请检查网络")
        posthog.capture('feedback_submit_failed', {
          email: formData.value.email,
          device_type: formData.value.device,
          error_status: res.status
        })
      }
    } catch (error) {
      toast.warning("提交失败，请检查网络")
      posthog.capture('feedback_submit_error', {
        email: formData.value.email,
        device_type: formData.value.device,
        error_message: error.message
      })
    }
  }
  
  sendFormdata(formData.value)

  if (timerId) clearTimeout(timerId)
  timerId = setTimeout(() => {
    formData.value = { email: '', content: '', device: 'mobile' }
    timerId = null
  }, 3000)
}

onUnmounted(() => {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
})
</script>

<template>
  <div class="mobile-landing">
    <!-- 标题区域 -->
    <header class="header-section">
      <div class="title-wrapper">
        <div class="title-line-1">Meeting Strategist:</div>
        <div class="title-line-2">Your<span class="highlight">AI Pre-Meeting</span>Officer</div>
        <p class="subtitle">Get insights 5 minutes before the meeting about what to expect, how to respond, and how to win.</p>
      </div>
    </header>

    <!-- 邮箱订阅区域 -->
    <section class="email-section">
      <div class="email-container">
        <h2 class="email-title">Enter your email for early beta access!</h2>
        <form @submit.prevent="handleSubmit" class="email-form">
          <div class="input-wrapper">
            <input 
              type="email"
              name="email"
              autocomplete="email"
              v-model="formData.email" 
              placeholder="Email" 
              required
              class="email-input"
            >
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
      <div class="section-header">
        <div class="decorative-line"></div>
        <h2 class="section-title">Our product empowers you to:</h2>
        <div class="decorative-line"></div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--1.png" alt="feature" class="feature-img">
          <p class="feature-text">· Personalized strategies based on participants and past data.</p>
        </div>
        
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--2.png" alt="feature" class="feature-img">
          <p class="feature-text">· Track participant behavior and key signals during meetings.</p>
        </div>
        
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--3.png" alt="feature" class="feature-img">
          <p class="feature-text">· Predict tough questions and get tailored responses.</p>
        </div>
        
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--4.png" alt="feature" class="feature-img">
          <p class="feature-text">· Get detailed post-meeting summaries.</p>
        </div>
        
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--5.png" alt="feature" class="feature-img">
          <p class="feature-text">· Improve with each meeting.</p>
        </div>
        
        <div class="feature-card">
          <img src="../assets/ImageWithFallbackMobile--6.png" alt="feature" class="feature-img">
          <p class="feature-text">· Prepare in just 5 minutes.</p>
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
        <input 
          v-model="formData.content" 
          placeholder=" Tell Us What You Think...."
          class="feedback-input"
        >
        <button type="button" @click="handleSubmit" class="feedback-submit-btn">
          <img src="../assets/arrow_forward.svg" alt="Submit" class="arrow-icon">
        </button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.mobile-landing {
  max-width: 440px;
  margin: 0 auto;
  padding: 1px 10px calc(100vh - 650px);  // 动态计算，适应不同设备
  background: #FFF;
  font-family: Martel, serif;
}

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
      font-size: 8px;
      font-weight: 300;
      line-height: 1.375;
      letter-spacing: 1px;
      color: #000;
      margin-top: 20px;
      padding: 0 30px;
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
          font-family: 'Microsoft JhengHei UI';
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
          padding: 8px 15px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          
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
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10.9px;
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
      line-height: 1.54;
      letter-spacing: 1.5px;
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
        font-size: 9px;
        font-weight: 300;
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
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    
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
      letter-spacing: 2.2px;
      text-align: center;
      color: #000;
      margin: 18px;
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
        width: 37px;
        height: 37px;
        border-radius: 5px;
        object-fit: cover;
        flex-shrink: 0;
      }
      
      .feature-text {
        font-family: 'Martel';
        font-size: 9px;
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
      padding: 2px 8px;
      font-family: Martel;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.5;
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
      
      &::placeholder {
        color: rgba(0, 0, 0, 0.5);
        font-size: 10px;
        font-family: Martel;
        font-weight: 300;
        line-height: 1.2;
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