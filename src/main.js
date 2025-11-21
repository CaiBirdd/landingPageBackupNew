import { createApp } from 'vue'
import App from './App.vue'
import Toast, { POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"
import './style.css' // 引入全局样式

const app = createApp(App)

const options = {
  // 您可以在这里添加全局配置，例如超时时间等
  timeout: 3000,
  position: POSITION.TOP_CENTER
}
app.use(Toast, options)
app.mount('#app')
