<template>
  <div class="window-buttons-wrapper">
    <button v-show="canMinimize && showMinimize" class="window-button" @click="minimize">
      <fa :icon="['far', 'window-minimize']"/>
    </button>
    <button v-show="canMaximize && showMaximize" class="window-button" @click="maximize">
      <fa :icon="['far', 'window-maximize']"/>
    </button>
    <button v-show="showRestore" class="window-button" @click="restore">
      <fa :icon="['far', 'window-restore']"/>
    </button>
    <button v-show="showClose" class="window-button close" @click="close">
      <fa :icon="['far', 'window-close']"/>
    </button>
  </div>
</template>

<script>
  import electron from 'electron'

  const window = electron.remote.getCurrentWindow()

  export default {
    data () {
      return {
        showMinimize: true,
        showMaximize: !window.isMaximized(),
        showRestore: window.isMaximized(),
        showClose: true
      }
    },
    mounted: function () {
      window.resize = (e) => {
        this.showMaximize = !window.isMaximized()
        this.showRestore = window.isMaximized()
      }
      // TODO: This doesn't seem to fire
      window.move = (e) => {
        this.showMaximize = !window.isMaximized()
        this.showRestore = window.isMaximized()
      }
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
        this.showMaximize = false
        this.showRestore = true
      },
      restore () {
        window.unmaximize()
        this.showMaximize = true
        this.showRestore = false
      },
      close () {
        window.close()
      }
    }
  }
</script>

<style scoped>

  .window-button {
    height: 100%;
    padding: 1px 16px;
  }

  .window-button:hover,
  .window-button:focus {
    background-color: #eee;
  }

  .window-button.close:hover {
    background-color: #e81123;
  }

</style>