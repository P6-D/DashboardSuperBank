import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from 'motion-v'

import './assets/main.css'
import App from './App.vue'
import { router } from './app/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
