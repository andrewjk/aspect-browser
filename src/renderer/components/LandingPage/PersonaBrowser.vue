<template>
  <div class="persona-browser-wrapper">
    <div class="persona-browser">
      <a v-for="(item) in personas" v-show="item.isActive" v-bind:key="item.id" class="persona">
        <tab-list v-bind:persona="item" class="persona-tab-list"></tab-list>
        <address-bar v-bind:persona="item" class="persona-address-bar"></address-bar>
        <tab-page-list v-bind:persona="item" class="persona-tab-page-list"></tab-page-list>
      </a>
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
