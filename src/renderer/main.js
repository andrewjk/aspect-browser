import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// Data storage via nedb
import pdb from './personas-db'
import sdb from './settings-db'
import hdb from './history-db'
import ssdb from './system-settings-db'

// FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faCog,
  faEdit,
  faUserEdit,
  faPlus,
  faTrash,
  faCheck,
  faHome,
  faArrowLeft,
  faArrowRight,
  faStar,
  faSyncAlt,
  faExternalLinkAlt,
  faSpinner,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faBars,
  faEllipsisV,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import { faWindowMinimize, faWindowMaximize, faWindowRestore, faWindowClose } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Normalize.css
// HACK: We have to refer to its location explicitly to avoid import errors
require('../../node_modules/normalize.css/normalize.css')

// Setup the data storage so that it can be accessed from any Vue component
Vue.prototype.$pdb = pdb
Vue.prototype.$sdb = sdb
Vue.prototype.$hdb = hdb
Vue.prototype.$ssdb = ssdb

// Add the FontAwesome icons that we will use
library.add(faSearch)
library.add(faCog)
library.add(faEdit)
library.add(faUserEdit)
library.add(faPlus)
library.add(faTrash)
library.add(faCheck)
library.add(faHome)
library.add(faArrowLeft)
library.add(faArrowRight)
library.add(faStar)
library.add(faSyncAlt)
library.add(faExternalLinkAlt)
library.add(faSpinner)
library.add(faTimes)
library.add(faChevronLeft)
library.add(faChevronRight)
library.add(faChevronUp)
library.add(faChevronDown)
library.add(faBars)
library.add(faEllipsisV)
library.add(faWindowMinimize)
library.add(faWindowMaximize)
library.add(faWindowRestore)
library.add(faWindowClose)
library.add(faHistory)

Vue.component('fa', FontAwesomeIcon)

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
