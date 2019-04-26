
import { create } from 'vue-modal-dialogs'
import AlertDialog from '../../components/Dialogs/AlertDialog'

const mutations = {
  addToHistory (state, data) {
    // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
    const tab = data.tab
    const url = data.url
    const title = data.title
    if (!tab.haveGoneBack) {
      tab.backHistory.push({
        url: url,
        title: title
      })
      tab.forwardHistory = []
    }
    tab.haveGoneBack = false
  },
  goBack (state, data) {
    const persona = data.persona
    const tab = data.tab
    persona.tabs.forEach((t) => {
      if (t._id === tab._id) {
        if (t.backHistory.length) {
          t.forwardHistory.push({
            url: t.url,
            title: t.title
          })
          const url = t.backHistory.pop().url
          t.addressText = url
          t.haveGoneBack = true
          if (url === 'aspect://home') {
            t.url = 'aspect://home'
            t.title = 'Home'
            t.webview = null
          } else if (url === 'aspect://history') {
            t.url = 'aspect://history'
            t.title = 'History'
            t.webview = null
          } else if (url === 'aspect://downloads') {
            t.url = 'aspect://downloads'
            t.title = 'Downloads'
            t.webview = null
          } else if (url === 'aspect://logins') {
            t.url = 'aspect://logins'
            t.title = 'Logins'
            t.webview = null
          } else if (url === 'aspect://settings') {
            t.url = 'aspect://settings'
            t.title = 'Settings'
            t.webview = null
          } else if (url === 'aspect://error') {
            t.url = 'aspect://error'
            t.title = 'Error'
            t.webview = null
          } else if (t.webview) {
            t.webview.loadURL(url)
          } else {
            t.url = url
          }
        }
      }
    })
  },
  goForward (state, data) {
    const persona = data.persona
    const tab = data.tab
    persona.tabs.forEach((t) => {
      if (t._id === tab._id) {
        if (t.forwardHistory.length) {
          if (!t.forwardHistory) {
            t.forwardHistory = []
          }
          t.backHistory.push({
            url: t.url,
            title: t.title
          })
          const url = t.forwardHistory.pop().url
          t.addressText = url
          t.haveGoneBack = true
          if (url === 'aspect://home') {
            t.url = 'aspect://home'
            t.title = 'Home'
            t.webview = null
          } else if (url === 'aspect://history') {
            t.url = 'aspect://history'
            t.title = 'History'
            t.webview = null
          } else if (url === 'aspect://downloads') {
            t.url = 'aspect://downloads'
            t.title = 'Downloads'
            t.webview = null
          } else if (url === 'aspect://logins') {
            t.url = 'aspect://logins'
            t.title = 'Logins'
            t.webview = null
          } else if (url === 'aspect://settings') {
            t.url = 'aspect://settings'
            t.title = 'Settings'
            t.webview = null
          } else if (url === 'aspect://error') {
            t.url = 'aspect://error'
            t.title = 'Error'
            t.webview = null
          } else if (t.webview) {
            t.webview.loadURL(url)
          } else {
            t.url = url
          }
        }
      }
    })
  },
  goToUrl (state, data) {
    const tab = data.tab
    let url = data.url
    const searchProvider = data.searchProvider

    if (url.indexOf('.') !== -1 && url.indexOf(' ') === -1) {
      // If it has a dot and no spaces, treat it as a URL
      // Might need to add http:// on the front there
      if (!/http[s]*:\/\//.test(url)) {
        url = 'https://' + url
      }
    } else {
      // Search for whatever was typed in
      url = searchProvider.replace('{0}', url)
    }
    tab.addressText = url

    tab.forwardHistory = []
    tab.backHistory.push({
      url: tab.url,
      title: tab.title
    })

    if (tab.webview) {
      tab.webview.loadURL(url)
    } else {
      tab.url = url
    }
  },
  goHome (state, tab) {
    if (!tab.backHistory) {
      tab.backHistory = []
    }
    tab.backHistory.push({
      url: tab.url,
      title: tab.title
    })
    tab.forwardHistory = []
    tab.url = 'aspect://home'
    tab.addressText = null
    tab.title = 'Home'
    tab.webview = null
  }
}

const actions = {
  loadHistory ({ commit, dispatch }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const search = data.search
      const skip = data.skip
      const limit = data.limit
      db.find({ $and: [{ personaId }, search ? { $or: [{ title: new RegExp(search, 'gi') }, { url: new RegExp(search, 'gi') }] } : {}] }).sort({ dateTime: -1 }).skip(skip).limit(limit).exec((err, dbHistory) => {
        if (err) {
          reject(err)
        } else {
          resolve(dbHistory)
        }
      })
    })
  },
  saveToHistory ({ commit }, data) {
    const db = data.db
    const history = {
      personaId: data.personaId,
      url: data.url,
      icon: data.icon,
      title: data.title,
      dateTime: new Date()
    }
    db.insert(history, (err, dbHistory) => {
      if (err) {
        alert('ERROR: ' + err)
        // return
      }
    })
  },
  deleteHistory ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const ids = data.ids
      db.remove({ _id: { $in: ids } }, { multi: true }, (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          resolve(numRemoved)
        }
      })
    })
  },
  showHistory ({ getters, commit, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      commit('addTab', { persona, url: 'aspect://history', title: 'History' })
      const index = persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  clearHistory ({ commit }, data) {
    const db = data.db
    const personaId = data.personaId
    db.remove({ personaId }, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  clearAllHistory ({ commit }, data) {
    const db = data.db
    db.remove({}, { multi: true }, async (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      const dialog = create(AlertDialog)
      await dialog({ content: 'Browsing history cleared.' }).transition()
    })
  }
}

export default {
  mutations,
  actions
}
