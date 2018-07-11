<template>
  <div class="tab-page-wrapper">
      <webview :id="tab._id" class="tab-page-view" :partition="getPartition()" :src="initialUrl" :preload="preload"></webview>
      <div class="target-url" v-show="targetUrl">{{ targetUrl }}</div>
  </div>
</template>

<script>
  import path from 'path'

  export default {
    props: {
      tab: null,
      partition: ''
    },
    data () {
      return {
        // HACK: We need to set src to something so that the webview initializes correctly, but we only want to set it once
        // If we set <webview src="tab.url">, Vue reloads the component every time the url changes
        initialUrl: this.tab.url,
        targetUrl: '',
        // Per https://github.com/SimulatedGREG/electron-vue/issues/239
        preload: 'file://' + path.join(__static, '/webview-preload.js')
      }
    },
    mounted: function () {
      const webview = document.getElementById(this.tab._id)

      this.tab.webview = webview

      // TODO: Should probably use did-navigate and did-navigate-in-page for history?

      // Listen to webview events
      webview.addEventListener('did-start-loading', this.loadStarted)
      webview.addEventListener('did-stop-loading', this.loadFinished)
      webview.addEventListener('did-fail-load', this.loadFailed)

      webview.addEventListener('page-title-updated', this.pageTitleUpdated)
      webview.addEventListener('page-favicon-updated', this.pageIconUpdated)
      webview.addEventListener('update-target-url', this.targetUrlUpdated)

      webview.addEventListener('will-navigate', this.willNavigate)
      webview.addEventListener('did-navigate', this.didNavigate)
      webview.addEventListener('did-navigate-in-page', this.didNavigateInPage)

      webview.addEventListener('new-window', this.newWindow)

      // Add a context menu to the webview
    },
    methods: {
      getPartition () {
        return 'persist:' + this.partition
      },
      loadStarted () {
        console.log('load started')
        this.tab.isLoading = true
      },
      loadFinished () {
        console.log('load finished: ' + this.tab.webview.getURL())

        // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
        if (!this.tab.backHistoryNavigation) {
          this.tab.backHistory.push({
            url: this.tab.url,
            title: this.tab.title
          })
          this.tab.forwardHistory = []
        }
        this.tab.backHistoryNavigation = false

        const url = this.tab.webview.getURL()
        const title = this.tab.webview.getTitle()

        this.tab.isLoading = false
        this.tab.url = url
        this.tab.addressText = url
        this.tab.title = title
      },
      loadFailed () {
        console.log('load failed: ' + this.tab.webview.getURL())

        // TODO: What should I actually be doing here?
        this.tab.isLoading = false
      },
      pageTitleUpdated (e) {
        this.tab.title = e.title
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
          this.tab.icon = icon
        }
      },
      targetUrlUpdated (e) {
        this.targetUrl = e.url
      },
      willNavigate () {
        // TODO:
      },
      didNavigate () {
        // TODO:
      },
      didNavigateInPage () {
        // TODO:
      },
      newWindow (e) {
        // Do things further up the chain
        this.$emit('open-new-window', e.url, e.disposition === 'background-tab')
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
  }

</style>
