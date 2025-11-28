import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import pxtorem from 'postcss-pxtorem'; // <-- 必须在此处导入插件

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  server: {
    host: '0.0.0.0' // 监听所有网络接口
  },
  css: {
    postcss: {
      plugins: [
        // ... 其他 PostCSS 插件 (如 autoprefixer)
        pxtorem({
          rootValue: 44, // 核心设置：设计稿宽度 440px / 10 = 44。这意味着 1rem = 10px 在 440px 视口下。
          unitPrecision: 5,
          propList: ['*'], // 转换所有 CSS 属性中的 px
          selectorBlackList: ['ignore-'], // 忽略带有 'ignore-' 前缀的选择器
          replace: true,
          mediaQuery: false,
          minPixelValue: 1 // 小于等于 1px 的不转换，用于细线
        }),
      ],
    },
  }
})
