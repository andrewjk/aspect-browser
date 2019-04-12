
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import PersonaDialog from '../../components/Dialogs/PersonaDialog'

const state = {
  personas: []
}

const getters = {
  getActivePersona (state) {
    return state.personas.find((p) => {
      return p.isActive
    })
  }
}

function sorter (a, b) {
  if (a.order < b.order) {
    return -1
  } else if (a.order > b.order) {
    return 1
  } else {
    return 0
  }
}

const mutations = {
  setPersonas (state, personas) {
    // We need to create personas with all of the extra fields we want to be tracked
    state.personas = personas.map((persona) => {
      return {
        _id: persona._id,
        name: persona.name,
        shortName: persona.shortName,
        color: persona.color,
        order: persona.order,
        bookmarks: persona.bookmarks,
        isActive: false,
        hasOpenTab: false,
        tabs: [
          {
            _id: uuid(),
            url: 'aspect://home',
            addressText: null,
            title: 'Home',
            index: 0,
            icon: null,
            isActive: true,
            isLoading: false,
            isSuspended: false,
            backHistory: [],
            forwardHistory: []
          }
        ],
        closedTabs: [],
        downloads: []
      }
    })
  },
  setActivePersonaIndex (state, index) {
    if (index < 0 || index >= state.personas.length) {
      return
    }
    state.personas.forEach((p, i) => {
      p.isActive = (i === index)
    })
  },
  sortPersonas (state) {
    state.personas = state.personas.sort(sorter)
  },
  setHasOpenTab (state, persona) {
    persona.hasOpenTab = persona.tabs.some((tab) => {
      return tab.url
    })
  },
  addHomeTab (state, persona) {
    persona.isActive = false
    persona.hasOpenTab = false
    persona.tabs = [
      {
        _id: uuid(),
        url: 'aspect://home',
        addressText: null,
        title: 'Home',
        index: 0,
        icon: null,
        isActive: true,
        isLoading: false,
        isSuspended: false,
        backHistory: [],
        forwardHistory: []
      }
    ]
    persona.closedTabs = []
    persona.downloads = []
  },
  nextPersona (state) {
    let index
    for (let i = 0; i < state.personas.length; i++) {
      if (state.personas[i].isActive) {
        index = i
      }
    }
    const newIndex = index < state.personas.length - 1 ? index + 1 : 0
    state.personas.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  },
  previousPersona (state) {
    let index
    for (let i = 0; i < state.personas.length; i++) {
      if (state.personas[i].isActive) {
        index = i
      }
    }
    const newIndex = index > 0 ? index - 1 : state.personas.length - 1
    state.personas.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  },
  openInPersona (state, data) {
    const url = data.url
    const personaId = data.personaId
    const persona = state.personas.find((p) => {
      return p._id === personaId
    })
    if (persona) {
      const tabs = persona.tabs
      tabs.push({
        _id: uuid(),
        url: url,
        addressText: url,
        title: data.title ? data.title : url.replace(/http[s]*:\/\/[www.]*/, ''),
        index: tabs.length,
        icon: data.icon,
        isActive: false,
        isLoading: false,
        isSuspended: !!data.isSuspended,
        backHistory: [],
        forwardHistory: []
      })
      persona.hasOpenTab = tabs.some((tab) => {
        return tab.url
      })
    }
  },
  movePersonaUp (state, index) {
    if (index === 0) {
      return
    }
    // Swap this persona's order with the next persona's order
    const thisOrder = state.personas[index].order
    const prevOrder = state.personas[index - 1].order
    state.personas[index].order = prevOrder
    state.personas[index - 1].order = thisOrder
  },
  movePersonaDown (state, index) {
    if (index === state.personas.length - 1) {
      return
    }
    // Swap this persona's order with the next persona's order
    const thisOrder = state.personas[index].order
    const nextOrder = state.personas[index + 1].order
    state.personas[index].order = nextOrder
    state.personas[index + 1].order = thisOrder
  },
  sanitizePersonaOrders (state) {
    // Renumber everything, just in case something funny has gone on
    state.personas.sort(sorter)
    for (var i = 0; i < state.personas.length; i++) {
      state.personas[i].order = i + 1
    }
  },
  setPersonaDetails (state, data) {
    const persona = data.persona
    if (data.name !== undefined) persona.name = data.name
    if (data.shortName !== undefined) persona.shortName = data.shortName
    if (data.color !== undefined) persona.color = data.color
  },
  insertPersona (state, persona) {
    state.personas.push(persona)
    const newIndex = state.personas.length - 1
    state.personas.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  },
  removePersona (state, persona) {
    const index = state.personas.indexOf(persona)
    state.personas.splice(index, 1)
    if (!state.personas.length) {
      // TODO: this.createDefaultPersona()
    }
    const newIndex = Math.min(index, state.personas.length - 1)
    state.personas.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  }
}

