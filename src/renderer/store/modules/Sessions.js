
const actions = {
  loadSessions ({ commit, dispatch }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const search = data.search
      const skip = data.skip
      const limit = data.limit
      db.find({ $and: [{ personaId }, search ? { $or: [{ title: new RegExp(search, 'gi') }, { url: new RegExp(search, 'gi') }] } : {}] }).sort({ dateTime: -1 }).skip(skip).limit(limit).exec((err, dbSessions) => {
        if (err) {
          reject(err)
        } else {
          dbSessions.forEach(s => {
            if (!s.isExpanded) s.isExpanded = false
          })
          resolve(dbSessions)
        }
      })
    })
  },
  deleteSessions ({ commit }, data) {
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
  showSessions ({ commit, dispatch }, data) {
    const persona = data.persona
    if (persona) {
      commit('addTab', { persona, url: 'aspect://sessions', title: 'Sessions' })
      const index = persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  clearSessions ({ commit }, data) {
    const db = data.db
    const personaId = data.personaId
    db.remove({ personaId }, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  clearAllSessions ({ commit }, data) {
    const db = data.db
    db.remove({}, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  restoreSession ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.findOne({ _id: data.sessionId }).exec((err, dbSession) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        dbSession.sites.forEach((item) => {
          commit('openInPersona', { url: item.url, personaId: data.personaId, title: item.title, icon: item.icon, isSuspended: true })
        })
      })
    })
  }
}

export default {
  actions
}
