import '@fortawesome/fontawesome-free/css/all.css' 
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
//import './registerServiceWorker'
import VuetifyConfirm from 'vuetify-confirm'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

const vuetify = new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: '#A25C57',
        secondary: '#4C3148',
        accent: '#A25C57',
        error: '#b71c1c',
      },
      dark: {
        primary: '#A25C57',
        secondary: '#4C3148',
        accent: '#A25C57',
        error: '#b71c1c',
      },
    },
  },
})

Vue.use(VuetifyConfirm, {
  vuetify,
  property: '$confirm'
})

Vue.config.productionTip = false
Vue.use(Vuetify)

Vue.prototype.$eventHub = new Vue(); // Global event bus

new Vue({
  el: '#app',
  router,
  vuetify: vuetify,
  render: h => h(App)
})
