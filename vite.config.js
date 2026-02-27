import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import pxtoviewport from 'postcss-px-to-viewport-8-plugin';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  server: {
    host: '0.0.0.0'
  },
  css: {
    postcss: {
      plugins: [
        pxtoviewport({
          viewportWidth: 440, // 视口宽度，对应设计稿宽度
          unitPrecision: 5,
          viewportUnit: 'vw', // 指定需要转换成的视口单位
          propList: ['*'], // 转换所有 CSS 属性中的 px
          selectorBlackList: [
            'ignore-',
            'header-section-pc',
            'landing-content-pc',
            'email-section-pc',
            'features-section-pc',
            'feedback-section-pc',
            'feedback-container-pc',
            'Vue-Toastification'
          ], // PC端组件和第三方库的class，不转换为vw
          replace: true,
          mediaQuery: false,
          minPixelValue: 1 // 小于等于 1px 的不转换
        }),
      ],
    },
  }
})
