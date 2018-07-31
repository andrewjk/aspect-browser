<template>
  <div class="window-buttons-wrapper">
    <button v-show="canMinimize && showMinimize && platform !== 'darwin'" class="window-button" @click="minimize">
      <fa :icon="['far', 'window-minimize']"/>
    </button>
    <button v-show="canMaximize && showMaximize && platform !== 'darwin'" class="window-button" @click="maximize">
      <fa :icon="['far', 'window-maximize']"/>
    </button>
    <button v-show="showRestore && platform !== 'darwin'" class="window-button" @click="restore">
      <fa :icon="['far', 'window-restore']"/>
    </button>
    <button v-show="showClose && platform !== 'darwin'" class="window-button close" @click="close">
      <fa :icon="['far', 'window-close']"/>
    </button>
    <button v-show="platform === 'darwin'" class="window-button drag">
      <fa icon="bars"/>
    </button>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import os from 'os'
  import electron from 'electron'

  const window = electron.remote.getCurrentWindow()

  export default {
    data () {
      return {
        platform: os.platform(),
        showMinimize: true,
        showMaximize: !window.isMaximized(),
        showRestore: window.isMaximized(),
        showClose: true
      }
    },
    computed: {
      ...mapState({
        personas: state => state.Store.personas,
        activity: state => state.Store.activity,
        systemSettings: state => state.Store.systemSettings
      })
    },
    mounted: function () {
      window.on('resize', (e) => {
        this.showMaximize = !window.isMaximized()
        this.showRestore = window.isMaximized()
      })
    },
    methods: {
      canMaximize () {
        return window.isResizable() && window.isMaximizable()
      },
      canMinimize () {
        return window.isMinimizable()
      },
      minimize () {
        window.minimize()
      },
      maximize () {
        window.maximize()
      },
      restore () {
        window.unmaximize()
      },
      close () {
        let personaCount = 0
        let tabCount = 0
        this.personas.forEach(persona => {
          const activity = this.activity[persona._id]
          personaCount = personaCount + (persona.isActive || activity.hasOpenTab ? 1 : 0)
          activity.tabs.forEach(tab => {
            tabCount = tabCount + (tab.url ? 1 : 0)
          })
        })
        if (tabCount > 0) {
          const message = `You are about to close ${tabCount} open tab${tabCount === 1 ? '' : 's'} in ${personaCount} persona${personaCount === 1 ? '' : 's'}. Are you sure you want to continue?`
          const dialogOptions = { title: 'Close Browser', type: 'question', buttons: ['Close', 'Cancel'], message }
          electron.remote.dialog.showMessageBox(dialogOptions, function (index) {
            if (index === 0) {
              window.close()
            }
          })
        } else {
          window.close()
        }
      }
    }
  }
</script>

<style scoped>

  .window-button {
    height: 100%;
    width: 45px;
  }

  .window-button:hover,
  .window-button:focus {
    background-color: #eee;
  }

  .window-button.close:hover {
    background-color: #e81123;
  }

  .window-button.drag {
    -webkit-app-region: drag;
  }

</style>
