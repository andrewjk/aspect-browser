<template>
  <main>
    <div class="persona-list-container">
      <persona-list v-bind:personas="personas" v-on:persona-added="personaAdded"></persona-list>
    </div>
    <div class="persona-browser-container">
      <persona-browser v-bind:personas="personas" v-on:persona-edited="personaEdited" v-on:persona-deleted="personaDeleted"></persona-browser>
    </div>
  </main>
</template>

<script>
  import PersonaList from './LandingPage/PersonaList'
  import PersonaBrowser from './LandingPage/PersonaBrowser'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser },
    data () {
      return {
        personas: [],
        // TODO: tabs and history per persona:
        activity: {},
        zoomLevel: 0
      }
    },
    created: function () {
      // Load the personas from the database
      // HACK: Should be some way to bind 'this'...
      const self = this
      this.$db.find({}).sort({ order: -1 }).exec(function (err, dbPersonas) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }

        self.personas = dbPersonas

        // Ensure that the first persona is active and reset the tabs for each persona
        self.personas.forEach(function (item, i) {
          item.isActive = (i === 0)
          item.tabs = [
            {
              _id: uuid(),
              url: 'home',
              addressText: 'home',
              title: 'Home',
              isActive: true,
              backHistory: [],
              forwardHistory: []
            }
          ]
        })

        // If there are no personas, add a default one that the user can edit
        if (!self.personas || !self.personas.length) {
          self.createDefaultPersona()
        }
      })

      // TODO: Load history from the database
    },
    mounted: function () {
      document.addEventListener('keydown', this.keyDown)
      document.addEventListener('keypress', this.keyPress)
    },
    methods: {
      setActiveIndex (index) {
        this.personas.forEach(function (item, i) {
          item.isActive = (i === index)
        })
      },
      setActiveTabIndex (index) {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          activePersona.tabs.forEach(function (item, i) {
            item.isActive = (i === index)
          })
        }
      },
      getActivePersona () {
        return this.personas.find(function (item) {
          return item.isActive
        })
      },
      getActivePersonaIndex () {
        for (let i = 0; i < this.personas.length; i++) {
          if (this.personas[i].isActive) {
            return i
          }
        }
      },
      getActiveTab () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          return activePersona.tabs.find(function (item) {
            return item.isActive
          })
        }
      },
      getActiveTabIndex () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          for (let i = 0; i < activePersona.tabs.length; i++) {
            if (activePersona.tabs[i].isActive) {
              return i
            }
          }
        }
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
      personaAdded (persona) {
        console.log('persona added')
        this.personas.push(persona)
        this.setActiveIndex(this.personas.length - 1)
        this.sortPersonas()
      },
      personaEdited (persona) {
        console.log('persona edited')
        this.sortPersonas()
      },
      personaDeleted (persona) {
        console.log('persona deleted')
        const index = this.personas.indexOf(persona)
        this.personas.splice(index, 1)
        if (!this.personas.length) {
          this.createDefaultPersona()
        }
        this.setActiveIndex(Math.min(index, this.personas.length - 1))
      },
      createDefaultPersona () {
        const defaultPersona = {
          _id: uuid(),
          name: 'Personal',
          shortName: 'P',
          color: 'lightgreen',
          order: 1,
          isActive: true,
          bookmarks: [],
          tabs: [
            {
              _id: uuid(),
              url: 'home',
              title: 'Home',
              isActive: true,
              backHistory: [],
              forwardHistory: []
            }
          ]
        }
        const self = this
        this.$db.insert(defaultPersona, function (err, dbPersona) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          self.personas = [ dbPersona ]
        })
      },
      keyDown (e) {
        // Have to listen for Ctrl + Tab in keyDown because it doesn't work in keyPress
        if (e.ctrlKey || e.metaKey) {
          console.log(e.keyCode)
          if (e.keyCode === 9) { // Tab
            if (e.shiftKey) {
              this.previousTab()
            } else {
              this.nextTab()
            }
          } else if (e.keyCode === 192) { // Tilde
            if (e.shiftKey) {
              this.previousPersona()
            } else {
              this.nextPersona()
            }
          }
        }
      },
      keyPress (e) {
        console.log(e.keyCode)
        if (e.ctrlKey || e.metaKey) {
          if (e.keyCode === 12) { // L
            this.focusAddressBox()
          } else if (e.keyCode === 20) { // T
            this.openNewTab()
          } else if (e.keyCode === 23) { // V
            this.closeTab()
          } else if (e.keyCode === 43) { // Minus
            this.zoomOut()
          } else if (e.keyCode === 45) { // Plus
            this.zoomIn()
          }
        }
      },
      nextPersona () {
        const index = this.getActivePersonaIndex()
        const newIndex = index < this.personas.length - 1 ? index + 1 : 0
        this.setActiveIndex(newIndex)
      },
      previousPersona () {
        const index = this.getActivePersonaIndex()
        const newIndex = index > 0 ? index - 1 : this.personas.length - 1
        this.setActiveIndex(newIndex)
      },
      nextTab () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          const index = this.getActiveTabIndex()
          const newIndex = index < activePersona.tabs.length - 1 ? index + 1 : 0
          this.setActiveTabIndex(newIndex)
        }
      },
      previousTab () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          const index = this.getActiveTabIndex()
          const newIndex = index > 0 ? index - 1 : activePersona.tabs.length - 1
          this.setActiveTabIndex(newIndex)
        }
      },
      closeTab () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          const index = this.getActiveTabIndex()
          activePersona.tabs.splice(index, 1)
          if (!activePersona.tabs.length) {
            activePersona.tabs.push({
              _id: uuid(),
              url: 'home',
              addressText: 'home',
              title: 'Home',
              icon: null,
              isActive: true,
              isLoading: false,
              backHistory: [],
              forwardHistory: []
            })
          }
          this.setActiveTabIndex(Math.min(index, activePersona.tabs.length - 1))
        }
      },
      openNewTab () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          activePersona.tabs.push({
            _id: uuid(),
            url: 'home',
            addressText: 'home',
            title: 'New tab',
            icon: null,
            isActive: true,
            isLoading: false,
            backHistory: [],
            forwardHistory: []
          })
          this.setActiveTabIndex(activePersona.tabs.length - 1)
          const box = document.getElementById('address-text-' + activePersona._id)
          box.focus()
          box.select()
        }
      },
      focusAddressBox () {
        const activePersona = this.getActivePersona()
        if (activePersona) {
          const box = document.getElementById('address-text-' + activePersona._id)
          box.focus()
        }
      },
      zoomIn () {
        const activeTab = this.getActiveTab()
        if (activeTab && activeTab.webview) {
          this.zoomLevel = this.zoomLevel + 1
          activeTab.webview.setZoomLevel(this.zoomLevel)
        }
      },
      zoomOut () {
        const activeTab = this.getActiveTab()
        if (activeTab && activeTab.webview) {
          this.zoomLevel = this.zoomLevel - 1
          activeTab.webview.setZoomLevel(this.zoomLevel)
        }
      }
    }
  }
</script>

<style>

  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: sans-serif;
  }

  p {
    line-height: 24px;
  }

  label {
    color: #666;
  }

  input {
    border-radius: 2px;
    border: 1px solid #ddd;
    padding: 4px 6px;
    width: 100%;
  }

  form table {
    border-spacing: 10px;
    width: 100%;
  }

</style>

<style scoped>

  .persona-list-container {
    width: 80px;
    height: 100vh;
  }

  .persona-browser-container {
    flex-grow: 1;
    height: 100vh;
  }

  main {
    display: flex;
    height: 100vh;
    width: 100vw;
  }

</style>
