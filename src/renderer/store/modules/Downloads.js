
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  showDownloadsBar: false
}

const mutations = {
  openDownloadsBar (state, data) {
    state.showDownloadsBar = true
  },
  closeDownloadsBar (state, data) {
    state.showDownloadsBar = false
  },
  addDownload (state, data) {
    const persona = data.persona
    persona.downloads.push({
      _id: uuid(),
      filename: data.filename,
      serverFile: data.serverFile,
      localFile: data.localFile,
      progress: 0,
      size: data.size,
      isCompleted: false,
      isPaused: false,
      isCancelled: false
    })
  },
  setDownloadDetails (state, data) {
    const download = data.download
    if (data.progress !== undefined) download.progress = data.progress
    if (data.isCompleted !== undefined) download.isCompleted = data.isCompleted
    if (data.isPaused !== undefined) download.isPaused = data.isPaused
    if (data.isCancelled !== undefined) download.isCancelled = data.isCancelled
  },
  removeDownload (state, data) {
    const persona = data.persona
    const download = data.download
    const index = persona.downloads.indexOf(download)
    persona.downloads.splice(index, 1)
    if (!persona.downloads.length) {
      state.showDownloadsBar = false
    }
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
  showDownloads ({ commit, dispatch }, data) {
    const persona = data.persona
    if (persona) {
      commit('addTab', { persona, url: 'aspect://downloads', title: 'Downloads' })
      const index = persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
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
  },
  startDownload ({ getters, commit }, data) {
    const persona = getters.getActivePersona
    if (persona) {
      const changedData = Object.assign({ persona }, data)
      commit('addDownload', changedData)
    }
  },
  findAndSetDownloadDetails ({ commit, rootState }, data) {
    const localFile = data.localFile
    let persona
    let download
    rootState.Personas.personas.forEach((p) => {
      p.downloads.forEach((d) => {
        if (d.localFile === localFile) {
          persona = p
          download = d
        }
      })
    })
    if (download) {
      const changedData = Object.assign({ download }, data)
      commit('setDownloadDetails', changedData)
      if (changedData.isCompleted) {
        // 5 minutes in development, 30 minutes in production
        const timeUntilRemoval = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 30 * 60 * 1000
        setTimeout(() => {
          commit('removeDownload', { persona, download })
        }, timeUntilRemoval)
      }
    }
  }
}

export default {
  state,
  mutations,
  actions
}
