<template>
  <div class="widget-body">
    <div class="title">{{ widget.name }}</div>
    <div v-for="todo in widget.todos" :key="todo._id" class="todo-item">
      <label>
        <input type="checkbox" :checked="todo.isCompleted" @change="setCompleted(todo)">
        <span :class="[todo.isCompleted ? 'todo-completed' : '']">{{ todo.text }}</span>
      </label>
    </div>
    <div v-if="adding" class="todo-item">
      <input type="text" v-model="newTodo" @keypress.enter="createTodo">
    </div>
    <div v-if="adding || canAdd || canClear" class="edit-todo-links">
      <button v-if="!adding && canAdd" class="todo-edit-button" @click="startAdding" title="Add a todo">
        <fa class="editing-icon" icon="plus"/>
      </button>
      <button v-if="!adding && canClear" class="todo-edit-button" @click="clearTodos" title="Clear completed todos">
        <fa class="editing-icon" icon="check"/>
      </button>
      <button v-if="adding" class="todo-edit-button" @click="createTodo" title="Save the todo">
        <fa class="editing-icon" icon="check"/>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    props: {
      persona: null,
      widget: null
    },
    data () {
      return {
        adding: false,
        newTodo: '',
        canAdd: false,
        canClear: false
      }
    },
    mounted () {
      this.canAdd = this.widget.todos.length < 5
      this.canClear = this.widget.todos.some((todo) => todo.isCompleted)
    },
    methods: {
      ...mapActions([
        'addTodo',
        'completeTodo',
        'clearCompletedTodos'
      ]),
      startAdding () {
        this.adding = true
      },
      createTodo () {
        const todo = {
          _id: uuid(),
          isCompleted: false,
          text: this.newTodo
        }
        this.addTodo({ db: this.$pdb, persona: this.persona, widget: this.widget, todo })
        this.newTodo = ''
        this.adding = false
        this.canAdd = this.widget.todos.length < 5
      },
      setCompleted (todo) {
        this.completeTodo({ db: this.$pdb, persona: this.persona, widget: this.widget, todo })
        this.canClear = this.widget.todos.some((todo) => todo.isCompleted)
      },
      clearTodos () {
        this.clearCompletedTodos({ db: this.$pdb, persona: this.persona, widget: this.widget })
        this.canClear = false
        this.canAdd = this.widget.todos.length < 5
      }
    }
  }
</script>

<style scoped>
  .title {
    font-size: 20px;
    margin-bottom: 7px;
  }

  .todo-item {
    margin: 7px 0;
  }

  .todo-completed {
    text-decoration: line-through;
  }

  .edit-todo-links {
    text-align: right;
  }

  .todo-edit-button {
    background-color: transparent;
    border-radius: 2px;
    color: #777;
    height: 30px;
    width: 30px;
    line-height: 30px;
    text-align: center;
  }

  .todo-edit-button:hover,
  .todo-edit-button:focus {
    background-color: rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }

</style>
