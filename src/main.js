import Vue from 'vue'
import App from './App.vue'
import router from "./router"

import "@tools/rem"
import "@styles/reset.css"
import 'vant/lib/index.css'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
