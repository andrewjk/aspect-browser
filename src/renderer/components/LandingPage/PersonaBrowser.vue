<template>
  <div class="persona-browser-wrapper">
    <div class="persona-browser">
      <div v-for="(item) in personas" v-show="item.isActive" :key="item._id" class="persona">
        <tab-list :persona="item" :tabs="item.tabs" class="persona-tab-list"></tab-list>
        <address-bar :persona="item" :active-tab="getActiveTab()" class="persona-address-bar"></address-bar>
        <tab-page-list :persona="item" :show-welcome="personas.length === 1" class="persona-tab-page-list" @persona-edited="$emit('persona-edited', item)" @persona-deleted="$emit('persona-deleted', item)" @open-new-window="openNewWindow"></tab-page-list>
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
      personas: Array
    },
    methods: {
      getActiveTab () {
        const activePersona = this.personas.find(function (item) {
          return item.isActive
        })
        const activeTab = activePersona.tabs.find(function (item) {
          return item.isActive
        })
        return activeTab
      },
      openNewWindow (url, background) {
        this.$emit('open-new-window', url, background)
      }
    }
  }
</script>

<style scoped>

  .persona {
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
