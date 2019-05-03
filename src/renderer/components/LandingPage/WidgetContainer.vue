<template>
  <div class="widget-container">
    <div v-for="(widget) in persona.widgets.filter((item) => item.position === position)" :key="widget._id">
      <div class="widget-item">
        <clock-widget v-if="widget.type === 'clock'" :widget="widget"/>
        <todo-widget v-if="widget.type === 'todo'" :persona="persona" :widget="widget"/>
        <news-widget v-if="widget.type === 'news'" :persona="persona" :tabs="tabs" :widget="widget"/>
        <weather-widget v-if="widget.type === 'weather'" :widget="widget"/>
        <div v-if="editing" class="edit-widget-links">
          <button class="widget-edit-button" @click.stop="editWidget({ db: $pdb, persona, widget })" title="Edit this widget">
            <fa icon="edit"/>
          </button>
          <button class="widget-edit-button delete-link" @click.stop="deleteWidget({ db: $pdb, persona, widget })" title="Delete this widget">
            <fa icon="trash"/>
          </button>
        </div>
      </div>
    </div>
    <div v-if="editing" :class="['add-widget-link', position]">
      <button class="widget-edit-button" @click="addWidget({ db: $pdb, persona, position })" title="Add a widget">
        <fa class="editing-icon" icon="plus"/>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  import ClockWidget from '../Widgets/ClockWidget.vue'
  import TodoWidget from '../Widgets/TodoWidget.vue'
  import NewsWidget from '../Widgets/NewsWidget.vue'
  import WeatherWidget from '../Widgets/WeatherWidget.vue'

  export default {
    components: { ClockWidget, TodoWidget, NewsWidget, WeatherWidget },
    props: {
      persona: null,
      tabs: Array,
      position: '',
      editing: false
    },
    methods: {
      ...mapActions([
        'addWidget',
        'editWidget',
        'deleteWidget'
      ])
    }
  }
</script>

<style lang="scss" scoped>
  .widget-container {
    margin: 40px 20px;
  }

  .widget-item {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    margin-bottom: 10px;
    padding: 10px 15px;
  }

  //.home-page-right .edit-widget-links {
  //  text-align: right;
  //}

  .widget-edit-button {
    background-color: transparent;
    border-radius: 2px;
    color: #777;
    height: 30px;
    width: 30px;
    line-height: 30px;
    text-align: center;
  }

  .widget-edit-button:hover,
  .widget-edit-button:focus {
    background-color: rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }

  .add-widget-link {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    margin-bottom: 10px;
    display: flex;
    button {
      height: 40px;
      flex: 1 1 auto;
    }
  }

  .edit-widget-links {
    margin-top: 7px;
    display: flex;
    button {
      flex: 1 1 auto;
    }
  }
</style>
