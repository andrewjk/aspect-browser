// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'
import { create } from 'vue-modal-dialogs'

import SettingsDialog from '../../components/Dialogs/SettingsDialog'

const state = {
  settings: {}
}

const mutations = {
  setSettings (state, settings) {
    state.settings = settings
  },
  setSettingsDetails (state, data) {
    const settings = data.settings
    if (data.searchProvider !== undefined) settings.searchProvider = data.searchProvider
    if (data.enableLoginManager !== undefined) settings.enableLoginManager = data.enableLoginManager
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
  editSettings ({ commit }, data) {
    const db = data.db
    const settings = data.settings
    // Create a new settings object to be edited
    const settingsToEdit = {
      _id: settings._id,
      searchProvider: settings.searchProvider,
      enableLoginManager: settings.enableLoginManager
    }
    const showForm = create(SettingsDialog)
    showForm({ settings: settingsToEdit }).transition()
      .then((result) => {
        if (result) {
          const settingsDetails = {
            settings,
            searchProvider: settingsToEdit.searchProvider,
            enableLoginManager: settingsToEdit.enableLoginManager
          }
          commit('setSettingsDetails', settingsDetails)
          db.update({ _id: settings._id }, settings, {}, (err, numReplaced) => {
            if (err) {
              alert('ERROR: ' + err)
              // return
            }
          })
        }
      })
  }
}

export default {
  state,
  mutations,
  actions
}