const actions = {
  loadPersonas ({ commit, dispatch }, db) {
    db.find({}).sort({ order: 1 }).exec((err, dbPersonas) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }

      commit('setPersonas', dbPersonas)

      // HACK: The sort function doesn't seem to work?
      commit('sortPersonas')

      // Ensure that the first persona is active
      commit('setActivePersonaIndex', 0)

      // If there are no personas, add a default one that the user can edit
      if (!dbPersonas.length) {
        dispatch('createDefaultPersona', db)
      }
    })
  },
  createDefaultPersona ({ commit }, db) {
    const defaultPersona = {
      _id: uuid(),
      name: 'Personal',
      shortName: 'P',
      color: '#25B76D',
      order: 1,
      bookmarks: []
    }
    db.insert(defaultPersona, (err, dbPersona) => {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('setPersonas', [ dbPersona ])
      commit('setActivePersonaIndex', 0)
    })
  },
  movePersonaUpAndSave ({ commit }, data) {
    const db = data.db
    const personas = data.personas
    const index = data.index
    commit('movePersonaUp', index)
    commit('sanitizePersonaOrders')
    personas.forEach((p) => {
      db.update({ _id: p._id }, p, {}, (err, numReplaced) => {
        if (err) {
          alert('ERROR: ' + err)
        }
      })
    })
  },
  movePersonaDownAndSave ({ commit }, data) {
    const db = data.db
    const personas = data.personas
    const index = data.index
    commit('movePersonaDown', index)
    commit('sanitizePersonaOrders')
    personas.forEach((p) => {
      db.update({ _id: p._id }, p, {}, (err, numReplaced) => {
        if (err) {
          alert('ERROR: ' + err)
        }
      })
    })
  },
  addPersona ({ commit }, data) {
    const db = data.db
    const personas = data.personas
    // Create a new persona object to be edited
    const personaToEdit = {
      _id: uuid(),
      order: personas.length + 1,
      name: null,
      shortName: null,
      color: null,
      bookmarks: []
    }
    const showForm = create(PersonaDialog)
    showForm({ persona: personaToEdit, adding: true }).transition()
      .then((result) => {
        if (result) {
          db.insert(personaToEdit, (err, dbPersona) => {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            commit('addHomeTab', personaToEdit)
            commit('insertPersona', personaToEdit)
            commit('sortPersonas')
          })
        }
      })
  },
  editPersona ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new persona object to be edited
    const personaToEdit = {
      _id: persona._id,
      order: persona.order,
      name: persona.name,
      shortName: persona.shortName,
      color: persona.color,
      bookmarks: persona.bookmarks
    }
    const showForm = create(PersonaDialog)
    showForm({ persona: personaToEdit }).transition()
      .then((result) => {
        if (result) {
          // Update the persona's fields
          const personaDetails = {
            persona,
            name: personaToEdit.name,
            shortName: personaToEdit.shortName,
            color: personaToEdit.color
          }
          commit('setPersonaDetails', personaDetails)
          dispatch('savePersona', { db, persona })
        }
      })
  },
  async deletePersona ({ commit }, data) {
    const db = data.db
    const persona = data.persona
    const dialog = create(ConfirmDialog)
    const okResult = await dialog({ content: 'Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.' }).transition()
    if (okResult) {
      const okResult2 = await dialog({ content: 'Are you really sure you want to delete this persona?' }).transition()
      if (okResult2) {
        db.remove({ _id: persona._id }, {}, (err, numReplaced) => {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          commit('removePersona', persona)
        })
      }
    }
  },
  savePersona ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const persona = data.persona
      // Save only the fields that we are interested in
      const personaToSave = {
        _id: persona._id,
        order: persona.order,
        name: persona.name,
        shortName: persona.shortName,
        color: persona.color,
        bookmarks: persona.bookmarks.map((bookmark) => {
          return {
            _id: bookmark._id,
            url: bookmark.url,
            title: bookmark.title,
            icon: bookmark.icon,
            order: bookmark.order
          }
        })
      }
      db.update({ _id: personaToSave._id }, personaToSave, {}, (err, numReplaced) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        commit('sortPersonas')
        resolve()
      })
    })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
