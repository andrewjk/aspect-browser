// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  settings: {}
}

const mutations = {
  setSettings (state, settings) {
    state.settings = settings
  },
  setSettingsDetails (state, data) {
    if (data.searchProvider !== undefined) state.settings.searchProvider = data.searchProvider
    if (data.enableLoginManager !== undefined) state.settings.enableLoginManager = data.enableLoginManager
  }
}

const actions = {
  loadSettings ({ commit, dispatch }, db) {
    db.find({}).exec((err, dbSettings) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      // Create default settings if nothing was loaded
      if (dbSettings.length) {
        commit('setSettings', dbSettings[0])
      } else {
        dispatch('createDefaultSettings', db)
      }
    })
  },
  createDefaultSettings ({ commit }, db) {
    const defaultSettings = {
      _id: uuid(),
      searchProvider: 'https://duckduckgo.com/?q={0}',
      enableLoginManager: false
    }
    db.insert(defaultSettings, (err, dbSettings) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('setSettings', dbSettings)
    })
  },
  editSettings ({ getters, commit, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      commit('addTab', { persona, url: 'aspect://settings', title: 'Settings' })
      const index = persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  }
}

export default {
  state,
  mutations,
  actions
}
