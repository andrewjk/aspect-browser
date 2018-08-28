<template>
  <main>
    <div class="persona-list-container">
      <persona-list @show-find-bookmark="showFindBookmarkModal"></persona-list>
    </div>
    <div class="persona-browser-container">
      <persona-browser></persona-browser>
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
        <button @click="saveSettings({ db: $usdb, settingsToEdit, settingsToUpdate })">
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
    <modal v-if="showAboutInfo">
      <about-info slot="body"></about-info>
      <div slot="footer" class="modal-button-footer">
        <button @click="closeAboutInfo">
          Close
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
  import AboutInfo from './LandingPage/AboutInfo'

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser, Modal, PersonaForm, BookmarkForm, SettingsForm, FindBookmark, AboutInfo },
    data () {
      return {
        zoomLevel: 0,
        showFindBookmark: false,
        focusFindBookmark: false
      }
    },
    computed: {
      ...mapState({
        personas: state => state.Store.personas,
        activity: state => state.Store.activity,
        settings: state => state.Settings.settings,
        showPersonaModal: state => state.Store.showPersonaModal,
        personaToEdit: state => state.Store.personaToEdit,
        personaToUpdate: state => state.Store.personaToUpdate,
        showBookmarkModal: state => state.Store.showBookmarkModal,
        bookmarkToEdit: state => state.Store.bookmarkToEdit,
        bookmarkToUpdate: state => state.Store.bookmarkToUpdate,
        showSettingsModal: state => state.Settings.showSettingsModal,
        settingsToEdit: state => state.Settings.settingsToEdit,
        settingsToUpdate: state => state.Settings.settingsToUpdate,
        showAboutInfo: state => state.AboutInfo.showAboutInfo
      }),
      ...mapGetters([
        'getActivePersona',
        'getActiveTab'
      ])
    },
    created () {
      this.loadPersonas(this.$pdb)
      this.loadSettings(this.$usdb)
      this.loadSystemSettings(this.$ssdb)
    },
    mounted () {
      window.addEventListener('keydown', (e) => {
        this.keyDown(e)
      }, true)
    },
    updated () {
      if (this.focusFindBookmark) {
        this.focusFindBookmark = false
        this.focusFindBookmarkBox()
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
        'reopenTab',
        'showHistory',
        'openFindInPage',
        'closePersonaModal',
        'closeBookmarkModal',
        'closeSettingsModal',
        'closeAboutInfo'
      ]),
      ...mapActions([
        'loadPersonas',
        'loadSettings',
        'loadHistory',
        'loadSystemSettings',
        'savePersona',
        'deletePersona',
        'saveBookmark',
        'deleteBookmark',
        'saveSettings'
      ]),
      keyDown (e) {
        let keys = ''
        if (e.ctrlKey || e.metaKey) keys = keys + 'ctrl+'
        if (e.altKey || e.optionKey) keys = keys + 'alt+'
        if (e.shiftKey) keys = keys + 'shift+'
        keys = keys + e.key

        // console.log('keydown: ' + keys)
        switch (keys) {
          case 'ctrl+`': {
            this.nextPersona()
            break
          }
          case 'ctrl+shift+`': {
            this.previousPersona()
            break
          }
          case 'alt+1':
          case 'alt+2':
          case 'alt+3':
          case 'alt+4':
          case 'alt+5':
          case 'alt+6':
          case 'alt+7':
          case 'alt+8':
          case 'alt+9': {
            const newIndex = parseInt(e.key) - 1
            this.setActivePersonaIndex(newIndex)
            break
          }
          case 'ctrl+tab': {
            this.nextTab()
            break
          }
          case 'ctrl+shift+tab': {
            this.previousTab()
            break
          }
          case 'ctrl+1':
          case 'ctrl+2':
          case 'ctrl+3':
          case 'ctrl+4':
          case 'ctrl+5':
          case 'ctrl+6':
          case 'ctrl+7':
          case 'ctrl+8':
          case 'ctrl+9': {
            const newIndex = parseInt(e.key) - 1
            this.setActiveTabIndex(newIndex)
            break
          }
          case 'ctrl+-': {
            this.zoomOut()
            break
          }
          case 'ctrl++':
          case 'ctrl+=': {
            this.zoomIn()
            break
          }
          case 'ctrl+0': {
            this.zoomDefault()
            break
          }
          case 'ctrl+.': {
            this.showFindBookmarkModal()
            break
          }
          case 'ctrl+l': {
            this.focusAddressBox()
            break
          }
          case 'ctrl+t': {
            this.openNewTab()
            break
          }
          case 'ctrl+w': {
            this.closeTab()
            break
          }
          case 'ctrl+shift+t': {
            this.reopenTab()
            break
          }
          case 'ctrl+f': {
            this.openFindInPage()
            break
          }
          case 'ctrl+h': {
            this.showHistory()
            break
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
      }
    }
  }
</script>

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

</style>
