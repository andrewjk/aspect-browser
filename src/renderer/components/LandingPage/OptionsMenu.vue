<template>
  <div id="options-menu">
    <button class="options-menu-item" @click="editSettings" title="Edit application settings">
      <fa icon="cog"/>
      <span>Settings</span>
    </button>
    <button class="options-menu-item" @click="showHistory" title="Show browsing history for this persona">
      <fa icon="history"/>
      <span>History</span>
    </button>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'

  export default {
    methods: {
      ...mapMutations([
        'editSettings',
        'showHistory'
      ])
    }
  }
</script>

<style scoped>

  #options-menu {
    border: 1px solid #ddd;
    border-radius: 2px;
    background-color: white;
    position: absolute;
    right: 3px;
    top: 65px;
    min-width: 200px;
    padding: 4px 0;
  }

  .options-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 6px;
  }

  .options-menu-item:hover,
  .options-menu-item:focus {
    background-color: #eee;
  }

</style>