<template>
  <main>
    <div class="persona-list-container">
      <persona-list @show-find-bookmark="showFindBookmarkDialog"></persona-list>
    </div>
    <div class="persona-browser-container">
      <persona-browser></persona-browser>
    </div>
  </main>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import PersonaList from './LandingPage/PersonaList'
  import PersonaBrowser from './LandingPage/PersonaBrowser'
  import FindBookmarkDialog from './LandingPage/FindBookmarkDialog.vue'

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser },
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
        settings: state => state.Settings.settings
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
      this.loadActivity(this.$adb)
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
        'showDownloads'
      ]),
      ...mapActions([
        'loadPersonas',
        'loadSettings',
        'loadHistory',
        'loadSystemSettings',
        'loadActivity',
        'removeFromActivity'
      ]),
      keyDown (e) {
        let keys = ''
        if (e.ctrlKey || e.metaKey) {
          keys = keys + 'ctrl+'
        }
        if (e.altKey || e.optionKey) {
          keys = keys + 'alt+'
        }
        if (e.shiftKey) {
          keys = keys + 'shift+'
        }
        keys = keys + e.key.toLowerCase()

        // console.log('keydown: ' + keys)
        switch (keys) {
          case 'ctrl+`': {
            this.nextPersona()
            break
          }
          case 'ctrl+shift+~': {
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
            this.showFindBookmarkDialog()
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
            const tab = this.getActiveTab
            this.removeFromActivity({ db: this.$adb, activityId: tab.activityId })
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
          case 'ctrl+d': {
            const persona = this.getActivePersona
            this.showDownloads({ persona })
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
      showFindBookmarkDialog () {
        const dialog = create(FindBookmarkDialog)
        dialog({}).transition()
          .catch((err) => {
            alert('ERROR: ' + err)
          })
        this.focusFindBookmark = true
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

</style>
