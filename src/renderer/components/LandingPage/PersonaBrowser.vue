<template>
  <div class="persona-browser-wrapper">
    <div class="persona-browser">
      <div v-for="(item, index) in personas" :key="item._id" class="persona" :style="{ zIndex: getZIndex(index) }">
        <tab-list :persona="item" class="persona-tab-list"></tab-list>
        <address-bar :persona="item" class="persona-address-bar"></address-bar>
        <tab-page-list :persona="item" :show-welcome="personas.length === 1" class="persona-tab-page-list"></tab-page-list>
        <find-in-page v-show="showFindInPage" :persona="item" class="persona-find-in-page"></find-in-page>
        <downloads-bar v-show="showDownloadsBar" :persona="item" class="persona-downloads-bar"></downloads-bar>
      </div>
    </div>
  </div>
</template>

<script>
  import electron from 'electron'
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  import TabList from './TabList'
  import AddressBar from './AddressBar'
  import TabPageList from './TabPageList'
  import FindInPage from './FindInPage'
  import DownloadsBar from './DownloadsBar'

  export default {
    components: { TabList, AddressBar, TabPageList, FindInPage, DownloadsBar },
    computed: {
      ...mapState({
        personas: state => state.Store.personas,
        settings: state => state.Settings.settings,
        showFindInPage: state => state.Store.showFindInPage,
        focusFindInPage: state => state.Store.focusFindInPage,
        showDownloadsBar: state => state.Downloads.showDownloadsBar
      }),
      ...mapGetters([
        'getActivePersona'
      ])
    },
    mounted () {
      electron.ipcRenderer.on('download-started', (event, data) => {
        const activePersona = this.getActivePersona
        if (activePersona) {
          this.saveToDownloads(Object.assign({ db: this.$ddb, personaId: activePersona._id }, data))
          this.addDownload(data)
          this.openDownloadsBar()
        }
      })
      electron.ipcRenderer.on('download-progress', (event, data) => {
        this.setDownloadDetails(data)
      })
      electron.ipcRenderer.on('download-completed', (event, data) => {
        this.setDownloadDetails({ localFile: data.localFile, isCompleted: true })
      })
      electron.ipcRenderer.on('download-paused', (event, data) => {
        this.setDownloadDetails({ localFile: data.localFile, isPaused: true })
      })
      electron.ipcRenderer.on('download-resumed', (event, data) => {
        this.setDownloadDetails({ localFile: data.localFile, isPaused: false })
      })
      electron.ipcRenderer.on('download-cancelled', (event, data) => {
        this.setDownloadDetails({ localFile: data.localFile, isPaused: false, isCompleted: true, isCancelled: true })
      })
    },
    updated () {
      if (this.focusFindInPage) {
        this.focusFindInPageBox()
        this.unfocusFindInPage()
      }
    },
    methods: {
      ...mapMutations([
        'getZIndex',
        'unfocusFindInPage',
        'addDownload',
        'setDownloadDetails',
        'openDownloadsBar'
      ]),
      ...mapActions([
        'saveToDownloads'
      ]),
      getZIndex (index) {
        return this.personas[index].isActive ? 99 : -99
      },
      focusFindInPageBox () {
        const activePersona = this.getActivePersona
        if (activePersona) {
          const box = document.getElementById('find-text-' + activePersona._id)
          box.focus()
        }
      }
    }
  }
</script>

<style scoped>

  .persona-browser {
    position: relative;
  }

  .persona {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .persona-tab-list {
    flex: 0 0 auto;
  }

  .persona-address-bar {
    flex: 0 0 auto;
  }

  .persona-tab-page-list {
    flex: 1 0 auto;
  }

  .persona-find-in-page {
    flex: 0 0 auto;
  }

</style>
