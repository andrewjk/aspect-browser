import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faHome, faPlus, faArrowLeft, faArrowRight, faSyncAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSearch)
library.add(faHome)
library.add(faPlus)
library.add(faArrowLeft)
library.add(faArrowRight)
library.add(faSyncAlt)
library.add(faSpinner)

Vue.component('fa', FontAwesomeIcon)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
