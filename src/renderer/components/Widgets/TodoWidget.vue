<template>
  <div class="widget-body" @mouseenter="showEditLinks = true" @mouseleave="showEditLinks = false">
    <div class="title">{{ widget.name }}</div>
    <div v-for="todo in widget.todos" :key="todo._id" class="todo-item">
      <label>
        <input type="checkbox" :checked="todo.isCompleted" @change="setCompleted(todo)">
        <span :class="[todo.isCompleted ? 'todo-completed' : '']">{{ todo.text }}</span>
      </label>
    </div>
    <div v-if="adding" class="todo-item">
      <input type="text" v-model="newTodo" @keypress.enter="createTodo" ref="todoInput">
    </div>
    <div v-if="(showEditLinks || !widget.todos.length) && (adding || canAdd || canClear)" class="edit-todo-links">
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
  import Vue from 'vue'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    props: {
      persona: null,
      widget: null
    },
    data () {
      return {
        showEditLinks: false,
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
        Vue.nextTick(() => {
          this.$refs.todoInput.focus()
        })
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

<style lang="scss" scoped>
  .title {
    font-size: 18px;
    margin-bottom: 7px;
  }

  .todo-item {
    margin: 10px 0;
  }

  .todo-completed {
    text-decoration: line-through;
  }

  .edit-todo-links {
    display: flex;
    button {
      flex: 1 1 auto;
    }
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
