import '@fortawesome/fontawesome-free/css/all.css' 
import Vue from 'vue'
import App from './App.vue'

import router from './router'
//import './registerServiceWorker'

Vue.config.productionTip = false

import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: '#A25C57',
    secondary: '#4C3148',
    accent: '#A25C57',
    error: '#b71c1c'
  }
})

import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
