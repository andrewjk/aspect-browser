<template>
  <div class="tab-page-wrapper">
      <webview v-bind:src="tab.initialUrl" class="tab-page-view" v-bind:id="tab._id" v-bind:partition="getPartition()"></webview>
  </div>
</template>

<script>
  export default {
    props: {
      tab: null,
      partition: ''
    },
    mounted: function () {
      const webview = document.getElementById(this.tab._id)

      this.tab.webview = webview

      // TODO: Should probably use did-navigate and did-navigate-in-page for history?

      webview.addEventListener('did-start-loading', this.loadStarted)
      webview.addEventListener('did-stop-loading', this.loadFinished)
      webview.addEventListener('did-fail-load', this.loadFailed)

      webview.addEventListener('page-title-updated', this.pageTitleUpdated)
      webview.addEventListener('page-favicon-updated', this.pageIconUpdated)
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

        const url = this.tab.webview.getURL()
        const title = this.tab.webview.getTitle()

        // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
        if (!this.tab.backHistoryNavigation) {
          this.tab.backHistory.push({
            url: this.tab.url,
            title: this.tab.title
          })
          this.tab.forwardHistory = []
        }
        this.tab.backHistoryNavigation = false

        this.tab.isLoading = false
        this.tab.url = url
        this.tab.initialUrl = url
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
        this.tab.icon = e.favicons[0]
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

</style>
