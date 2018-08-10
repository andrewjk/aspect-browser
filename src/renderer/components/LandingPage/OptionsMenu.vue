<template>
  <div id="options-menu">
    <button class="options-menu-item" @click="editSettings" title="Edit application settings">
      <fa icon="cog"/>
      <span>Settings</span>
    </button>
    <button class="options-menu-item" @click="showHistory" title="Show browsing history for this persona">
      <fa icon="history"/>
      <span>History</span>
    </button>
    <button class="options-menu-item" @click="showAboutDialog" title="Show information about Aspect">
      <fa icon="info-circle"/>
      <span>About Aspect</span>
    </button>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { remote } from 'electron'

  export default {
    methods: {
      ...mapMutations([
        'editSettings',
        'showHistory',
        'openInTab'
      ]),
      showAboutDialog: function () {
        let win = new remote.BrowserWindow({
          width: 480,
          height: 280,
          resizable: false,
          minimizable: false,
          webPreferences: {
            devTools: false
          }
        })
        win.setMenu(null)
        win.on('closed', () => {
          win = null
        })
        win.webContents.on('openSite', (url) => {
          this.openInTab({ url, background: false })
          win.close()
        })
        const winurl = process.env.NODE_ENV === 'development'
          ? `http://localhost:9080/#/about`
          : `file://${__dirname}/index.html#about`
        win.loadURL(winurl)
      }
    }
  }
</script>

<style scoped>

  #options-menu {
    border: 1px solid #ddd;
    border-radius: 2px;
    background-color: white;
    position: absolute;
    right: 3px;
    top: 65px;
    min-width: 200px;
    padding: 4px 0;
  }

  .options-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 6px;
  }

  .options-menu-item:hover,
  .options-menu-item:focus {
    background-color: #eee;
  }

</style>