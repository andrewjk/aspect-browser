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
  import errors from 'chrome-network-errors'
  import registerContextMenu from 'electron-context-menu'
  import { download } from 'electron-dl'

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
    mounted () {
      const webview = document.getElementById(this.tab._id)

      this.setTabDetails({ persona: this.persona, tab: this.tab, webview })

      // Focus the webview when the tab page has been mounted e.g. after a bookmark has been clicked
      // or the user types something in the address bar in the home page
      webview.focus()

      this.setupWebviewListeners(webview)
    },
    updated () {
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
        'saveToActivity',
        'updateActivity'
      ]),
      getPartition () {
        return 'persist:' + this.persona._id
      },
      loadStarted () {
        // console.log('load started')
        this.setTabDetails({ persona: this.persona, tab: this.tab, isLoading: true })
      },
      loadCommitted () {
        // console.log('load committed')
        const url = this.tab.webview.getURL()
        const title = this.tab.webview.getTitle()
        this.setTabDetails({ persona: this.persona, tab: this.tab, url, addressText: url, title })
      },
      loadFinished () {
        // console.log('load finished: ' + this.tab.webview.getURL())
        this.setTabDetails({ persona: this.persona, tab: this.tab, isLoading: false })
        if (this.tab.url !== this.historyUrl) {
          // console.log('adding to history')
          this.saveToHistory({
            db: this.$hdb,
            personaId: this.persona._id,
            url: this.tab.url,
            icon: this.tab.icon,
            title: this.tab.title
          })
          if (this.tab.activityId) {
            this.updateActivity({
              db: this.$adb,
              activityId: this.tab.activityId,
              url: this.tab.url,
              icon: this.tab.icon,
              title: this.tab.title
            })
          } else {
            this.saveToActivity({
              db: this.$adb,
              personaId: this.persona._id,
              url: this.tab.url,
              icon: this.tab.icon,
              title: this.tab.title,
              index: this.tab.index
            }).then((_id) => {
              this.tab.activityId = _id
            })
          }
        }
        this.historyUrl = this.tab.url
      },
      loadFailed (e) {
        this.setTabDetails({
          persona: this.persona,
          tab: this.tab,
          isLoading: false,
          url: 'aspect://error',
          title: 'Error',
          errorCode: e.errorCode,
          errorDescription: errors[e.errorCode],
          webview: null
        })
      },
      pageTitleUpdated (e) {
        this.setTabDetails({ persona: this.persona, tab: this.tab, title: e.title })
      },
      pageIconUpdated (e) {
        if (e.favicons.length) {
          let icon
          e.favicons.forEach((item) => {
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
        // console.log('will navigate')
        this.addToHistory({ tab: this.tab, url: this.tab.url, title: this.tab.title })
      },
      didNavigate () {
        // TODO:
        // console.log('did navigate')
      },
      didNavigateInPage () {
        // TODO:
        // console.log('did navigate in page')
      },
      newWindow (e) {
        this.openInTab({ url: e.url, background: e.disposition === 'background-tab' })
      },
      setupWebviewListeners (webview) {
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
        // But only listen to messages that start with a $ because those will be the ones that we have made
        webview.addEventListener('console-message', (e) => {
          if (e.message.indexOf('$') === 0) {
            console.log('WEBVIEW:', e.message.substring(1))
          }
        })

        // HACK: We need to get personaId into the webview preload somehow, so that it knows whether
        // to handle login details that are sent to it, and so that it can send events to the listeners
        // for that persona. We can't just pass parameters into preload, so instead we have to do this
        // hacky back and forth to put the id into document.__personaId using executeJavascript()
        electron.remote.ipcMain.on('persona-id-needed', (event, data) => {
          const personaId = this.persona._id
          const javascript = `document.__personaId = "${personaId}"`
          webview.executeJavaScript(javascript, false, () => {
            event.sender.send('persona-id-available')
          })
        })

        // Add a context menu to the webview (after it's ready so that the context-menu event gets intercepted correctly)
        webview.addEventListener('dom-ready', () => {
          registerContextMenu({
            window: webview,
            append: (params, browserWindow) => [{
              id: 'saveAs',
              label: 'Save Link As',
              click (item, win) {
                // TODO: Get the actual file name and mime type, rather than the link location (e.g. it might actually be index.html)
                const defaultFolder = electron.remote.app.getPath('downloads')
                const defaultFile = path.basename(params.linkURL)
                const defaultPath = path.join(defaultFolder, defaultFile)
                electron.remote.dialog.showSaveDialog(null, { defaultPath }, (file) => {
                  const directory = path.dirname(file)
                  const filename = path.basename(file)
                  download(win, params.linkURL, { directory, filename })
                })
              },
              visible: params.linkURL && params.mediaType === 'none'
            }]
          })
        })
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
