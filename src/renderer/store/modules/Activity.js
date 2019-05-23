// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const actions = {
  loadActivity ({ commit }, db) {
    return new Promise((resolve, reject) => {
      // Delete records with isPreviousSession and update records with isCurrentSession to isPreviousSession on load
      db.remove({ isPreviousSession: true }, { multi: true }, (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          db.update({ isCurrentSession: true }, { $set: { isCurrentSession: false, isPreviousSession: true } }, { multi: true }, (err, numReplaced) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }
      })
    })
  },
  saveToActivity ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const activity = {
        _id: uuid(),
        personaId: data.personaId,
        url: data.url,
        icon: data.icon,
        title: data.title,
        index: data.index,
        isCurrentSession: true
      }
      db.insert(activity, (err, dbActivity) => {
        if (err) {
          reject(err)
        } else {
          resolve(dbActivity._id)
        }
      })
    })
  },
  updateActivity ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const activityId = data.activityId
      const activity = {
        url: data.url,
        icon: data.icon,
        title: data.title,
        index: data.index
      }
      db.update({ _id: activityId }, { $set: activity }, {}, (err, numReplaced) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  },
  removeFromActivity ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const activityId = data.activityId
      db.remove({ _id: activityId }, {}, (err, numReplaced) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  },
  clearActivity ({ commit }, data) {
    const db = data.db
    const personaId = data.personaId
    db.remove({ personaId, isPreviousSession: true }, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  clearAllActivity ({ commit }, data) {
    const db = data.db
    db.remove({ isPreviousSession: true }, { multi: true }, (err, numReplaced) => {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  saveSession ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const adb = data.adb
      const sdb = data.sdb
      const personaId = data.personaId
      adb.find({ personaId, isCurrentSession: true }).sort({ index: 1 }).exec((err, dbActivity) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        const session = {
          _id: uuid(),
          personaId,
          name: data.name,
          sites: dbActivity.map((item) => {
            return {
              url: item.url,
              icon: item.icon,
              title: item.title,
              index: item.index
            }
          })
        }
        sdb.insert(session, (err, dbSession) => {
          if (err) {
            reject(err)
          }
        })
      })
    })
  },
  restorePreviousActivity ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.find({ isPreviousSession: true }).sort({ index: 1 }).exec((err, dbActivity) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        dbActivity.forEach((item) => {
          commit('openInPersona', { url: item.url, personaId: item.personaId, title: item.title, icon: item.icon, isSuspended: true })
        })
        // Set the activity to have isCurrentSession = true so they are current again and can be
        // reloaded the next time the browser is opened, even if they haven't been restored from
        // suspension
        db.update({ isPreviousSession: true }, { $set: { isCurrentSession: true, isPreviousSession: false } }, { multi: true }, (err, numReplaced) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  }
}

export default {
  actions
}
