<template>
  <div class="persona-list-wrapper">
    <div :class="['persona-list', showEditPersonaLinks ? 'editing' : '']">
      <div class="drag-indicator">
        <fa icon="bars"/>
      </div>
      <div class="list">
        <button v-for="(item, index) in personas" :key="item._id" :class="['persona', showEditPersonaLinks ? 'editing' : '']" @click="setActiveIndex(index)">
          <div class="persona-info">
            <div class="persona-icon" :style="{ backgroundColor: getBackgroundColor(index) }">
              {{ item.shortName }}
            </div>
            <div class="persona-name">{{ item.name }}</div>
          </div>
          <div v-if="showEditPersonaLinks" class="persona-edit-buttons">
            <button class="edit-persona-button" @click.stop="movePersonaUp(index)" title="Move this persona up">
              <fa icon="chevron-up"/>
            </button>
            <button class="edit-persona-button" @click.stop="editPersona(index)" title="Edit this persona">
              <fa icon="user-edit"/>
            </button>
            <button class="edit-persona-button" @click.stop="movePersonaDown(index)" title="Move this persona down">
              <fa icon="chevron-down"/>
            </button>
          </div>
        </button>
      </div>
      <button v-if="!showEditPersonaLinks" class="persona-button" @click="search" title="Search personas and bookmarks">
        <fa icon="search"/>
      </button>
      <button v-if="!showEditPersonaLinks" class="persona-button" @click="settings" title="Edit application settings">
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
    <modal v-if="showAddPersonaModal" @close="showAddPersonaModal = false">
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
    <modal v-if="showEditPersonaModal" @close="showEditPersonaModal = false">
      <h3 slot="header">Edit Persona:</h3>
      <persona-form slot="body" :persona="newPersona"></persona-form>
      <div slot="footer" class="modal-button-footer">
        <a href="#" class="delete-link" @click="deletePersona">Delete persona</a>
        <button @click="commitPersonaEdit">
          Save
        </button>
        <button @click="cancelPersonaEdit">
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
        showEditPersonaLinks: false,
        showEditPersonaModal: false,
        showAddPersonaModal: false,
        newPersona: {}
      }
    },
    methods: {
      setActiveIndex (index) {
        if (this.showEditPersonaLinks) {
          return
        }
        // TODO: Emit an event to be handled in LandingPage
        const self = this
        this.personas.forEach(function (item, i) {
          if (item.isActive && i === index) {
            // If it's already the active item, go to the home page
            const tabs = self.activity[item._id].tabs
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
      editPersonas () {
        this.showEditPersonaLinks = !this.showEditPersonaLinks
      },
      movePersonaUp (index) {
        if (index === 0) {
          return
        }
        // Swap this persona's order with the next persona's order
        const thisOrder = this.personas[index].order
        const prevOrder = this.personas[index - 1].order
        this.personas[index].order = prevOrder
        this.personas[index - 1].order = thisOrder
        this.sanitizePersonaOrders()
      },
      movePersonaDown (index) {
        if (index === this.personas.length - 1) {
          return
        }
        // Swap this persona's order with the next persona's order
        const thisOrder = this.personas[index].order
        const nextOrder = this.personas[index + 1].order
        this.personas[index].order = nextOrder
        this.personas[index + 1].order = thisOrder
        this.sanitizePersonaOrders()
      },
      sanitizePersonaOrders () {
        // Sort the personas
        this.sortPersonas()
        // Renumber everything, just in case something funny has gone on
        for (var i = 0; i < this.personas.length; i++) {
          this.personas[i].order = i + 1
        }
        // Save the persona
        this.savePersonas()
      },
      sortPersonas () {
        this.personas.sort(function (a, b) {
          if (a.order < b.order) {
            return -1
          } else if (a.order > b.order) {
            return 1
          } else {
            return 0
          }
        })
      },
      addPersona () {
        // TODO: Should I emit an event so that this gets done centrally in the landing page?
        this.newPersona = {
          _id: uuid(),
          order: this.personas.length + 1,
          isActive: true
        }
        this.showAddPersonaModal = true
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
          self.showAddPersonaModal = false
        })
      },
      cancelPersonaAdd () {
        //  Close the modal
        this.showAddPersonaModal = false
      },
      editPersona (index) {
        // Store the persona's details so they can be reset if the user presses the Cancel button
        this.newPersona = this.personas[index]
        this.oldPersona = {
          name: this.newPersona.name,
          shortName: this.newPersona.shortName,
          color: this.newPersona.color
        }
        // Show the modal
        this.showEditPersonaModal = true
      },
      commitPersonaEdit () {
        // Save the persona to the database
        const self = this
        const persona = this.newPersona
        this.$db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          // Do things further up the chain
          self.$emit('persona-edited', self.persona)
          // Close the modal
          self.oldPersona = null
          self.newPersona = null
          self.showEditPersonaModal = false
        })
      },
      cancelPersonaEdit () {
        // Reset the persona's details
        this.newPersona.name = this.oldPersona.name
        this.newPersona.shortName = this.oldPersona.shortName
        this.newPersona.color = this.oldPersona.color
        //  Close the modal
        this.oldPersona = null
        this.newPersona = null
        this.showEditPersonaModal = false
      },
      savePersonas () {
        const self = this
        this.personas.forEach(function (persona) {
          // Save the persona to the database
          self.$db.update({ _id: persona._id }, persona, {}, function (err, numReplaced) {
            if (err) {
              alert('ERROR: ' + err)
            }
          })
        })
      },
      deletePersona () {
        if (confirm('Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.') && confirm('Are you really sure you want to delete this persona?')) {
          // Remove the persona from the database
          const self = this
          const persona = this.newPersona
          this.$db.remove({ _id: persona._id }, {}, function (err, numReplaced) {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            // Do things further up the chain
            self.$emit('persona-deleted', persona)
            // Close the modal
            self.oldPersona = null
            self.newPersona = null
            self.showEditPersonaModal = false
          })
        }
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
    width: 80px;
    padding: 0 5px 10px;
    background-color: #444;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
  }

  .persona-list.editing {
    width: 120px;
  }

  .list {
    flex: 1 0 auto;
  }

  .persona {
    border-radius: 2px;
    display: flex;
    margin-bottom: 10px;
    cursor: default;
    padding: 5px;
    text-align: center;
  }

  .persona:hover,
  .persona:focus {
    background-color: #777;
  }

  .persona.editing:hover,
  .persona.editing:focus {
    background-color: inherit;
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
