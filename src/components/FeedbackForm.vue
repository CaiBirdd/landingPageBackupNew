<template>
  <form @submit.prevent="handleSubmit" class="feedback-form">
    <div class="form-group">
      <label for="email">邮箱地址（必填）：</label>
      <input type="email" id="email" v-model="formData.email" required>

      <label for="feedback">您的反馈（可选）：</label>
      <textarea id="feedback" v-model="formData.content" rows="4"></textarea>
    </div>
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useToast } from "vue-toastification"
import { createFeedbackAPI } from '../apis/createFeedback'
import { usePostHog } from '../composables/usePosthog' // 导入 PostHog
import { useFbPixel } from '../composables/useFbPixel' // 导入 Facebook Pixel

// 获取 PostHog 实例
const { posthog } = usePostHog()
// 获取 Facebook Pixel 实例
const { trackLead } = useFbPixel()

// 获取 toast 消息提示实例
const toast = useToast()
// 定义一个变量来存定时器 ID,用于清除定时器
let timerId = null
//表单数据
const formData = ref({
  email: '',
  content: '',
  device: ''
})
//获取设备类型
const userAgent = navigator.userAgent.toLocaleLowerCase()
const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
formData.value.device = isMobile ? 'mobile' : 'pc'

const handleSubmit = () => {
  // 要在控制台打印的数据
  const logData = {
    email: formData.value.email,
    timestamp: new Date().toLocaleString(),
    device: formData.value.device,
    content: formData.value.content
  }
  // 打印到控制台
  console.log('=== 新的反馈提交 ===')
  console.log('邮箱:', logData.email)
  console.log('提交时间:', logData.timestamp)
  console.log('设备类型:', logData.device)
  console.log('反馈意见:', logData.content)
  console.log('==================')

  //发送请求发数据
  const sendFormdata = async (obj) => {
    try {
      const res = await createFeedbackAPI(obj)
      console.log(res)
      
      if (res.status === 201) {
        // 使用 Toast 消息提示 提交成功
        toast.success("感谢您的反馈！")

        // ✅提交成功后，同步发送事件到 PostHog
        posthog.capture('feedback_submitted', {
          email: formData.value.email,
          feedback_content: formData.value.content,
          device_type: formData.value.device,
          has_feedback: !!formData.value.content, // 是否填写了反馈
          feedback_length: formData.value.content.length // 反馈内容长度
        })
        // 可选：关联用户邮箱（用于用户识别）
        posthog.identify(formData.value.email, {
          email: formData.value.email,
          last_feedback_time: new Date().toISOString()
        })

        // ✅ 提交成功后，同步发送事件到 Facebook Pixel
        trackLead({
          content_name: 'Feedback Submission',
          content_category: 'Lead',
          value: 1.00,
          currency: 'USD'
        })

      } else {
        toast.warning("提交失败，请检查网络")
        // ✅ 提交失败时也可以追踪，同步发送事件到 PostHog
        posthog.capture('feedback_submit_failed', {
          email: formData.value.email,
          device_type: formData.value.device,
          error_status: res.status
        })
      }
    } catch (error) {
      toast.warning("提交失败，请检查网络")
      
      // ✅ 捕获错误
      posthog.capture('feedback_submit_error', {
        email: formData.value.email,
        device_type: formData.value.device,
        error_message: error.message
      })
    }
  }
  
  sendFormdata(formData.value)

  //如果之前有定时器在跑，先清除它
  if (timerId) clearTimeout(timerId)
  // 重置表单
  timerId = setTimeout(() => {
    formData.value = { email: '', content: '', device: formData.value.device }
    timerId = null
  }, 3000)
}

// 组件卸载时的生命周期钩子 清除定时器
onUnmounted(() => {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
})
</script>

<style lang="scss" scoped>
.feedback-form {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;

  .form-group {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      text-align: left;
      font-size: 14px;
      color: #333;
    }

    input,
    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.2s;
      background-color: #f9f9f9;

      &:focus {
        outline: none;
        border-color: #B4EA7E;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(180, 234, 126, 0.2);
      }
    }
  }

  button {
    padding: 14px 40px;
    background-color: #000;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    transition: transform 0.1s, opacity 0.2s;

    &:hover {
      opacity: 0.75;
    }

    &:active {
      transform: scale(0.92);
    }
  }
}

/* 移动端适配 (小于 768px) */
@media (max-width: 768px) {
  /* 表单区域适配 */
  .feedback-form {
    .form-group {
      input {
        padding: 10px;
        /* 稍微紧凑点 */
      }

      textarea {
        max-width: 100%;
      }
    }

    button {
      width: 100%;
      /* 手机上按钮通常通栏显示，更容易点击 */
      padding: 12px;
    }
  }
}
</style>