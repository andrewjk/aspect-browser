// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

const getters = {
  getActiveTab (state, getters, rootState) {
    const personas = rootState.Personas.personas
    const activePersona = personas.find((p) => {
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

const mutations = {
  sortTabs (state, data) {
    const persona = data.persona
    persona.tabs.forEach((tab, idx) => {
      tab.index = idx
    })
  },
  setTabDetails (state, data) {
    const tab = data.tab
    if (data.webview !== undefined) tab.webview = data.webview
    if (data.url !== undefined) tab.url = data.url
    if (data.addressText !== undefined) tab.addressText = data.addressText
    if (data.title !== undefined) tab.title = data.title
    if (data.icon !== undefined) tab.icon = data.icon
    if (data.index !== undefined) tab.index = data.index
    if (data.isActive !== undefined) tab.isActive = data.isActive
    if (data.isLoading !== undefined) tab.isLoading = data.isLoading
    if (data.isSuspended !== undefined) tab.isSuspended = data.isSuspended
    if (data.suspensionTimer !== undefined) tab.suspensionTimer = data.suspensionTimer
    if (data.errorCode !== undefined) tab.errorCode = data.errorCode
    if (data.errorDescription !== undefined) tab.errorDescription = data.errorDescription
    if (data.newTabOffset !== undefined) tab.newTabOffset = data.newTabOffset
  },
  addTab (state, data) {
    const persona = data.persona
    persona.tabs.push({
      _id: uuid(),
      url: data.url !== undefined ? data.url : 'aspect://home',
      addressText: data.addressText !== undefined ? data.addressText : null,
      title: data.title !== undefined ? data.title : 'Home',
      icon: data.icon !== undefined ? data.icon : null,
      index: data.index !== undefined ? data.index : persona.tabs.length,
      isActive: data.isActive !== undefined ? data.isActive : false,
      isLoading: data.isLoading !== undefined ? data.isLoading : false,
      isSuspended: data.isSuspended !== undefined ? data.isSuspended : false,
      suspensionTimer: data.suspensionTimer !== undefined ? data.suspensionTimer : null,
      backHistory: data.backHistory !== undefined ? data.backHistory : [],
      forwardHistory: data.forwardHistory !== undefined ? data.forwardHistory : []
    })
    persona.tabs.forEach((tab, idx) => {
      tab.index = idx
    })
  },
  insertTab (state, data) {
    const persona = data.persona
    const index = data.index
    persona.tabs.splice(index, 0, {
      _id: uuid(),
      url: data.url !== undefined ? data.url : 'aspect://home',
      addressText: data.addressText !== undefined ? data.addressText : null,
      title: data.title !== undefined ? data.title : 'Home',
      icon: data.icon !== undefined ? data.icon : null,
      index: data.index !== undefined ? data.index : persona.tabs.length,
      isActive: data.isActive !== undefined ? data.isActive : false,
      isLoading: data.isLoading !== undefined ? data.isLoading : false,
      isSuspended: data.isSuspended !== undefined ? data.isSuspended : false,
      suspensionTimer: data.suspensionTimer !== undefined ? data.suspensionTimer : null,
      backHistory: data.backHistory !== undefined ? data.backHistory : [],
      forwardHistory: data.forwardHistory !== undefined ? data.forwardHistory : []
    })
    persona.tabs.forEach((tab, idx) => {
      tab.index = idx
    })
  },
  removeTab (state, data) {
    const persona = data.persona
    const tab = data.tab
    const index = data.index
    persona.closedTabs.push(tab)
    while (persona.closedTabs.length > 20) {
      persona.closedTabs.splice(0, 1)
    }
    persona.tabs.splice(index, 1)
    persona.tabs.forEach((item, idx) => {
      item.index = idx
    })
  },
  reopenClosedTab (state, data) {
    const persona = data.persona
    const index = data.index
    const tab = persona.closedTabs.pop()
    tab.index = index
    persona.tabs.splice(index, 0, tab)
    persona.tabs.forEach((tab, idx) => {
      tab.index = idx
    })
  }
}

const actions = {
  setActiveTabIndexInPersona ({ commit }, data) {
    const persona = data.persona
    const index = data.index
    const tabs = persona.tabs
    if (index < 0 || index >= tabs.length) {
      return
    }
    // 5 minutes in development, 30 minutes in production
    const timeUntilSuspension = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 30 * 60 * 1000
    tabs.forEach((tab, i) => {
      if (tab.isActive && index !== null && i !== index) {
        // The tab becoming inactive needs a timer to set it to inactive
        console.log('adding timer to inactive tab: ' + tab.url)
        if (tab.suspensionTimer) {
          clearTimeout(tab.suspensionTimer)
        }
        const suspensionTimer = setTimeout(() => {
          console.log('suspending tab: ' + tab.url)
          commit('setTabDetails', { persona, tab, isSuspended: true, webview: null })
        }, timeUntilSuspension)
        commit('setTabDetails', { persona, tab, suspensionTimer })
      } else if (!tab.isActive && index !== null && i === index) {
        // The tab becoming active needs its timer reset and its URL set back to what it was, if necessary
        if (tab.isSuspended) {
          console.log('reloading tab: ' + tab.url)
        }
        if (tab.suspensionTimer) {
          clearTimeout(tab.suspensionTimer)
        }
        commit('setTabDetails', { persona, tab, isSuspended: false, suspensionTimer: null })
      } else if (!tab.isActive && !tab.suspensionTimer) {
        // Background tabs need timers straight away
        console.log('adding timer to background tab: ' + tab.url)
        const suspensionTimer = setTimeout(() => {
          console.log('suspending tab: ' + tab.url)
          commit('setTabDetails', { persona, tab, isSuspended: true, webview: null })
        }, timeUntilSuspension)
        commit('setTabDetails', { persona, tab, suspensionTimer })
      }
      if (index !== null) {
        commit('setTabDetails', { persona, tab, isActive: (i === index), newTabOffset: 0 })
      }
    })
    if (index !== null) {
      commit('closeFindInPage')
    }
  },
  setActiveTabIndex ({ getters, dispatch }, index) {
    const persona = getters.getActivePersona
    if (persona) {
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  nextTab ({ getters, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      const tabs = persona.tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      index = index < tabs.length - 1 ? index + 1 : 0
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  previousTab ({ getters, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      const tabs = persona.tabs
      let index
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].isActive) {
          index = i
          break
        }
      }
      index = index > 0 ? index - 1 : tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  closeTab ({ getters, commit, dispatch }, index) {
    const persona = getters.getActivePersona
    if (persona) {
      if (index === undefined) {
        for (let i = 0; i < persona.tabs.length; i++) {
          if (persona.tabs[i].isActive) {
            index = i
            break
          }
        }
      }
      const tab = persona.tabs[index]
      commit('setTabDetails', { persona, tab, index })
      commit('removeTab', { persona, tab, index })
      // If there are no more tabs, add the Home tab
      if (persona.tabs.length === 0) {
        commit('addTab', { persona })
      }
      index = Math.min(index, persona.tabs.length - 1)
      dispatch('setActiveTabIndexInPersona', { persona, index })
      commit('setOpenTabCount', persona)
    }
  },
  reopenTab ({ getters, commit, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      if (persona.closedTabs && persona.closedTabs.length) {
        const tab = persona.closedTabs[persona.closedTabs.length - 1]
        const index = Math.min(tab.index, persona.tabs.length)
        commit('reopenClosedTab', { persona, tab, index })
        dispatch('setActiveTabIndexInPersona', { persona, index })
      }
    }
  },
  openNewTab ({ getters, commit, dispatch }) {
    const persona = getters.getActivePersona
    if (persona) {
      commit('addTab', { persona })
      const index = persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index })
    }
  },
  openInTab ({ getters, commit, dispatch }, data) {
    const persona = getters.getActivePersona
    if (persona) {
      const url = data.url
      const title = url.replace(/http[s]*:\/\/(www\.)*/, '')
      const background = data.background
      if (background) {
        // Add the tab after the current active tab
        // But also after any background tabs that have been opened already
        const persona = getters.getActivePersona
        if (persona) {
          const tabs = persona.tabs
          let index
          for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].isActive) {
              const offset = tabs[i].newTabOffset || 0
              index = i + 1 + offset
              commit('setTabDetails', { persona, tab: tabs[i], newTabOffset: offset + 1 })
              break
            }
          }
          commit('insertTab', { persona, url, title, index })
        }
      } else {
        // Add the tab at the end
        commit('addTab', { persona, url, title })
      }
      // If it's a background tab, pass index = null to setActiveTabIndexInPersona to indicate that we shouldn't actually change to that tab
      const newIndex = background ? null : persona.tabs.length - 1
      dispatch('setActiveTabIndexInPersona', { persona, index: newIndex })
      commit('setOpenTabCount', persona)
    }
  }
}

export default {
  getters,
  mutations,
  actions
}
