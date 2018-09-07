// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'
import { create } from 'vue-modal-dialogs'

import AlertDialog from '../../components/LandingPage/AlertDialog'
import ConfirmDialog from '../../components/LandingPage/ConfirmDialog'

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
        backDownloads: [],
        forwardDownloads: []
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
      url: data.url,
      icon: data.icon,
      title: data.title,
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
    const dialog = create(ConfirmDialog)
    dialog({ content: 'Are you sure you want to clear the downloaded files for this persona?' }).transition()
      .then((result) => {
        if (result) {
          const db = data.db
          const adb = data.adb
          const personaId = data.personaId
          db.remove({ personaId }, { multi: true }, (err, numReplaced) => {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            // Also delete downloads activity
            adb.remove({ personaId, isPreviousSession: true }, { multi: true }, (err, numRemoved) => {
              if (err) {
                alert('ERROR: ' + err)
              } else {
                const dialog = create(AlertDialog)
                dialog({ content: 'Downloaded files cleared.' }).transition()
                  .catch((err) => {
                    alert('ERROR: ' + err)
                  })
              }
            })
          })
        }
      })
      .catch((err) => {
        alert('ERROR: ' + err)
      })
  },
  clearAllDownloads ({ commit }, data) {
    const dialog = create(ConfirmDialog)
    dialog({ content: 'Are you sure you want to clear the downloaded files for all personas?' }).transition()
      .then((result) => {
        if (result) {
          const db = data.db
          db.remove({}, { multi: true }, (err, numReplaced) => {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            const dialog = create(AlertDialog)
            dialog({ content: 'Downloaded files cleared.' }).transition()
              .catch((err) => {
                alert('ERROR: ' + err)
              })
          })
        }
      })
      .catch((err) => {
        alert('ERROR: ' + err)
      })
  }
}

export default {
  state,
  mutations,
  actions
}
