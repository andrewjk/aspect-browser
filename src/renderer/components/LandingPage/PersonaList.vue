<template>
  <div :class="['persona-list', showEditPersonaLinks ? 'editing' : '']">
    <div class="drag-indicator">
      <fa v-if="platform !== 'darwin'" icon="bars"/>
    </div>
    <div class="list">
      <button v-for="(item, index) in personas" :key="item._id" :class="['persona', showEditPersonaLinks ? 'editing' : '']" @click="setActivePersona(index)" @mouseenter="setShowOpenTabCount(index, true)" @mouseleave="setShowOpenTabCount(index, false)">
        <div v-show="item.openTabCount" class="open-tab-indicator"/>
        <div class="persona-info">
          <div class="persona-icon" :style="{ backgroundColor: getBackgroundColor(item) }">
            {{ item.shortName }}
            <div v-show="item.openTabCount && (showAllOpenTabCounts || item.showOpenTabCount)" class="open-tab-count">{{ item.openTabCount }}</div>
          </div>
          <div class="persona-name">{{ item.name }}</div>
        </div>
        <div v-if="showEditPersonaLinks" class="persona-edit-buttons">
          <button class="edit-persona-button" @click.stop="movePersonaUpAndSave({ db: $pdb, personas, index })" title="Move this persona up">
            <fa icon="chevron-up"/>
          </button>
          <button class="edit-persona-button" @click.stop="editPersona({ db: $pdb, persona: item })" title="Edit this persona">
            <fa icon="user-edit"/>
          </button>
          <button class="edit-persona-button" @click.stop="movePersonaDownAndSave({ db: $pdb, personas, index })" title="Move this persona down">
            <fa icon="chevron-down"/>
          </button>
        </div>
      </button>
    </div>
    <button v-if="!showEditPersonaLinks" class="persona-button" @click="findBookmark" title="Search for a bookmark">
      <fa icon="search"/>
    </button>
    <button v-if="showEditPersonaLinks" class="persona-button" @click="addPersona({ db: $pdb, personas })" title="Add a persona">
      <fa icon="plus"/>
    </button>
    <button v-if="showEditPersonaLinks" class="persona-button" @click="editPersonas" title="Done editing">
      <fa icon="check"/>
    </button>
    <button v-else class="persona-button" @click="editPersonas" title="Edit personas">
      <fa icon="user-edit"/>
    </button>
  </div>
</template>

<script>
  import os from 'os'
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  export default {
    computed: mapState({
      personas: state => state.Personas.personas,
      showAllOpenTabCounts: state => state.Personas.showAllOpenTabCounts,
      settings: state => state.Settings.settings,
      ...mapGetters([
        'getActiveTab'
      ])
    }),
    data () {
      return {
        platform: os.platform(),
        showEditPersonaLinks: false,
        showOpenTabCountTimeout: null
      }
    },
    methods: {
      ...mapMutations([
        'setActivePersonaIndex',
        'setShowPersonaOpenTabCount',
        'insertPersona',
        'sortPersonas'
      ]),
      ...mapActions([
        'openNewTab',
        'movePersonaUpAndSave',
        'movePersonaDownAndSave',
        'addPersona',
        'editPersona'
      ]),
      getBackgroundColor (persona) {
        if (persona.isActive) {
          return persona.color
        }
      },
      setActivePersona (index) {
        if (this.showOpenTabCountTimeout) {
          clearTimeout(this.showOpenTabCountTimeout)
        }
        const persona = this.personas[index]
        if (persona.isActive) {
          const activeTab = this.getActiveTab
          this.openNewTab(activeTab)
        } else {
          this.setActivePersonaIndex(index)
        }
      },
      setShowOpenTabCount (index, show) {
        if (this.showOpenTabCountTimeout) {
          clearTimeout(this.showOpenTabCountTimeout)
        }
        if (show) {
          this.showOpenTabCountTimeout = setTimeout(() => this.setShowPersonaOpenTabCount({ index, show }), 600)
        } else {
          this.setShowPersonaOpenTabCount({ index, show })
        }
      },
      findBookmark () {
        this.$emit('show-find-bookmark')
      },
      editPersonas () {
        this.showEditPersonaLinks = !this.showEditPersonaLinks
      }
    }
  }
</script>

<style lang="scss" scoped>

  .drag-indicator {
    color: white;
    height: 28px;
    line-height: 28px;
    font-size: 11px;
    text-align: center;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
  }

  .persona-list {
    width: 76px;
    background-color: #2d2d2d;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    user-select: none;
  }

  .persona-list.editing {
    width: 116px;
  }

  .list {
    flex: 1 0 auto;
  }

  .persona {
    position: relative;
    border-radius: 2px;
    display: flex;
    cursor: default;
    padding: 8px;
    text-align: center;
  }

  .open-tab-indicator {
    background-color: #666;
    position: absolute;
    width: 4px;
    left: 0;
    top: 28px;
    height: 20px;
  }

  .persona:hover,
  .persona:focus {
    background-color: #555;
    border-left: 0;
    padding: 8px;
    margin: 0;
  }

  .persona-icon {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    border: 2px solid #eee;
    color: #eee;
    line-height: 60px; 
    margin-bottom: 10px;
    font-size: 18px;
    position: relative;
  }

  .persona-name {
    font-size: 11px;
    color: white;
  }

  .persona-button {
    border-radius: 2px;
    height: 30px;
    color: white;
    line-height: 30px;
    font-size: 11px;
    text-align: center;
    flex: 0 0 auto;
  }

  .persona-button:hover,
  .persona-button:focus {
    background-color: #555;
  }

  .edit-persona-button {
    border-radius: 2px;
    height: 27px;
    width: 30px;
    color: white;
    line-height: 27px;
    font-size: 11px;
    text-align: center;
    margin-left: 10px;
  }

  .edit-persona-button:hover,
  .edit-persona-button:focus {
    background-color: #777;
  }

  .open-tab-count {
    background-color: #66a0fe;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    font-size: 13px;
    line-height: 18px;
    height: 18px;
    width: 18px;
    position: absolute;
    bottom: -1px;
    right: -1px;
    text-align: center;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2);
    vertical-align: top;
  }

</style>
