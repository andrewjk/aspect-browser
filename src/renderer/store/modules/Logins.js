// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  showLoginMenu: false,
  loginSettings: {}
}

const mutations = {
  openLoginMenu (state, data) {
    state.loginSettings = {
      host: data.host,
      fields: data.fields
    }
    state.showLoginMenu = true
  },
  closeLoginMenu (state, data) {
    state.showLoginMenu = false
  },
  showLogins (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      tabs.push({
        _id: uuid(),
        url: 'aspect://logins',
        addressText: null,
        title: 'Logins',
        icon: null,
        isActive: true,
        isLoading: false,
        backHistory: [],
        forwardHistory: []
      })
      const newIndex = tabs.length - 1
      tabs.forEach((t, i) => {
        t.isActive = (i === newIndex)
      })
    }
  }
}

const actions = {
  loadMasterPasswordRecord ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.find({ masterPassword: 1 }).exec((err, dbDetails) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  },
  saveMasterPasswordRecord ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.insert({ 'masterPassword': 1 }, (err, dbRecord) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  },
  loadLoginDetails ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const host = data.host
      db.find({ personaId, host }).exec((err, dbDetails) => {
        if (err) {
          reject(err)
        }
        if (dbDetails.length) {
          resolve(dbDetails[0])
        } else {
          resolve()
        }
      })
    })
  },
  saveLoginDetails ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const host = data.host
      db.find({ personaId, host }).exec((err, dbDetails) => {
        if (err) {
          reject(err)
        }
        if (dbDetails.length) {
          // Update the existing details
          const id = dbDetails[0]._id
          Object.assign(dbDetails[0].fields, data.fields)
          db.update({ _id: id }, dbDetails[0], {}, (err, numReplaced) => {
            if (err) {
              reject(err)
            }
            resolve()
          })
        } else {
          // Add the new details
          const fields = data.fields
          const login = {
            personaId,
            host,
            fields
          }
          db.insert(login, (err, dbDetails) => {
            if (err) {
              reject(err)
            }
            resolve()
          })
        }
      })
    })
  },
  ignoreLoginDetails ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const host = data.host
      db.find({ personaId, host }).exec((err, dbDetails) => {
        if (err) {
          reject(err)
        }
        if (dbDetails.length) {
          // Update the existing details
          const id = dbDetails[0]._id
          dbDetails[0].fields = undefined
          dbDetails[0].ignore = true
          db.update({ _id: id }, dbDetails[0], {}, (err, numReplaced) => {
            if (err) {
              reject(err)
            }
            resolve()
          })
        } else {
          // Add the new details
          const login = {
            personaId,
            host,
            ignore: true
          }
          db.insert(login, (err, dbDetails) => {
            if (err) {
              reject(err)
            }
            resolve()
          })
        }
      })
    })
  },
  loadLogins ({ commit, dispatch }, data) {
    const db = data.db
    const personaId = data.personaId
    const search = data.search
    const skip = data.skip
    const limit = data.limit
    return new Promise((resolve, reject) => {
      db.find({ $and: [{ personaId }, search ? { host: new RegExp(search, 'gi') } : {}] }).sort({ host: 1 }).skip(skip).limit(limit).exec((err, dbLogins) => {
        if (err) {
          reject(err)
        } else {
          resolve(dbLogins)
        }
      })
    })
  },
  saveToLogins ({ commit }, data) {
    const db = data.db
    const logins = {
      personaId: data.personaId,
      url: data.url,
      icon: data.icon,
      title: data.title,
      dateTime: new Date()
    }
    db.insert(logins, (err, dbLogins) => {
      if (err) {
        alert('ERROR: ' + err)
        // return
      }
    })
  },
  deleteLogins ({ commit }, data) {
    const db = data.db
    const ids = data.ids
    return new Promise((resolve, reject) => {
      db.remove({ _id: { $in: ids } }, { multi: true }, (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          resolve(numRemoved)
        }
      })
    })
  }
}

export default {
  state,
  mutations,
  actions
}
