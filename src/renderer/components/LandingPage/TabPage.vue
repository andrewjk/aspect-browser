<template>
  <div class="tab-page-wrapper">
      <webview :id="tab._id" class="tab-page-view" :partition="getPartition()" :src="initialUrl" :preload="preload"></webview>
      <div :class="['target-url', showTargetUrl ? 'visible' : '']">{{ targetUrl }}</div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'

  import electron from 'electron'
  import path from 'path'
  import Encrypter from '../../data/Encrypter'

  export default {
    props: {
      persona: null,
      tab: null
    },
    data () {
      return {
        // HACK: We need to set src to something so that the webview initializes correctly, but we only want to set it once
        // If we set <webview src="tab.url">, Vue reloads the component every time the url changes
        initialUrl: this.tab.url,
        previousUrl: '',
        historyUrl: '',
        targetUrl: '',
        targetUrlInterval: 0,
        showTargetUrl: false,
        // Per https://github.com/SimulatedGREG/electron-vue/issues/239
        preload: 'file://' + path.join(__static, '/webview-preload.js')
      }
    },
    mounted: function () {
      const webview = document.getElementById(this.tab._id)

      this.setTabDetails({ persona: this.persona, tab: this.tab, webview })

      // Focus the webview when the tab page has been mounted e.g. after a bookmark has been clicked
      // or the user types something in the address bar in the home page
      webview.focus()

      // Listen to webview events
      webview.addEventListener('did-start-loading', this.loadStarted)
      webview.addEventListener('load-commit', this.loadCommitted)
      webview.addEventListener('did-stop-loading', this.loadFinished)
      webview.addEventListener('did-fail-load', this.loadFailed)

      webview.addEventListener('page-title-updated', this.pageTitleUpdated)
      webview.addEventListener('page-favicon-updated', this.pageIconUpdated)
      webview.addEventListener('update-target-url', this.targetUrlUpdated)

      webview.addEventListener('will-navigate', this.willNavigate)
      webview.addEventListener('did-navigate', this.didNavigate)
      webview.addEventListener('did-navigate-in-page', this.didNavigateInPage)

      webview.addEventListener('new-window', this.newWindow)

      // Listen to console messages from within the webview (handy for debugging the webview-preload script)
      webview.addEventListener('console-message', (e) => {
        console.log('WEBVIEW:', e.message)
      })

      // Set up password management for forms with password fields
      electron.remote.ipcMain.on('form-found-with-password', (event, data) => {
        // Load the existing username/password
        const db = this.$ldb
        const form = data.form
        const personaId = this.persona._id
        const host = data.host

        // Maybe load the logins database
        console.log('logins db loaded?', this.$ldb.persistence.isLoaded)
        if (!this.$ldb.persistence.isLoaded) {
          this.$swal({
            title: 'Password Required',
            text: 'Enter your master password:',
            input: 'text'
          })
            .then((result) => {
              if (result.value) {
                // TODO: Check if it's correct...
                const crypt = new Encrypter(result.value)
                this.$ldb.persistence.afterSerialization = crypt.encrypt
                this.$ldb.persistence.beforeDeserialization = crypt.decrypt
                this.$ldb.loadDatabase((err) => {
                  if (err) {
                    alert('ERROR: ' + err)
                    return
                  }
                  this.$ldb.persistence.isLoaded = true
                  // TODO: to function
                  this.loadLoginDetails({ db, personaId, host })
                    .then((result) => {
                      if (result && result.fields) {
                        event.sender.send('form-password-fill', { form, fields: result.fields })
                      }
                    })
                    .catch((error) => {
                      alert('ERROR', error)
                    })
                })
              } else {
                // Just do nothing?
              }
            })
            .catch((err) => {
              alert('ERROR: ' + err)
            })
        } else {
          // TODO: to function
          this.loadLoginDetails({ db, personaId, host })
            .then((result) => {
              if (result && result.fields) {
                event.sender.send('form-password-fill', { form, fields: result.fields })
              }
            })
            .catch((error) => {
              alert('ERROR', error)
            })
        }
      })
      electron.remote.ipcMain.on('form-submitted-with-password', (event, data) => {
        // TODO: Prompt the user to save this username/password
        const db = this.$ldb
        const personaId = this.persona._id
        const host = data.host
        const fields = data.fields
        this.saveLoginDetails({ db, personaId, host, fields })
          .catch((error) => {
            alert('ERROR', error)
          })
      })

      // TODO: Add a context menu to the webview
    },
    updated: function () {
      // Focus the webview when the URL has changed e.g. when the user has clicked a link or typed something
      // in the address bar
      if (this.tab.url !== this.previousUrl) {
        const webview = document.getElementById(this.tab._id)
        webview.focus()
        this.previousUrl = this.tab.url
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'openInTab',
        'addToHistory'
      ]),
      ...mapActions([
        'saveToHistory',
        'loadLoginDetails',
        'saveLoginDetails'
      ]),
      getPartition () {
        return 'persist:' + this.persona._id
      },
      loadStarted () {
        console.log('load started')
        this.setTabDetails({ persona: this.persona, tab: this.tab, isLoading: true })
      },
      loadCommitted () {
        console.log('load committed')
        const url = this.tab.webview.getURL()
        const title = this.tab.webview.getTitle()
        this.setTabDetails({ persona: this.persona, tab: this.tab, url, addressText: url, title })
      },
      loadFinished () {
        console.log('load finished: ' + this.tab.webview.getURL())
        this.setTabDetails({ persona: this.persona, tab: this.tab, isLoading: false })
        if (this.tab.url !== this.historyUrl) {
          console.log('adding to history')
          this.saveToHistory({
            db: this.$hdb,
            personaId: this.persona._id,
            url: this.tab.url,
            icon: this.tab.icon,
            title: this.tab.title
          })
        }
        this.historyUrl = this.tab.url
      },
      loadFailed () {
        console.log('load failed: ' + this.tab.webview.getURL())
        // TODO: What should I actually be doing here?
        this.setTabDetails({ persona: this.persona, tab: this.tab, isLoading: false })
      },
      pageTitleUpdated (e) {
        this.setTabDetails({ persona: this.persona, tab: this.tab, title: e.title })
      },
      pageIconUpdated (e) {
        if (e.favicons.length) {
          let icon
          e.favicons.forEach(function (item) {
            if (item.indexOf('.ico') > 0) {
              icon = item
            }
          })
          if (!icon) {
            icon = e.favicons[0]
          }
          this.setTabDetails({ persona: this.persona, tab: this.tab, icon })
        }
      },
      targetUrlUpdated (e) {
        if (this.targetUrlInterval) {
          clearTimeout(this.targetUrlInterval)
        }
        if (e.url && this.showTargetUrl) {
          // If there's already a url being displayed, just update it
          this.targetUrl = e.url
          this.showTargetUrl = true
        } else {
          // There's either a new URL to show, or no URL now, so show or hide the url after an interval
          this.targetUrlInterval = setTimeout(() => {
            if (e.url) {
              this.targetUrl = e.url
            }
            this.showTargetUrl = !!e.url
          }, 200)
        }
      },
      willNavigate () {
        // TODO:
        console.log('will navigate')
        this.addToHistory({ tab: this.tab, url: this.tab.url, title: this.tab.title })
      },
      didNavigate () {
        // TODO:
        console.log('did navigate')
      },
      didNavigateInPage () {
        // TODO:
        console.log('did navigate in page')
      },
      newWindow (e) {
        this.openInTab({ url: e.url, background: e.disposition === 'background-tab' })
      }
    }
  }
</script>

<style scoped>
  
  .tab-page-wrapper {
    height: 100%;
    width: 100%;
  }

  .tab-page-view {
    height: 100%;
    width: 100%;
  }

  .target-url {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: #f8f8f8;
    color: #444;
    font-size: 12px;
    border-top: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-top-right-radius: 2px;
    padding: 4px 4px 2px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .target-url.visible {
    opacity: 1;
  }

</style>
