import '@fortawesome/fontawesome-free/css/all.css' 
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
//import './registerServiceWorker'

Vue.config.productionTip = false

Vue.use(Vuetify)

import VuetifyConfirm from 'vuetify-confirm'
Vue.use(VuetifyConfirm, {
  buttonTrueText: 'OK',
  buttonFalseText: 'Cancel',
  color: 'warning',
  icon: 'warning',
  title: 'Confirm',
  width: 300,
  property: '$confirm'
})

import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

Vue.prototype.$eventHub = new Vue(); // Global event bus

new Vue({
  el: '#app',
  router,
  vuetify: new Vuetify(),
  render: h => h(App)
})
