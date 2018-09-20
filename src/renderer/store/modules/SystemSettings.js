// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  settings: {}
}

const mutations = {
  setSystemSettings (state, settings) {
    state.settings = settings
  },
  setUpdateChecked (state, data) {
    state.settings.updateChecked = data.updateChecked
    state.settings.updateCheckedVersion = data.updateCheckedVersion
  },
  setUpdateExists (state, data) {
    state.settings.updateExists = data.updateExists
  }
}

const actions = {
  loadSystemSettings ({ commit, dispatch }, db) {
    db.find({}).exec((err, dbSettings) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      // Create default settings if nothing was loaded
      if (dbSettings.length) {
        commit('setSystemSettings', dbSettings[0])
      } else {
        dispatch('createDefaultSystemSettings', db)
      }
    })
  },
  createDefaultSystemSettings ({ commit }, db) {
    const defaultSettings = {
      _id: uuid(),
      updateChecked: new Date(1900, 1, 1),
      updateCheckedVersion: '',
      updateExists: false
    }
    db.insert(defaultSettings, (err, dbSettings) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('setSystemSettings', dbSettings)
    })
  },
  saveSystemSettings ({ commit }, data) {
    const db = data.db
    const settings = data.systemSettings
    db.update({ _id: settings._id }, settings, {}, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
        // return
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}
