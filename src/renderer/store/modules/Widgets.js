
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import SelectWidgetDialog from '../../components/Dialogs/SelectWidgetDialog'
import ClockWidgetDialog from '../../components/Dialogs/ClockWidgetDialog'
import TodoWidgetDialog from '../../components/Dialogs/TodoWidgetDialog'
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
  },
  insertTodo (state, data) {
    const widget = data.widget
    const todo = data.todo
    if (!widget.todos) {
      widget.todos = []
    }
    widget.todos.push(todo)
  },
  toggleCompleted (state, data) {
    const todo = data.todo
    todo.isCompleted = !todo.isCompleted
  },
  clearCompleted (state, data) {
    const widget = data.widget
    widget.todos = widget.todos.filter((todo) => !todo.isCompleted)
  }
}

const actions = {
  async addWidget ({ commit, dispatch }, data) {
    // Get the type of widget
    const showForm = create(SelectWidgetDialog)
    const result = await showForm().transition()
    if (result === 'clock') {
      dispatch('addClockWidget', data)
    } else if (result === 'todo') {
      dispatch('addTodoWidget', data)
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
  async addTodoWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: uuid(),
      type: 'todo',
      name: data.name || 'To-do',
      todos: [],
      position: data.position,
      order: persona.widgets.length + 1,
      isActive: true
    }
    const showForm = create(TodoWidgetDialog)
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
    } else if (widget.type === 'todo') {
      dispatch('editTodoWidget', data)
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
  async editTodoWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: widget._id,
      name: widget.name
    }
    const showForm = create(TodoWidgetDialog)
    const result = await showForm({ widget: widgetToEdit, persona }).transition()
    if (result) {
      commit('setWidgetDetails', { widget, name: widgetToEdit.name })
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
  },
  async addTodo ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    const todo = data.todo
    commit('insertTodo', { widget, todo })
    dispatch('savePersona', { db, persona })
  },
  async completeTodo ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    const todo = data.todo
    commit('toggleCompleted', { widget, todo })
    dispatch('savePersona', { db, persona })
  },
  async clearCompletedTodos ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    commit('clearCompleted', { widget })
    dispatch('savePersona', { db, persona })
  }
}

export default {
  mutations,
  actions
}
