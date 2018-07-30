<template>
  <main>
    <div class="persona-list-container">
      <persona-list @show-find-bookmark="showFindBookmarkModal"></persona-list>
    </div>
    <div class="persona-browser-container">
      <persona-browser :showFindInPage="showFindInPage" :focusFindInPage="focusFindInPage" @close-find-in-page="closeFindInPage"></persona-browser>
    </div>
    <modal v-if="showPersonaModal">
      <h3 slot="header">{{ personaToUpdate ? 'Edit Persona:' : 'Add Persona:' }}</h3>
      <persona-form slot="body"></persona-form>
      <div slot="footer" class="modal-button-footer">
        <a v-show="personaToUpdate" href="#" class="delete-link" @click="deletePersona({ db: $pdb, personaToUpdate })">Delete persona</a>
        <button @click="savePersona({ db: $pdb, personaToEdit, personaToUpdate })">
          Save
        </button>
        <button @click="closePersonaModal">
          Cancel
        </button>
      </div>
    </modal>
    <modal v-if="showBookmarkModal">
      <h3 slot="header">{{ bookmarkToUpdate ? 'Edit Bookmark:' : 'Add Bookmark:' }}</h3>
      <bookmark-form slot="body"></bookmark-form>
      <div slot="footer" class="modal-button-footer">
        <a v-show="bookmarkToUpdate" href="#" class="delete-link" @click="deleteBookmark({ db: $pdb, persona: getActivePersona, bookmarkToUpdate })">Delete bookmark</a>
        <button @click="saveBookmark({ db: $pdb, persona: getActivePersona, bookmarkToEdit, bookmarkToUpdate })">
          Save
        </button>
        <button @click="closeBookmarkModal">
          Cancel
        </button>
      </div>
    </modal>
    <modal v-if="showSettingsModal">
      <h3 slot="header">Settings:</h3>
      <settings-form slot="body"></settings-form>
      <div slot="footer" class="modal-button-footer">
        <button @click="saveSettings({ db: $sdb, settingsToEdit, settingsToUpdate })">
          Save
        </button>
        <button @click="closeSettingsModal">
          Cancel
        </button>
      </div>
    </modal>
    <modal v-if="showFindBookmark">
      <h3 slot="header">Search:</h3>
      <find-bookmark slot="body" @close-find-bookmark="closeFindBookmarkModal"></find-bookmark>
      <div slot="footer" class="modal-button-footer">
        <button @click="closeFindBookmarkModal">
          Cancel
        </button>
      </div>
    </modal>
  </main>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  import PersonaList from './LandingPage/PersonaList'
  import PersonaBrowser from './LandingPage/PersonaBrowser'
  import Modal from './LandingPage/Modal'
  import PersonaForm from './LandingPage/PersonaForm'
  import BookmarkForm from './LandingPage/BookmarkForm'
  import SettingsForm from './LandingPage/SettingsForm'
  import FindBookmark from './LandingPage/FindBookmark'

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser, Modal, PersonaForm, BookmarkForm, SettingsForm, FindBookmark },
    data () {
      return {
        zoomLevel: 0,
        showFindBookmark: false,
        focusFindBookmark: false,
        showFindInPage: false,
        focusFindInPage: false
      }
    },
    computed: {
      ...mapState({
        personas: state => state.Store.personas,
        activity: state => state.Store.activity,
        settings: state => state.Store.settings,
        showPersonaModal: state => state.Store.showPersonaModal,
        personaToEdit: state => state.Store.personaToEdit,
        personaToUpdate: state => state.Store.personaToUpdate,
        showBookmarkModal: state => state.Store.showBookmarkModal,
        bookmarkToEdit: state => state.Store.bookmarkToEdit,
        bookmarkToUpdate: state => state.Store.bookmarkToUpdate,
        showSettingsModal: state => state.Store.showSettingsModal,
        settingsToEdit: state => state.Store.settingsToEdit,
        settingsToUpdate: state => state.Store.settingsToUpdate
      }),
      ...mapGetters([
        'getActivePersona',
        'getActiveTab'
      ])
    },
    created: function () {
      this.loadPersonas(this.$pdb)
      this.loadSettings(this.$sdb)
      this.loadSystemSettings(this.$ssdb)
      // TODO: Load history from the database
    },
    mounted: function () {
      document.addEventListener('keydown', this.keyDown)
      document.addEventListener('keypress', this.keyPress)
    },
    updated: function () {
      if (this.focusFindBookmark) {
        this.focusFindBookmark = false
        this.focusFindBookmarkBox()
      }
      if (this.focusFindInPage) {
        this.focusFindInPage = false
        this.focusFindInPageBox()
      }
    },
    methods: {
      ...mapMutations([
        'setActivePersonaIndex',
        'setActiveTabIndex',
        'previousPersona',
        'nextPersona',
        'previousTab',
        'nextTab',
        'openNewTab',
        'closeTab',
        'closePersonaModal',
        'closeBookmarkModal',
        'closeSettingsModal'
      ]),
      ...mapActions([
        'loadPersonas',
        'loadSettings',
        'loadSystemSettings',
        'savePersona',
        'deletePersona',
        'saveBookmark',
        'deleteBookmark',
        'saveSettings'
      ]),
      keyDown (e) {
        // Have to listen for Ctrl + Tab and some others in keyDown because they don't work in keyPress
        // console.log(e.keyCode)
        if (e.ctrlKey || e.metaKey) {
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
          } else if (e.keyCode >= 49 && e.keyCode <= 57) { // 1 - 9
            const newIndex = e.keyCode - 49
            this.setActiveTabIndex(newIndex)
          } else if (e.keyCode === 45 || e.keyCode === 109 || e.keyCode === 189) { // Minus
            this.zoomOut()
          } else if (e.keyCode === 43 || e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 187) { // Plus or equals
            this.zoomIn()
          } else if (e.keyCode === 48) { // Zero
            this.zoomDefault()
          } else if (e.keyCode === 190) { // .
            this.showFindBookmarkModal()
          }
        } else if (e.altKey) {
          if (e.keyCode >= 48 && e.keyCode <= 57) { // 1 - 9
            const newIndex = e.keyCode - 49
            this.setActivePersonaIndex(newIndex)
          }
        }
      },
      keyPress (e) {
        // console.log('keypress: ' + e.keyCode)
        if (e.ctrlKey || e.metaKey) {
          if (e.keyCode === 12) { // L
            this.focusAddressBox()
          } else if (e.keyCode === 20) { // T
            this.openNewTab()
          } else if (e.keyCode === 23) { // V
            this.closeTab()
          } else if (e.keyCode === 6) { // F
            this.findInPage()
          }
        }
      },
      focusAddressBox () {
        const activePersona = this.getActivePersona
        if (activePersona) {
          const box = document.getElementById('address-text-' + activePersona._id)
          box.focus()
        }
      },
      focusFindBookmarkBox () {
        const box = document.getElementById('find-bookmark-text')
        box.focus()
      },
      focusFindInPageBox () {
        const activePersona = this.getActivePersona
        if (activePersona) {
          const box = document.getElementById('find-text-' + activePersona._id)
          box.focus()
        }
      },
      zoomIn () {
        if (this.zoomLevel === 8) {
          return
        }
        const activeTab = this.getActiveTab
        if (activeTab && activeTab.webview) {
          this.zoomLevel = this.zoomLevel + 1
          activeTab.webview.setZoomLevel(this.zoomLevel)
        }
      },
      zoomOut () {
        if (this.zoomLevel === -8) {
          return
        }
        const activeTab = this.getActiveTab
        if (activeTab && activeTab.webview) {
          this.zoomLevel = this.zoomLevel - 1
          activeTab.webview.setZoomLevel(this.zoomLevel)
        }
      },
      zoomDefault () {
        const activeTab = this.getActiveTab
        if (activeTab && activeTab.webview) {
          this.zoomLevel = 0
          activeTab.webview.setZoomLevel(this.zoomLevel)
        }
      },
      showFindBookmarkModal () {
        this.showFindBookmark = true
        this.focusFindBookmark = true
      },
      closeFindBookmarkModal () {
        this.showFindBookmark = false
      },
      findInPage () {
        const activePersona = this.getActivePersona
        if (activePersona) {
          this.showFindInPage = true
          this.focusFindInPage = true
        }
      },
      closeFindInPage () {
        this.showFindInPage = false
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
    overflow: hidden;
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

  a {
    color: #0077cc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a:focus,
  a:active:focus,
  a.active:focus,
  a.focus,
  a:active.focus,
  a.active.focus {
    outline: 1px dotted;
  }

  button {
    border: none;
    background-color: inherit;
  }

  button:focus,
  button:active:focus,
  button.active:focus,
  button.focus,
  button:active.focus,
  button.active.focus {
    outline: none !important;
  }

  a,
  input[type="submit"],
  input[type="reset"],
  input[type="button"],
  input[type="text"],
  button,
  textarea {
    -webkit-app-region: no-drag;
  }

</style>

<style scoped>

  .persona-list-container {
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

  .delete-link {
    color: red;
  }
  
</style>
