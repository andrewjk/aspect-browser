import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// Data storage via nedb
import db from './datastore'

// FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faHome, faPlus, faArrowLeft, faArrowRight, faStar, faSyncAlt, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faStar as faRegStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Normalize.css
// HACK: We have to refer to its location explicitly to avoid import errors
require('../../node_modules/normalize.css/normalize.css')

// Setup the data storage so that it can be accessed from any Vue component
Vue.prototype.$db = db

// Add the FontAwesome icons that we will use
library.add(faSearch)
library.add(faHome)
library.add(faPlus)
library.add(faArrowLeft)
library.add(faArrowRight)
library.add(faStar)
library.add(faRegStar)
library.add(faSyncAlt)
library.add(faSpinner)
library.add(faTimes)

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
