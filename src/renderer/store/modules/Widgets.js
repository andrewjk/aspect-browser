
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import SelectWidgetDialog from '../../components/Dialogs/SelectWidgetDialog'
import ClockWidgetDialog from '../../components/Dialogs/ClockWidgetDialog'
import WeatherWidgetDialog from '../../components/Dialogs/WeatherWidgetDialog'

const mutations = {
  setWidgetDetails (state, data) {
    const widget = data.widget
    if (data.type !== undefined) widget.type = data.type
    if (data.name !== undefined) widget.name = data.name
    if (data.timezone !== undefined) widget.timezone = data.timezone
    if (data.units !== undefined) widget.units = data.units
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
    // Get the type of widget
    const showForm = create(SelectWidgetDialog)
    const result = await showForm().transition()
    if (result === 'clock') {
      dispatch('addClockWidget', data)
    } else if (result === 'weather') {
      dispatch('addWeatherWidget', data)
    }
  },
  async addClockWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: uuid(),
      type: 'clock',
      name: data.name,
      timezone: data.timezone,
      position: data.position,
      order: persona.widgets.length + 1,
      isActive: true
    }
    const showForm = create(ClockWidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona, adding: true }).transition()
    if (result) {
      commit('insertWidget', { persona, widget: widgetToEdit })
      dispatch('savePersona', { db, persona })
    }
  },
  async addWeatherWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: uuid(),
      type: 'weather',
      name: data.name,
      units: data.units || 'celsius',
      position: data.position,
      order: persona.widgets.length + 1,
      isActive: true
    }
    const showForm = create(WeatherWidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona, adding: true }).transition()
    if (result) {
      commit('insertWidget', { persona, widget: widgetToEdit })
      dispatch('savePersona', { db, persona })
    }
  },
  async editWidget ({ commit, dispatch }, data) {
    const widget = data.widget
    if (widget.type === 'clock') {
      dispatch('editClockWidget', data)
    } else if (widget.type === 'weather') {
      dispatch('editWeatherWidget', data)
    }
  },
  async editClockWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: widget._id,
      name: widget.name,
      timezone: widget.timezone
    }
    const showForm = create(ClockWidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona }).transition()
    if (result) {
      commit('setWidgetDetails', { widget, name: widgetToEdit.name, timezone: widgetToEdit.timezone })
      dispatch('savePersona', { db, persona })
    }
  },
  async editWeatherWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: widget._id,
      name: widget.name,
      units: widget.units
    }
    const showForm = create(WeatherWidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona }).transition()
    if (result) {
      commit('setWidgetDetails', { widget, name: widgetToEdit.name, units: widgetToEdit.units })
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
