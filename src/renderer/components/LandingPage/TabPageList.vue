<template>
  <div class="tab-page-list-wrapper">
      <div v-for="(item) in persona.tabs" v-show="item.isActive" v-bind:key="item.id" class="tab-page-list-item">
        <template v-if="item.url === 'home'">
          <home-page v-bind:persona="persona"></home-page>
        </template>
        <template v-else>
          <tab-page v-bind:tab="item" v-bind:partition="persona.id"></tab-page>
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
      persona: null
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
