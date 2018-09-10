// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  showDownloadsBar: false
}

const mutations = {
  showDownloads (state, data) {
    const persona = data.persona
    if (persona) {
      const tabs = persona.tabs
      tabs.push({
        _id: uuid(),
        url: 'aspect://downloads',
        addressText: null,
        title: 'Downloads',
        index: tabs.length,
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
  },
  openDownloadsBar (state, data) {
    state.showDownloadsBar = true
  },
  closeDownloadsBar (state, data) {
    state.showDownloadsBar = false
  }
}

const actions = {
  loadDownloads ({ commit, dispatch }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const search = data.search
      const skip = data.skip
      const limit = data.limit
      db.find({ $and: [{ personaId }, search ? { $or: [{ title: new RegExp(search, 'gi') }, { url: new RegExp(search, 'gi') }] } : {}] }).sort({ dateTime: -1 }).skip(skip).limit(limit).exec((err, dbDownloads) => {
        if (err) {
          reject(err)
        } else {
          resolve(dbDownloads)
        }
      })
    })
  },
  saveToDownloads ({ commit }, data) {
    const db = data.db
    const downloads = {
      personaId: data.personaId,
      filename: data.filename,
      serverFile: data.serverFile,
      localFile: data.localFile,
      size: data.size,
      dateTime: new Date()
    }
    db.insert(downloads, (err, dbDownloads) => {
      if (err) {
        alert('ERROR: ' + err)
        // return
      }
    })
  },
  deleteDownloads ({ commit }, data) {
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
  clearDownloads ({ commit }, data) {
    const db = data.db
    const personaId = data.personaId
    db.remove({ personaId }, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  clearAllDownloads ({ commit }, data) {
    const db = data.db
    db.remove({}, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}
