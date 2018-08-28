// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  settings: {},
  showSettingsModal: false,
  settingsToUpdate: null,
  settingsToEdit: null
}

const mutations = {
  setSettings (state, settings) {
    state.settings = settings
  },
  editSettings (state) {
    // Create a new settings object to be edited
    const settings = state.settings
    state.settingsToUpdate = settings
    state.settingsToEdit = {
      _id: settings._id,
      searchProvider: settings.searchProvider,
      enableLoginManager: settings.enableLoginManager
    }
    state.showSettingsModal = true
  },
  setSettingsDetails (state, data) {
    const settings = data.settings
    if (data.searchProvider !== undefined) settings.searchProvider = data.searchProvider
    if (data.enableLoginManager !== undefined) settings.enableLoginManager = data.enableLoginManager
  },
  closeSettingsModal (state) {
    state.settingsToUpdate = null
    state.settingsToEdit = null
    state.showSettingsModal = false
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
  saveSettings ({ commit }, data) {
    const db = data.db
    const settingsToUpdate = data.settingsToUpdate
    const settingsToEdit = data.settingsToEdit
    const settingsDetails = {
      settings: settingsToUpdate,
      searchProvider: settingsToEdit.searchProvider,
      enableLoginManager: settingsToEdit.enableLoginManager
    }
    commit('setSettingsDetails', settingsDetails)
    db.update({ _id: settingsToUpdate._id }, settingsToUpdate, {}, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('closeSettingsModal')
    })
  }
}

export default {
  state,
  mutations,
  actions
}
