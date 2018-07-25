<template>
  <div class="persona-list-wrapper">
    <div :class="['persona-list', showEditPersonaLinks ? 'editing' : '']">
      <div class="drag-indicator">
        <fa v-if="platform !== 'darwin'" icon="bars"/>
      </div>
      <div class="list">
        <button v-for="(item, index) in personas" :key="item._id" :class="['persona', showEditPersonaLinks ? 'editing' : '']" @click="setActivePersonaIndexClick(index)">
          <div class="persona-info">
            <div class="persona-icon" :style="{ backgroundColor: getBackgroundColor(index) }">
              {{ item.shortName }}
            </div>
            <div class="persona-name">{{ item.name }}</div>
          </div>
          <div v-if="showEditPersonaLinks" class="persona-edit-buttons">
            <button class="edit-persona-button" @click.stop="movePersonaUpAndSave({ db: $pdb, personas, index })" title="Move this persona up">
              <fa icon="chevron-up"/>
            </button>
            <button class="edit-persona-button" @click.stop="editPersona(index)" title="Edit this persona">
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
      <button v-if="!showEditPersonaLinks" class="persona-button" @click="editSettings" title="Edit application settings">
        <fa icon="cog"/>
      </button>
      <button v-if="showEditPersonaLinks" class="persona-button" @click="addPersona" title="Add a persona">
        <fa icon="plus"/>
      </button>
      <button v-if="showEditPersonaLinks" class="persona-button" @click="editPersonas" title="Done editing">
        <fa icon="check"/>
      </button>
      <button v-else class="persona-button" @click="editPersonas" title="Edit personas">
        <fa icon="user-edit"/>
      </button>
    </div>
  </div>
</template>

<script>
  import os from 'os'
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  export default {
    computed: mapState({
      personas: state => state.Store.personas,
      activity: state => state.Store.activity,
      settings: state => state.Store.settings,
      ...mapGetters([
        'getActiveTab'
      ])
    }),
    data () {
      return {
        platform: os.platform(),
        showEditPersonaLinks: false,
        showEditPersonaModal: false,
        showAddPersonaModal: false,
        newPersona: {},
        showEditSettingsModal: false
      }
    },
    methods: {
      ...mapMutations([
        'setActivePersonaIndex',
        'goHome',
        'addPersona',
        'editPersona',
        'editSettings'
      ]),
      ...mapActions([
        'movePersonaUpAndSave',
        'movePersonaDownAndSave'
      ]),
      getBackgroundColor (index) {
        if (this.personas[index].isActive) {
          return this.personas[index].color
        }
      },
      setActivePersonaIndexClick (index) {
        if (this.personas[index].isActive) {
          const activeTab = this.getActiveTab
          this.goHome(activeTab)
        } else {
          this.setActivePersonaIndex(index)
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

<style scoped>

  .drag-indicator {
    color: white;
    height: 28px;
    line-height: 28px;
    font-size: 11px;
    text-align: center;
  }

  .persona-list {
    width: 76px;
    background-color: #2d2d2d;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
  }

  .persona-list.editing {
    width: 116px;
  }

  .list {
    flex: 1 0 auto;
  }

  .persona {
    border-radius: 2px;
    display: flex;
    cursor: default;
    padding: 8px;
    text-align: center;
  }

  .persona:hover,
  .persona:focus {
    background-color: #555;
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
  
</style>
