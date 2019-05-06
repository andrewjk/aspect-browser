
// NOTE: V4 uses random numbers
import uuid from 'uuid/v4'

import { create } from 'vue-modal-dialogs'
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog'
import SelectWidgetDialog from '../../components/Dialogs/SelectWidgetDialog'
import ClockWidgetDialog from '../../components/Dialogs/ClockWidgetDialog'
import TodoWidgetDialog from '../../components/Dialogs/TodoWidgetDialog'
import NewsWidgetDialog from '../../components/Dialogs/NewsWidgetDialog'
import WeatherWidgetDialog from '../../components/Dialogs/WeatherWidgetDialog'

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
  setWidgetDetails (state, data) {
    const widget = data.widget
    if (data.type !== undefined) widget.type = data.type
    if (data.name !== undefined) widget.name = data.name
    if (data.location !== undefined) widget.location = data.location
    if (data.units !== undefined) widget.units = data.units
  },
  insertWidget (state, data) {
    const widgets = data.widgets
    const widget = data.widget
    widgets.push(widget)
  },
  removeWidget (state, data) {
    const widgets = data.widgets
    const widget = data.widget
    const index = widgets.indexOf(widget)
    widgets.splice(index, 1)
  },
  moveWidgetUp (state, data) {
    const widgets = data.widgets
    const widget = data.widget
    const index = widgets.indexOf(widget)
    if (index === 0) {
      return
    }
    // Swap this widget's order with the next widget's order
    const thisOrder = widgets[index].order
    const prevOrder = widgets[index - 1].order
    widgets[index].order = prevOrder
    widgets[index - 1].order = thisOrder
  },
  moveWidgetDown (state, data) {
    const widgets = data.widgets
    const widget = data.widget
    const index = widgets.indexOf(widget)
    if (index === widgets.length - 1) {
      return
    }
    // Swap this persona's order with the next persona's order
    const thisOrder = widgets[index].order
    const nextOrder = widgets[index + 1].order
    widgets[index].order = nextOrder
    widgets[index + 1].order = thisOrder
  },
  moveWidgetLeft (state, data) {
    const persona = data.persona
    const widget = data.widget
    const index = persona.rightWidgets.indexOf(widget)
    persona.rightWidgets.splice(index, 1)
    persona.leftWidgets.push(widget)
    widget.order = persona.leftWidgets.length
  },
  moveWidgetRight (state, data) {
    const persona = data.persona
    const widget = data.widget
    const index = persona.leftWidgets.indexOf(widget)
    persona.leftWidgets.splice(index, 1)
    persona.rightWidgets.push(widget)
    widget.order = persona.rightWidgets.length
  },
  sanitizeWidgetOrders (state, widgets) {
    // Renumber everything, just in case something funny has gone on
    widgets.sort(sorter)
    for (var i = 0; i < widgets.length; i++) {
      widgets[i].order = i + 1
    }
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
    const typeForm = create(SelectWidgetDialog)
    const type = await typeForm().transition()
    if (type) {
      const db = data.db
      const persona = data.persona
      const widgets = data.widgets
      // Create a new widget object to be edited
      const widgetToEdit = {
        _id: uuid(),
        type,
        name: data.name,
        order: widgets.length + 1,
        isActive: true
      }
      let widgetForm
      if (type === 'clock') {
        widgetToEdit.location = data.location
        widgetForm = create(ClockWidgetDialog)
      } else if (type === 'todo') {
        widgetToEdit.name = data.name || 'To-do'
        widgetToEdit.todos = []
        widgetForm = create(TodoWidgetDialog)
      } else if (type === 'news') {
        widgetToEdit.location = data.location
        widgetToEdit.news = []
        widgetForm = create(NewsWidgetDialog)
      } else if (type === 'weather') {
        widgetToEdit.location = data.location
        widgetToEdit.units = data.units || 'celsius'
        widgetForm = create(WeatherWidgetDialog)
      }
      const result = await widgetForm({ widget: widgetToEdit, persona, widgets, adding: true }).transition()
      if (result) {
        commit('insertWidget', { persona, widgets, widget: widgetToEdit })
        dispatch('savePersona', { db, persona })
      }
    }
  },
  async editWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widgets = data.widgets
    const widget = data.widget
    // Create a new widget object to be edited
    const widgetToEdit = {
      _id: widget._id,
      name: widget.name
    }
    let widgetForm
    if (widget.type === 'clock') {
      widgetToEdit.location = widget.location
      widgetForm = create(ClockWidgetDialog)
    } else if (widget.type === 'todo') {
      widgetForm = create(TodoWidgetDialog)
    } else if (widget.type === 'news') {
      widgetToEdit.location = widget.location
      widgetForm = create(NewsWidgetDialog)
    } else if (widget.type === 'weather') {
      widgetToEdit.location = widget.location
      widgetToEdit.units = widget.units
      widgetForm = create(WeatherWidgetDialog)
    }
    const result = await widgetForm({ widget: widgetToEdit, persona, widgets }).transition()
    if (result) {
      commit('setWidgetDetails', { widget, name: widgetToEdit.name, location: widgetToEdit.location })
      dispatch('savePersona', { db, persona })
    }
  },
  async deleteWidget ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widgets = data.widgets
    const widget = data.widget
    return new Promise(async (resolve, reject) => {
      const dialog = create(ConfirmDialog)
      const okResult = await dialog({ content: 'Are you sure you want to delete this widget?' }).transition()
      if (okResult) {
        commit('removeWidget', { widgets, widget })
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
  },
  moveWidgetUpAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widgets = data.widgets
    const widget = data.widget
    commit('moveWidgetUp', { widgets, widget })
    commit('sanitizeWidgetOrders', widgets)
    dispatch('savePersona', { db, persona })
  },
  moveWidgetDownAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widgets = data.widgets
    const widget = data.widget
    commit('moveWidgetDown', { widgets, widget })
    commit('sanitizeWidgetOrders', widgets)
    dispatch('savePersona', { db, persona })
  },
  moveWidgetLeftAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    commit('moveWidgetLeft', { persona, widget })
    commit('sanitizeWidgetOrders', persona.leftWidgets)
    commit('sanitizeWidgetOrders', persona.rightWidgets)
    dispatch('savePersona', { db, persona })
  },
  moveWidgetRightAndSave ({ commit, dispatch }, data) {
    const db = data.db
    const persona = data.persona
    const widget = data.widget
    commit('moveWidgetRight', { persona, widget })
    commit('sanitizeWidgetOrders', persona.leftWidgets)
    commit('sanitizeWidgetOrders', persona.rightWidgets)
    dispatch('savePersona', { db, persona })
  }
}

export default {
  mutations,
  actions
}
