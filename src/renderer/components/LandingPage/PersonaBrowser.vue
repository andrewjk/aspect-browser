<template>
  <div class="persona-browser-wrapper">
    <div class="persona-browser">
      <div v-for="(item, index) in personas" :key="item._id" class="persona" :style="{ zIndex: getZIndex(index) }">
        <tab-list :persona="item" :activity="activity" class="persona-tab-list"></tab-list>
        <address-bar :persona="item" :activity="activity" :settings="settings" class="persona-address-bar"></address-bar>
        <tab-page-list :persona="item" :activity="activity" :show-welcome="personas.length === 1" class="persona-tab-page-list" @persona-edited="$emit('persona-edited', item)" @persona-deleted="$emit('persona-deleted', item)" @open-new-window="openNewWindow"></tab-page-list>
      </div>
    </div>
  </div>
</template>

<script>
  import TabList from './TabList'
  import AddressBar from './AddressBar'
  import TabPageList from './TabPageList'

  export default {
    components: { TabList, AddressBar, TabPageList },
    props: {
      personas: Array,
      activity: null,
      settings: null
    },
    methods: {
      getZIndex: function (index) {
        return this.personas[index].isActive ? 99 : -99
      },
      openNewWindow (url, background) {
        this.$emit('open-new-window', url, background)
      }
    }
  }
</script>

<style scoped>

  .persona-browser {
    position: relative;
  }

  .persona {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .persona-tab-list {
    flex: 0 0 auto;
  }

  .persona-address-bar {
    flex: 0 0 auto;
  }

  .persona-tab-page-list {
    flex: 1 0 auto;
  }

</style>
