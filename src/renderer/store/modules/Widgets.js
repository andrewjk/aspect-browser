
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import WidgetDialog from '../../components/Dialogs/ClockWidgetDialog'

const mutations = {
  setWidgetDetails (state, data) {
    const widget = data.widget
    if (data.name !== undefined) widget.name = data.name
    if (data.timezone !== undefined) widget.timezone = data.timezone
  },
  insertWidget (state, data) {
    const persona = data.persona
    const widget = data.widget
    persona.widgets.push(widget)
  },
  removeWidget (state, data) {
    const persona = data.persona
    const widget = data.widget
    const index = persona.widgets.indexOf(widget)
    persona.widgets.splice(index, 1)
  }
}

const actions = {
  async addWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: uuid(),
      name: data.name,
      timezone: data.timezone,
      position: data.position,
      order: persona.widgets.length + 1,
      isActive: true
    }
    const showForm = create(WidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona, adding: true }).transition()
    if (result) {
      commit('insertWidget', { persona, widget: widgetToEdit })
      dispatch('savePersona', { db, persona })
    }
  },
  async editWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: widget._id,
      name: widget.name,
      timezone: widget.timezone
    }
    const showForm = create(WidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona }).transition()
    if (result) {
      commit('setWidgetDetails', { widget, timezone: widgetToEdit.timezone, name: widgetToEdit.name })
      dispatch('savePersona', { db, persona })
    }
  },
  async deleteWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    return new Promise(async (resolve, reject) => {
      const dialog = create(ConfirmDialog)
      const okResult = await dialog({ content: 'Are you sure you want to delete this widget?' }).transition()
      if (okResult) {
        commit('removeWidget', { persona, widget })
        dispatch('savePersona', { db, persona }).then(() => {
          resolve()
        })
      }
    })
  }
}

export default {
  mutations,
  actions
}
