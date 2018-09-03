// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'
import { create } from 'vue-modal-dialogs'

import AlertDialog from '../../components/LandingPage/AlertDialog'
import ConfirmDialog from '../../components/LandingPage/ConfirmDialog'
import PersonaDialog from '../../components/LandingPage/PersonaDialog'
import BookmarkDialog from '../../components/LandingPage/BookmarkDialog'

const state = {
  personas: [],
  showFindInPage: false,
  focusFindInPage: false
}

const getters = {
  getActivePersona (state) {
    return state.personas.find((p) => {
      return p.isActive
    })
  },
  getActiveTab (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      return tabs.find((t) => {
        return t.isActive
      })
    }
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
  // ========
  // PERSONAS
  // ========
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
            backHistory: [],
            forwardHistory: []
          }
        ],
        closedTabs: []
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
  setActiveTabIndex (state, index) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      if (index < 0 || index >= tabs.length) {
        return
      }
      tabs.forEach((t, i) => {
        t.isActive = (i === index)
      })
      state.showFindInPage = false
    }
  },
  sortPersonas (state) {
    state.personas = state.personas.sort(sorter)
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
        backHistory: [],
        forwardHistory: []
      }
    ]
    persona.closedTabs = []
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
  nextTab (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      const newIndex = index < tabs.length - 1 ? index + 1 : 0
      tabs.forEach((t, i) => {
        t.isActive = (i === newIndex)
      })
    }
  },
  previousTab (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      const newIndex = index > 0 ? index - 1 : tabs.length - 1
      tabs.forEach((t, i) => {
        t.isActive = (i === newIndex)
      })
    }
  },
  closeTab (state, index) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      if (index === undefined) {
        for (let i = 0; i < activePersona.tabs.length; i++) {
          if (activePersona.tabs[i].isActive) {
            index = i
            break
          }
        }
      }
      const closingTab = activePersona.tabs[index]
      closingTab.index = index
      activePersona.closedTabs.push(closingTab)
      while (activePersona.closedTabs.length > 20) {
        activePersona.closedTabs.splice(0, 1)
      }
      if (activePersona.tabs.length > 1) {
        activePersona.tabs.splice(index, 1)
        const newIndex = Math.min(index, activePersona.tabs.length - 1)
        activePersona.tabs.forEach((tab, i) => {
          tab.isActive = (i === newIndex)
        })
      } else {
        // HACK: Don't feel great about duplicating this:
        closingTab.url = 'aspect://home'
        closingTab.addressText = null
        closingTab.title = 'Home'
        closingTab.icon = null
        closingTab.isActive = true
        closingTab.isLoading = false
        closingTab.backHistory = []
        closingTab.forwardHistory = []
        closingTab.webview = null
        state.showFindInPage = false
      }
      activePersona.hasOpenTab = activePersona.tabs.some((tab) => {
        return tab.url
      })
      // TODO: Update the tab indexes
    }
  },
  reopenTab (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      if (activePersona.closedTabs && activePersona.closedTabs.length) {
        const closedTab = activePersona.closedTabs.pop()
        const newIndex = Math.min(closedTab.index, activePersona.tabs.length)
        activePersona.tabs.splice(newIndex, 0, closedTab)
        // TODO: Need to reorganise the other tab indexes
        closedTab.index = newIndex
        activePersona.tabs.forEach((t, i) => {
          t.isActive = (i === newIndex)
        })
      }
    }
  },
  openNewTab (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      tabs.push({
        _id: uuid(),
        url: 'aspect://home',
        addressText: null,
        title: 'Home',
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
  openInTab (state, data) {
    const url = data.url
    const background = data.background
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      tabs.push({
        _id: uuid(),
        url: url,
        addressText: url,
        title: url.replace(/http[s]*:\/\/[www.]*/, ''),
        index: tabs.length,
        icon: null,
        isActive: false,
        isLoading: false,
        backHistory: [],
        forwardHistory: []
      })
      if (!background) {
        const newIndex = tabs.length - 1
        tabs.forEach((t, i) => {
          t.isActive = (i === newIndex)
        })
      }
      activePersona.hasOpenTab = tabs.some((tab) => {
        return tab.url
      })
    }
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
        title: url.replace(/http[s]*:\/\/[www.]*/, ''),
        index: tabs.length,
        icon: null,
        isActive: false,
        isLoading: false,
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
  },
  // =========
  // BOOKMARKS
  // =========
  moveBookmarkUp (state, data) {
    const persona = state.personas.find((p) => {
      return p._id === data.persona._id
    })
    const index = data.index
    if (index === 0) {
      return
    }
    // Swap this bookmark's order with the previous bookmark's order
    const thisOrder = persona.bookmarks[index].order
    const prevOrder = persona.bookmarks[index - 1].order
    persona.bookmarks[index].order = prevOrder
    persona.bookmarks[index - 1].order = thisOrder
  },
  moveBookmarkDown (state, data) {
    const persona = state.personas.find((p) => {
      return p._id === data.persona._id
    })
    const index = data.index
    if (index === persona.bookmarks.length - 1) {
      return
    }
    // Swap this bookmark's order with the next bookmark's order
    const thisOrder = persona.bookmarks[index].order
    const nextOrder = persona.bookmarks[index + 1].order
    persona.bookmarks[index].order = nextOrder
    persona.bookmarks[index + 1].order = thisOrder
  },
  sanitizeBookmarkOrders (state, data) {
    const persona = state.personas.find((p) => {
      return p._id === data.persona._id
    })
    // Renumber everything, just in case something funny has gone on
    persona.bookmarks.sort(sorter)
    for (var i = 0; i < persona.bookmarks.length; i++) {
      persona.bookmarks[i].order = i + 1
    }
  },
  sortBookmarks (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      activePersona.bookmarks = activePersona.bookmarks.sort(sorter)
    }
  },
  setBookmarkDetails (state, data) {
    const bookmark = data.bookmark
    if (data.title !== undefined) bookmark.title = data.title
  },
  insertBookmark (state, data) {
    const persona = data.persona
    const bookmark = data.bookmark
    persona.bookmarks.push(bookmark)
    const newIndex = persona.bookmarks.length - 1
    persona.bookmarks.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  },
  removeBookmark (state, data) {
    const persona = data.persona
    const bookmark = data.bookmark
    const index = persona.bookmarks.indexOf(bookmark)
    persona.bookmarks.splice(index, 1)
    const newIndex = Math.min(index, persona.bookmarks.length - 1)
    persona.bookmarks.forEach((p, i) => {
      p.isActive = (i === newIndex)
    })
  },
  // ====
  // TABS
  // ====
  setTabDetails (state, data) {
    const persona = data.persona
    const tab = data.tab
    state.personas.forEach((p) => {
      if (p._id === persona._id) {
        p.tabs.forEach((t) => {
          if (t._id === tab._id) {
            if (data.webview !== undefined) t.webview = data.webview
            if (data.url !== undefined) t.url = data.url
            if (data.addressText !== undefined) t.addressText = data.addressText
            if (data.title !== undefined) t.title = data.title
            if (data.icon !== undefined) t.icon = data.icon
            if (data.isLoading !== undefined) t.isLoading = data.isLoading
          }
        })
        p.hasOpenTab = p.tabs.some((tab) => {
          return tab.url
        })
      }
    })
  },
  // ========
  // HISTORY
  // ========
  addToHistory (state, data) {
    // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
    const tab = data.tab
    const url = data.url
    const title = data.title
    if (!tab.haveGoneBack) {
      tab.backHistory.push({
        url: url,
        title: title
      })
      tab.forwardHistory = []
    }
    tab.haveGoneBack = false
  },
  goBack (state, data) {
    const persona = data.persona
    const tab = data.tab
    persona.tabs.forEach((t) => {
      if (t._id === tab._id) {
        if (t.backHistory.length) {
          t.forwardHistory.push({
            url: t.url,
            title: t.title
          })
          const url = t.backHistory.pop().url
          t.addressText = url
          t.haveGoneBack = true
          if (url === 'aspect://home') {
            t.url = 'aspect://home'
            t.title = 'Home'
            t.webview = null
          } else if (url === 'aspect://history') {
            t.url = 'aspect://history'
            t.title = 'History'
            t.webview = null
          } else if (url === 'aspect://logins') {
            t.url = 'aspect://logins'
            t.title = 'Logins'
            t.webview = null
          } else if (t.webview) {
            t.webview.loadURL(url)
          } else {
            t.url = url
          }
        }
      }
    })
  },
  goForward (state, data) {
    const persona = data.persona
    const tab = data.tab
    persona.tabs.forEach((t) => {
      if (t._id === tab._id) {
        if (t.forwardHistory.length) {
          if (!t.forwardHistory) {
            t.forwardHistory = []
          }
          t.backHistory.push({
            url: t.url,
            title: t.title
          })
          const url = t.forwardHistory.pop().url
          t.addressText = url
          t.haveGoneBack = true
          if (url === 'aspect://home') {
            t.url = 'aspect://home'
            t.title = 'Home'
            t.webview = null
          } else if (url === 'aspect://history') {
            t.url = 'aspect://history'
            t.title = 'History'
            t.webview = null
          } else if (url === 'aspect://logins') {
            t.url = 'aspect://logins'
            t.title = 'Logins'
            t.webview = null
          } else if (t.webview) {
            t.webview.loadURL(url)
          } else {
            t.url = url
          }
        }
      }
    })
  },
  goToUrl (state, data) {
    const tab = data.tab
    let url = data.url
    const searchProvider = data.searchProvider

    if (url.indexOf('.') !== -1 && url.indexOf(' ') === -1) {
      // If it has a dot and no spaces, treat it as a URL
      // Might need to add http:// on the front there
      if (!/http[s]*:\/\//.test(url)) {
        url = 'https://' + url
      }
    } else {
      // Search for whatever was typed in
      url = searchProvider.replace('{0}', url)
    }
    tab.addressText = url

    tab.forwardHistory = []
    tab.backHistory.push({
      url: tab.url,
      title: tab.title
    })

    if (tab.webview) {
      tab.webview.loadURL(url)
    } else {
      tab.url = url
    }
  },
  goHome (state, tab) {
    if (!tab.backHistory) {
      tab.backHistory = []
    }
    tab.backHistory.push({
      url: tab.url,
      title: tab.title
    })
    tab.forwardHistory = []
    tab.url = 'aspect://home'
    tab.addressText = null
    tab.title = 'Home'
    tab.webview = null
  },
  showHistory (state) {
    const activePersona = state.personas.find((p) => {
      return p.isActive
    })
    if (activePersona) {
      const tabs = activePersona.tabs
      tabs.push({
        _id: uuid(),
        url: 'aspect://history',
        addressText: null,
        title: 'History',
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
  // ====
  // FIND
  // ====
  openFindInPage (state, data) {
    state.showFindInPage = true
    state.focusFindInPage = true
  },
  closeFindInPage (state, data) {
    state.showFindInPage = false
  },
  unfocusFindInPage (state, data) {
    state.focusFindInPage = false
  }
}

const actions = {
  // ========
  // PERSONAS
  // ========
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
  deletePersona ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const persona = data.persona
      const dialog = create(ConfirmDialog)
      dialog({ content: 'Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.' }).transition()
        .then((result) => {
          if (result) {
            dialog({ content: 'Are you really sure you want to delete this persona?' }).transition()
              .then((result) => {
                if (result) {
                  db.remove({ _id: persona._id }, {}, (err, numReplaced) => {
                    if (err) {
                      alert('ERROR: ' + err)
                      return
                    }
                    commit('removePersona', persona)
                    resolve()
                  })
                }
              })
              .catch((err) => {
                alert('ERROR: ' + err)
              })
          }
        })
        .catch((err) => {
          alert('ERROR: ' + err)
        })
    })
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
  },
  // =========
  // BOOKMARKS
  // =========
  moveBookmarkUpAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const index = data.index
    commit('moveBookmarkUp', { persona, index })
    commit('sanitizeBookmarkOrders', { persona })
    dispatch('savePersona', { db, persona })
  },
  moveBookmarkDownAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const index = data.index
    commit('moveBookmarkDown', { persona, index })
    commit('sanitizeBookmarkOrders', { persona })
    dispatch('savePersona', { db, persona })
  },
  addBookmark ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new bookmark object to be edited
    const bookmarkToEdit = {
      _id: uuid(),
      url: data.url,
      title: data.title,
      icon: data.icon,
      order: persona.bookmarks.length + 1,
      isActive: true
    }
    const showForm = create(BookmarkDialog)
    showForm({ bookmark: bookmarkToEdit, persona, adding: true }).transition()
      .then((result) => {
        if (result) {
          commit('insertBookmark', { persona, bookmark: bookmarkToEdit })
          commit('sortBookmarks', persona)
          dispatch('savePersona', { db, persona })
        }
      })
  },
  editBookmark ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const index = data.index
    const bookmark = persona.bookmarks[index]
    // Create a new bookmark object to be edited
    const bookmarkToEdit = {
      _id: bookmark._id,
      title: bookmark.title
    }
    const showForm = create(BookmarkDialog)
    showForm({ bookmark: bookmarkToEdit, persona }).transition()
      .then((result) => {
        if (result) {
          commit('setBookmarkDetails', { bookmark, title: bookmarkToEdit.title })
          commit('sortBookmarks', persona)
          dispatch('savePersona', { db, persona })
        }
      })
  },
  deleteBookmark ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const bookmark = data.bookmark
    return new Promise((resolve, reject) => {
      const dialog = create(ConfirmDialog)
      dialog({ content: 'Are you sure you want to delete this bookmark? This will delete all saved data associated with it.' }).transition()
        .then((result) => {
          if (result) {
            dialog({ content: 'Are you really sure you want to delete this bookmark?' }).transition()
              .then((result) => {
                if (result) {
                  commit('removeBookmark', { persona, bookmark })
                  commit('sortBookmarks', persona)
                  dispatch('savePersona', { db, persona }).then(() => {
                    resolve()
                  })
                }
              })
              .catch((err) => {
                alert('ERROR: ' + err)
              })
          }
        })
        .catch((err) => {
          alert('ERROR: ' + err)
        })
    })
  },
  // =======
  // HISTORY
  // =======
  loadHistory ({ commit, dispatch }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      const personaId = data.personaId
      const search = data.search
      const skip = data.skip
      const limit = data.limit
      db.find({ $and: [{ personaId }, search ? { $or: [{ title: new RegExp(search, 'gi') }, { url: new RegExp(search, 'gi') }] } : {}] }).sort({ dateTime: -1 }).skip(skip).limit(limit).exec((err, dbHistory) => {
        if (err) {
          reject(err)
        } else {
          resolve(dbHistory)
        }
      })
    })
  },
  saveToHistory ({ commit }, data) {
    const db = data.db
    const history = {
      personaId: data.personaId,
      url: data.url,
      icon: data.icon,
      title: data.title,
      dateTime: new Date()
    }
    db.insert(history, (err, dbHistory) => {
      if (err) {
        alert('ERROR: ' + err)
        // return
      }
    })
  },
  deleteHistory ({ commit }, data) {
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
  clearHistory ({ commit }, data) {
    const dialog = create(ConfirmDialog)
    dialog({ content: 'Are you sure you want to clear the browsing history for this persona?' }).transition()
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
            // Also delete history activity
            adb.remove({ personaId, isPreviousSession: true }, { multi: true }, (err, numRemoved) => {
              if (err) {
                alert('ERROR: ' + err)
              } else {
                const dialog = create(AlertDialog)
                dialog({ content: 'Browsing history cleared.' }).transition()
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
  clearAllHistory ({ commit }, data) {
    const dialog = create(ConfirmDialog)
    dialog({ content: 'Are you sure you want to clear the browsing history for all personas?' }).transition()
      .then((result) => {
        if (result) {
          const db = data.db
          db.remove({}, { multi: true }, (err, numReplaced) => {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            const dialog = create(AlertDialog)
            dialog({ content: 'Browsing history cleared.' }).transition()
              .catch((err) => {
                alert('ERROR: ' + err)
              })
          })
        }
      })
      .catch((err) => {
        alert('ERROR: ' + err)
      })
  },
  // ========
  // ACTIVITY
  // ========
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
  restoreSession ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.find({ isPreviousSession: true }).sort({ index: 1 }).exec((err, dbActivity) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        dbActivity.forEach((item) => {
          // TODO: Set icon and title and don't load until clicked
          commit('openInPersona', { url: item.url, personaId: item.personaId })
        })
      })
    })
  },
  saveSession ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.find({ isCurrentSession: true }).sort({ index: 1 }).exec((err, dbActivity) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        dbActivity.forEach((item) => {
          const activity = {
            _id: uuid(),
            personaId: item.personaId,
            url: item.url,
            icon: item.icon,
            title: item.title,
            index: item.index,
            name: data.name
          }
          db.insert(activity, (err, dbActivity) => {
            if (err) {
              reject(err)
            }
          })
        })
      })
    })
  },
  loadSession ({ commit }, data) {
    return new Promise((resolve, reject) => {
      const db = data.db
      db.find({ name: data.name }).sort({ index: 1 }).exec((err, dbActivity) => {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        dbActivity.forEach((item) => {
          // TODO: Set icon and title and don't load until clicked
          commit('openInPersona', { url: item.url, personaId: item.personaId })
        })
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
