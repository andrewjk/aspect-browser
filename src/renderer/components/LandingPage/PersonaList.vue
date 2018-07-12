<template>
  <div class="persona-list-wrapper">
    <div class="persona-list">
      <div class="drag-indicator">
        <fa icon="bars"/>
      </div>
      <div class="list">
        <button v-for="(item, index) in personas" :key="item._id" class="persona" @click="setActiveIndex(index)">
          <div class="persona-icon" :style="{ backgroundColor: getBackgroundColor(index) }">
            {{ item.shortName }}
          </div>
          <div class="persona-name">{{ item.name }}</div>
        </button>
      </div>
      <button class="persona-button" @click="search">
        <fa icon="search"/>
      </button>
      <button class="persona-button" @click="settings">
        <fa icon="cog"/>
      </button>
      <button class="persona-button" @click="addPersona">
        <fa icon="plus"/>
      </button>
    </div>
    <modal v-if="showPersonaModal" @close="showPersonaModal = false">
      <h3 slot="header">Add Persona:</h3>
      <persona-form slot="body" :persona="newPersona"></persona-form>
      <div slot="footer" class="modal-button-footer">
        <button @click="commitPersonaAdd">
          Save
        </button>
        <button @click="cancelPersonaAdd">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
  import Modal from './Modal'
  import PersonaForm from './PersonaForm'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    components: { Modal, PersonaForm },
    props: {
      personas: Array,
      activity: null
    },
    data () {
      return {
        showPersonaModal: false,
        newPersona: {}
      }
    },
    methods: {
      setActiveIndex (index) {
        // TODO: Emit an event to be handled in LandingPage
        this.personas.forEach(function (item, i) {
          if (item.isActive && i === index) {
            // If it's already the active item, go to the home page
            const tabs = this.activity[item._id].tabs
            const activeTab = tabs.find(function (titem) {
              return titem.isActive
            })
            if (activeTab) {
              // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
              activeTab.backHistory.push({
                url: activeTab.url,
                title: activeTab.title
              })
              activeTab.forwardHistory = []
              activeTab.url = null
              activeTab.addressText = null
              activeTab.title = 'Home'
            }
          }
          item.isActive = (i === index)
        })
      },
      getBackgroundColor (index) {
        if (this.personas[index].isActive) {
          return this.personas[index].color
        }
      },
      search () {
        // TODO:
      },
      settings () {
        // TODO:
      },
      addPersona () {
        // TODO: Should I emit an event so that this gets done centrally in the landing page?
        this.newPersona = {
          _id: uuid(),
          order: this.personas.length + 1,
          isActive: true,
          bookmarks: [],
          tabs: [
            {
              _id: uuid(),
              url: null,
              title: 'Home',
              isActive: true,
              backHistory: [],
              forwardHistory: []
            }
          ]
        }
        this.showPersonaModal = true
      },
      commitPersonaAdd () {
        // Save the persona to the database
        const self = this
        this.$db.insert(this.newPersona, function (err, dbPersona) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          // Do things further up the chain
          self.$emit('persona-added', dbPersona)
          // Close the modal
          self.showPersonaModal = false
        })
      },
      cancelPersonaAdd () {
        //  Close the modal
        this.showPersonaModal = false
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
    padding: 0 5px 10px;
    background-color: #444;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
  }

  .list {
    flex: 1 0 auto;
  }

  .persona {
    border-radius: 2px;
    display: block;
    margin-bottom: 10px;
    cursor: default;
    padding: 5px;
    text-align: center;
  }

  .persona:hover,
  .persona:focus {
    background-color: #777;
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
    background-color: #777;
  }

  .modal-button-footer {
    text-align: right;
  }

  .modal-button-footer button {
    margin-left: 10px;
    border: 1px solid #aaa;
    border-radius: 10px;
  }

  .modal-button-footer button:hover,
  .modal-button-footer button:focus {
    background-color: #ddd;
  }

</style>
