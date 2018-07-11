<template>
  <div class="tab-page-list-wrapper">
      <div v-for="(item) in persona.tabs" v-show="item.isActive" :key="item._id" class="tab-page-list-item">
        <template v-if="item.url === 'home'">
          <home-page :persona="persona" :show-welcome="showWelcome" @persona-edited="$emit('persona-edited', persona)" @persona-deleted="$emit('persona-deleted', persona)" @open-new-window="openNewWindow"></home-page>
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
      showWelcome: false
    },
    methods: {
      openNewWindow (url, background) {
        this.$emit('open-new-window', url, background)
      }
    }
  }
</script>

<style scoped>

  .tab-page-list-wrapper {
    display: flex;
  }

  .tab-page-list-item {
    flex: 1;
  }

</style>
