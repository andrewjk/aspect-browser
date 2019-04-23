
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import BookmarkDialog from '../../components/Dialogs/BookmarkDialog'

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
    if (data.url !== undefined) bookmark.url = data.url
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
  }
}

const actions = {
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
      title: bookmark.title,
      url: bookmark.url
    }
    const showForm = create(BookmarkDialog)
    showForm({ bookmark: bookmarkToEdit, persona }).transition()
      .then((result) => {
        if (result) {
          commit('setBookmarkDetails', { bookmark, title: bookmarkToEdit.title, url: bookmarkToEdit.url })
          commit('sortBookmarks', persona)
          dispatch('savePersona', { db, persona })
        }
      })
  },
  async deleteBookmark ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const bookmark = data.bookmark
    return new Promise(async (resolve, reject) => {
      const dialog = create(ConfirmDialog)
      const okResult = await dialog({ content: 'Are you sure you want to delete this bookmark? This will delete all saved data associated with it.' }).transition()
      if (okResult) {
        const okResult2 = await dialog({ content: 'Are you really sure you want to delete this bookmark?' }).transition()
        if (okResult2) {
          commit('removeBookmark', { persona, bookmark })
          commit('sortBookmarks', persona)
          dispatch('savePersona', { db, persona }).then(() => {
            resolve()
          })
        }
      }
    })
  }
}

export default {
  mutations,
  actions
}
