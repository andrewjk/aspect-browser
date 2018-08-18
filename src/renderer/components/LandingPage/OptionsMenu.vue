<template>
  <div id="options-menu">
    <button class="options-menu-item" @click="editSettings" title="Edit application settings">
      <fa icon="cog"/>
      <span>Settings</span>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="showHistory" title="Show browsing history for this persona">
      <fa :icon="['far', 'clock']"/>
      <span>View {{ this.persona.name }} History</span>
    </button>
    <button class="options-menu-item" @click="clearHistory({ db: $hdb, personaId: persona._id })" title="Clear the browsing history for this persona">
      <fa icon="trash"/>
      <span>Clear {{ this.persona.name }} History</span>
    </button>
    <button class="options-menu-item" @click="clearAllHistory({ db: $hdb, personaId: persona._id })" title="Clear the browsing history for all personas">
      <fa icon="trash"/>
      <span>Clear All History</span>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="openAboutInfo" title="Show information about Aspect">
      <fa icon="info-circle"/>
      <span>About Aspect</span>
    </button>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'

  export default {
    props: {
      persona: null
    },
    methods: {
      ...mapMutations([
        'editSettings',
        'showHistory',
        'openAboutInfo'
      ]),
      ...mapActions([
        'clearHistory',
        'clearAllHistory'
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
    width: 200px;
    padding: 4px 0;
  }

  .options-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 8px;
  }

  .options-menu-item:hover,
  .options-menu-item:focus {
    background-color: #eee;
  }

  .options-menu-separator {
    height: 1px;
    border-bottom: 1px solid #ddd;
    margin: 2px 0;
  }

</style>