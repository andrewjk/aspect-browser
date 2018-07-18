// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const state = {
  personas: [],
  settings: {},
  activity: {},
  showPersonaModal: false,
  personaToUpdate: null,
  personaToEdit: null,
  showBookmarkModal: false,
  bookmarkToUpdate: null,
  bookmarkToEdit: null,
  showSettingsModal: false,
  settingsToUpdate: null,
  settingsToEdit: null,
  zoomLevel: 0,
  showFindInPage: false,
  focusFindInPage: false
}

const getters = {
  getActivePersona (state) {
    return state.personas.find(function (p) {
      return p.isActive
    })
  },
  getActiveTab (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      return tabs.find(function (t) {
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
    state.personas = personas
  },
  setActiveIndex (state, index) {
    if (index < 0 || index >= state.personas.length) {
      return
    }
    state.personas.forEach(function (p, i) {
      if (p.isActive && i === index && state.activity[p._id]) {
        // If it's already the active item, go to the home page
        const tabs = state.activity[p._id].tabs
        const activeTab = tabs.find(function (t) {
          return t.isActive
        })
        if (activeTab) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          activeTab.backHistory.push({
            url: activeTab.url,
            title: activeTab.title
          })
          activeTab.forwardHistory = []
          activeTab.url = null
          activeTab.addressText = null
          activeTab.title = 'Home'
        }
      }
      p.isActive = (i === index)
    })
  },
  setActiveTabIndex (state, index) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      if (index < 0 || index >= tabs.length) {
        return
      }
      tabs.forEach(function (t, i) {
        t.isActive = (i === index)
      })
      state.showFindInPage = false
    }
  },
  sortPersonas (state) {
    state.personas = state.personas.sort(sorter)
  },
  addHomeTab (state, persona) {
    state.activity[persona._id] = {
      tabs: [
        {
          _id: uuid(),
          url: null,
          addressText: null,
          title: 'Home',
          icon: null,
          isActive: true,
          isLoading: false,
          backHistory: [],
          forwardHistory: []
        }
      ]
    }
  },
  nextPersona (state) {
    let index
    for (let i = 0; i < state.personas.length; i++) {
      if (state.personas[i].isActive) {
        index = i
      }
    }
    const newIndex = index < state.personas.length - 1 ? index + 1 : 0
    state.personas.forEach(function (p, i) {
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
    state.personas.forEach(function (p, i) {
      p.isActive = (i === newIndex)
    })
  },
  nextTab (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      const newIndex = index < tabs.length - 1 ? index + 1 : 0
      tabs.forEach(function (t, i) {
        t.isActive = (i === newIndex)
      })
    }
  },
  previousTab (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      const newIndex = index > 0 ? index - 1 : tabs.length - 1
      tabs.forEach(function (t, i) {
        t.isActive = (i === newIndex)
      })
    }
  },
  closeTab (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      tabs.splice(index, 1)
      if (!tabs.length) {
        // HACK: Don't feel great about duplicating this:
        state.activity[activePersona._id].tabs.push({
          _id: uuid(),
          url: null,
          addressText: null,
          title: 'Home',
          icon: null,
          isLoading: false,
          backHistory: [],
          forwardHistory: []
        })
      }
      const newIndex = Math.min(index, tabs.length - 1)
      tabs.forEach(function (t, i) {
        t.isActive = (i === newIndex)
      })
    }
  },
  openNewTab (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      tabs.push({
        _id: uuid(),
        url: null,
        addressText: null,
        title: 'Home',
        icon: null,
        isActive: true,
        isLoading: false,
        backHistory: [],
        forwardHistory: []
      })
      const newIndex = tabs.length - 1
      tabs.forEach(function (t, i) {
        t.isActive = (i === newIndex)
      })
      // TODO:
      // const box = document.getElementById('address-text-' + activePersona._id)
      // box.focus()
    }
  },
  openInTab (state, data) {
    const url = data.url
    const background = data.background
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      const tabs = state.activity[activePersona._id].tabs
      tabs.push({
        _id: uuid(),
        url: url,
        addressText: url,
        title: url.replace(/http[s]*:\/\/[www.]*/, ''),
        icon: null,
        isActive: false,
        isLoading: false,
        backHistory: [],
        forwardHistory: []
      })
      if (!background) {
        const newIndex = tabs.length - 1
        tabs.forEach(function (t, i) {
          t.isActive = (i === newIndex)
        })
      }
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
  addPersona (state) {
    // Create a new persona object to be edited
    state.personaToUpdate = null
    state.personaToEdit = {
      _id: uuid(),
      name: null,
      order: state.personas.length + 1,
      isActive: true,
      bookmarks: []
    }
    state.showPersonaModal = true
  },
  editPersona (state, index) {
    // Create a new persona object to be edited
    const persona = state.personas[index]
    state.personaToUpdate = persona
    state.personaToEdit = {
      _id: persona._id,
      name: persona.name,
      shortName: persona.shortName,
      color: persona.color
    }
    state.showPersonaModal = true
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
    state.personas.forEach(function (p, i) {
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
    state.personas.forEach(function (p, i) {
      p.isActive = (i === newIndex)
    })
  },
  closePersonaModal (state) {
    // Close the modal
    state.personaToUpdate = null
    state.personaToEdit = null
    state.showPersonaModal = false
  },
  // =========
  // BOOKMARKS
  // =========
  moveBookmarkUp (state, data) {
    const persona = state.personas.find(function (p) {
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
    const persona = state.personas.find(function (p) {
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
    const persona = state.personas.find(function (p) {
      return p._id === data.persona._id
    })
    // Renumber everything, just in case something funny has gone on
    persona.bookmarks.sort(sorter)
    for (var i = 0; i < persona.bookmarks.length; i++) {
      persona.bookmarks[i].order = i + 1
    }
  },
  sortBookmarks (state) {
    const activePersona = state.personas.find(function (p) {
      return p.isActive
    })
    if (activePersona) {
      activePersona.bookmarks = activePersona.bookmarks.sort(sorter)
    }
  },
  addBookmark (state, data) {
    const persona = data.persona
    // Create a new bookmark object to be edited
    state.bookmarkToUpdate = null
    state.bookmarkToEdit = {
      _id: uuid(),
      url: data.url,
      title: data.title,
      icon: data.icon,
      order: persona.bookmarks.length + 1,
      isActive: true
    }
    state.showBookmarkModal = true
  },
  editBookmark (state, data) {
    // Create a new bookmark object to be edited
    const persona = data.persona
    const index = data.index
    const bookmark = persona.bookmarks[index]
    state.bookmarkToUpdate = bookmark
    state.bookmarkToEdit = {
      _id: bookmark._id,
      title: bookmark.title,
      color: bookmark.color
    }
    state.showBookmarkModal = true
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
    persona.bookmarks.forEach(function (p, i) {
      p.isActive = (i === newIndex)
    })
  },
  removeBookmark (state, data) {
    const persona = data.persona
    const bookmark = data.bookmark
    const index = persona.bookmarks.indexOf(bookmark)
    persona.bookmarks.splice(index, 1)
    const newIndex = Math.min(index, persona.bookmarks.length - 1)
    persona.bookmarks.forEach(function (p, i) {
      p.isActive = (i === newIndex)
    })
  },
  closeBookmarkModal (state) {
    // Close the modal
    state.bookmarkToUpdate = null
    state.bookmarkToEdit = null
    state.showBookmarkModal = false
  },
  // ====
  // TABS
  // ====
  setTabDetails (state, data) {
    const persona = data.persona
    const tab = data.tab
    state.activity[persona._id].tabs.forEach(function (t) {
      if (t._id === tab._id) {
        if (data.webview !== undefined) t.webview = data.webview
        if (data.url !== undefined) t.url = data.url
        if (data.addressText !== undefined) t.addressText = data.addressText
        if (data.title !== undefined) t.title = data.title
        if (data.icon !== undefined) t.icon = data.icon
        if (data.isLoading !== undefined) t.isLoading = data.isLoading
      }
    })
  },
  // ========
  // ACTIVITY
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
    state.activity[persona._id].tabs.forEach(function (t) {
      if (t._id === tab._id) {
        if (t.backHistory.length) {
          t.forwardHistory.push({
            url: t.url,
            title: t.title
          })
          const url = t.backHistory.pop().url
          t.addressText = url
          t.haveGoneBack = true
          if (!url) {
            t.url = null
            t.title = 'Home'
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
    state.activity[persona._id].tabs.forEach(function (t) {
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
          if (!url) {
            t.url = null
            t.title = 'Home'
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

    if (url.indexOf('.') !== -1 && url.indexOf(' ') === -1) {
      // If it has a dot and no spaces, treat it as a URL
      // Might need to add http:// on the front there
      if (!/http[s]*:\/\//.test(url)) {
        url = 'https://' + url
      }
    } else {
      // Search for whatever was typed in
      url = state.settings.searchProvider.replace('{0}', url)
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
    tab.url = null
    tab.addressText = null
    tab.title = 'Home'
    tab.webview = null
  },
  // ========
  // SETTINGS
  // ========
  setSettings (state, settings) {
    state.settings = settings
  },
  editSettings (state) {
    // Create a new settings object to be edited
    const settings = state.settings
    state.settingsToUpdate = settings
    state.settingsToEdit = {
      _id: settings._id,
      searchProvider: settings.searchProvider
    }
    state.showSettingsModal = true
  },
  setSettingsDetails (state, data) {
    const settings = data.settings
    if (data.searchProvider !== undefined) settings.searchProvider = data.searchProvider
  },
  closeSettingsModal (state) {
    // Close the modal
    state.settingsToUpdate = null
    state.settingsToEdit = null
    state.showSettingsModal = false
  }
}

const actions = {
  // ========
  // PERSONAS
  // ========
  loadPersonas ({ commit, dispatch }, db) {
    db.find({}).sort({ order: 1 }).exec(function (err, dbPersonas) {
      if (err) {
        alert('ERROR: ' + err)
        return
      }

      commit('setPersonas', dbPersonas)

      // HACK: The sort function doesn't seem to work?
      commit('sortPersonas')

      // Ensure that the first persona is active
      commit('setActiveIndex', 0)

      // Create a home tab for each persona
      dbPersonas.forEach(function (item, i) {
        commit('addHomeTab', item)
      })

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
      color: '#009E49',
      order: 1,
      isActive: true,
      bookmarks: []
    }
    commit('addHomeTab', defaultPersona)
    db.insert(defaultPersona, function (err, dbPersona) {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('setPersonas', [ dbPersona ])
    })
  },
  movePersonaUpAndSave ({ commit }, data) {
    const db = data.db
    const personas = data.personas
    const index = data.index
    commit('movePersonaUp', index)
    commit('sanitizePersonaOrders')
    personas.forEach(function (p) {
      db.update({ _id: p._id }, p, {}, function (err, numReplaced) {
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
    personas.forEach(function (p) {
      db.update({ _id: p._id }, p, {}, function (err, numReplaced) {
        if (err) {
          alert('ERROR: ' + err)
        }
      })
    })
  },
  commitPersonaEdit ({ commit }, data) {
    const db = data.db
    const personaToUpdate = data.personaToUpdate
    const personaToEdit = data.personaToEdit
    if (personaToUpdate) {
      commit('setPersonaDetails', { persona: personaToUpdate, name: personaToEdit.name, shortName: personaToEdit.shortName, color: personaToEdit.color })
      db.update({ _id: personaToUpdate._id }, personaToUpdate, {}, function (err, numReplaced) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        commit('sortPersonas')
        commit('closePersonaModal')
      })
    } else {
      commit('addHomeTab', personaToEdit)
      db.insert(personaToEdit, function (err, dbPersona) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        commit('insertPersona', personaToEdit)
        commit('sortPersonas')
        commit('closePersonaModal')
      })
    }
  },
  deletePersona ({ commit }, data) {
    if (confirm('Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.') && confirm('Are you really sure you want to delete this persona?')) {
      const db = data.db
      const persona = data.personaToUpdate
      db.remove({ _id: persona._id }, {}, function (err, numReplaced) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        commit('removePersona', persona)
        commit('closePersonaModal')
      })
    }
  },
  // =========
  // BOOKMARKS
  // =========
  moveBookmarkUpAndSave ({ commit }, data) {
    const db = data.db
    const persona = data.persona
    const index = data.index
    commit('moveBookmarkUp', { persona, index })
    commit('sanitizeBookmarkOrders', { persona })
    db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  moveBookmarkDownAndSave ({ commit }, data) {
    const db = data.db
    const persona = data.persona
    const index = data.index
    commit('moveBookmarkDown', { persona, index })
    commit('sanitizeBookmarkOrders', { persona })
    db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
      if (err) {
        alert('ERROR: ' + err)
      }
    })
  },
  commitBookmarkEdit ({ commit }, data) {
    const db = data.db
    const persona = data.persona
    const bookmarkToUpdate = data.bookmarkToUpdate
    const bookmarkToEdit = data.bookmarkToEdit
    if (bookmarkToUpdate) {
      commit('setBookmarkDetails', { bookmark: bookmarkToUpdate, title: bookmarkToEdit.title })
    } else {
      commit('insertBookmark', { persona, bookmark: bookmarkToEdit })
    }
    commit('sortBookmarks', persona)
    db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('closeBookmarkModal')
    })
  },
  deleteBookmark ({ commit }, data) {
    if (confirm('Are you sure you want to delete this bookmark? This will delete all bookmarks and saved data associated with it.') && confirm('Are you really sure you want to delete this bookmark?')) {
      const db = data.db
      const persona = data.persona
      const bookmark = data.bookmarkToUpdate
      commit('removeBookmark', { persona, bookmark })
      commit('sortBookmarks', persona)
      db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }
        commit('closeBookmarkModal')
      })
    }
  },
  // ========
  // ACTIVITY
  // ========
  // ========
  // SETTINGS
  // ========
  loadSettings ({ commit, dispatch }, db) {
    db.find({}).exec(function (err, dbSettings) {
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
      searchProvider: 'https://duckduckgo.com/?q={0}'
    }
    db.insert(defaultSettings, function (err, dbSettings) {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('setSettings', dbSettings)
    })
  },
  commitSettingsEdit ({ commit }, data) {
    const db = data.db
    const settingsToUpdate = data.settingsToUpdate
    const settingsToEdit = data.settingsToEdit
    commit('setSettingsDetails', { settings: settingsToUpdate, searchProvider: settingsToEdit.searchProvider })
    db.update({ _id: settingsToUpdate._id }, settingsToUpdate, {}, function (err, numReplaced) {
      if (err) {
        alert('ERROR: ' + err)
        return
      }
      commit('closeSettingsModal')
    })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
