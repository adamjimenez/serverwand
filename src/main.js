import '@fortawesome/fontawesome-free/css/all.css' 
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
//import './registerServiceWorker'
import VuetifyConfirm from 'vuetify-confirm'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import vueFilterPrettyBytes from 'vue-filter-pretty-bytes'
import EventHub from 'vue-event-hub'
import moment from 'moment'

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment.unix(parseInt(value)).format('MM/DD/YYYY hh:mm')
  }
})

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
  }
})

Vue.use(VuetifyConfirm, {
  vuetify,
  property: '$confirm'
})

Vue.use(vueFilterPrettyBytes)

Vue.config.productionTip = false
Vue.use(Vuetify)

Vue.use(EventHub);

new Vue({
  el: '#app',
  router,
  vuetify: vuetify,
  render: h => h(App)
})
