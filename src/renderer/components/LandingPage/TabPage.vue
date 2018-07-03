<template>
  <div class="tab-page-wrapper">
      <webview v-bind:src="tab.initialUrl" class="tab-page-view" v-bind:id="tab.id" v-bind:partition="getPartition()"></webview>
  </div>
</template>

<script>
  export default {
    props: {
      tab: null,
      partition: ''
    },
    mounted: function () {
      const webview = document.getElementById(this.tab.id)

      this.tab.webview = webview

      webview.addEventListener('did-start-loading', this.loadStarted)
      webview.addEventListener('did-finish-load', this.loadFinished)
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
        if (!this.tab.historyNavigation) {
          this.tab.history.push({
            url: this.tab.url,
            title: this.tab.title
          })
          this.tab.forwardHistory = []
        }
        this.tab.historyNavigation = false

        this.tab.isLoading = false
        this.tab.url = url
        this.tab.title = title
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
