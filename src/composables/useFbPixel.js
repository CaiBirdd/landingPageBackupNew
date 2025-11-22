/**
 * Facebook Pixel Composable
 * 用于在 Vue 组件中追踪 Facebook Pixel 事件
 */

export function useFbPixel() {
  /**
   * 检查 fbq 是否可用
   */
  const isFbqAvailable = () => {
    return typeof window !== 'undefined' && typeof window.fbq === 'function'
  }

  /**
   * 追踪标准事件
   * @param {string} eventName - Facebook 标准事件名称
   * @param {object} params - 可选的事件参数
   */
  const track = (eventName, params = {}) => {
    if (isFbqAvailable()) {
      try {
        window.fbq('track', eventName, params)
        console.log(`[FB Pixel] Tracked: ${eventName}`, params)
      } catch (error) {
        console.error('[FB Pixel] Track error:', error)
      }
    } else {
      console.warn('[FB Pixel] fbq is not available')
    }
  }

  /**
   * 追踪自定义事件
   * @param {string} eventName - 自定义事件名称
   * @param {object} params - 可选的事件参数
   */
  const trackCustom = (eventName, params = {}) => {
    if (isFbqAvailable()) {
      try {
        window.fbq('trackCustom', eventName, params)
        console.log(`[FB Pixel] Tracked Custom: ${eventName}`, params)
      } catch (error) {
        console.error('[FB Pixel] TrackCustom error:', error)
      }
    } else {
      console.warn('[FB Pixel] fbq is not available')
    }
  }

  /**
   * 常用的标准事件快捷方法
   */
  const trackLead = (params = {}) => track('Lead', params)
  const trackCompleteRegistration = (params = {}) => track('CompleteRegistration', params)
  const trackContact = (params = {}) => track('Contact', params)
  const trackSubmitApplication = (params = {}) => track('SubmitApplication', params)
  const trackViewContent = (params = {}) => track('ViewContent', params)

  return {
    track,
    trackCustom,
    trackLead,
    trackCompleteRegistration,
    trackContact,
    trackSubmitApplication,
    trackViewContent,
    isFbqAvailable
  }
}
