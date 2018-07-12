<template>
  <div class="tab-page-list-wrapper">
      <div v-for="(item, index) in tabs" :key="item._id" class="tab-page-list-item" :style="{ zIndex: getZIndex(index) }">
        <template v-if="!item.url">
          <home-page :persona="persona" :tabs="tabs" :show-welcome="showWelcome" @persona-edited="$emit('persona-edited', persona)" @persona-deleted="$emit('persona-deleted', persona)" @open-new-window="openNewWindow"></home-page>
        </template>
        <template v-else>
          <tab-page :tab="item" :partition="persona._id" @open-new-window="openNewWindow"></tab-page>
        </template>
      </div>
  </div>
</template>

<script>
  import HomePage from './HomePage'
  import TabPage from './TabPage'

  export default {
    components: { HomePage, TabPage },
    props: {
      persona: null,
      activity: null,
      showWelcome: false
    },
    data () {
      return {
        tabs: this.activity[this.persona._id].tabs
      }
    },
    methods: {
      getZIndex: function (index) {
        return this.tabs[index].isActive ? 99 : -99
      },
      openNewWindow (url, background) {
        this.$emit('open-new-window', url, background)
      }
    }
  }
</script>

<style scoped>

  .tab-page-list-wrapper {
    position: relative;
  }

  .tab-page-list-item {
    background-color: white;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

</style>
