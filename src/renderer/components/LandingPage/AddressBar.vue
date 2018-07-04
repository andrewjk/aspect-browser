<template>
  <div class="address-bar-wrapper">
    <div class="address-bar">
      <a v-bind:class="['button', canGoBack() ? '' : 'disabled']" v-on:click="goBack" v-bind:title="getHistory()">
        <fa icon="arrow-left"/>
      </a>
      <a v-bind:class="['button', canGoForward() ? '' : 'disabled']" v-on:click="goForward" v-bind:title="getForwardHistory()">
        <fa icon="arrow-right"/>
      </a>
      <a class="button" v-on:click="goHome">
        <fa icon="home"/>
      </a>
      <div class="address">
        <input type="text" id="address-text" v-bind:value="getUrl()" v-on:keypress="keyPressed">
      </div>
      <a class="button" v-on:click="editBookmark">
        <fa icon="star"/>
      </a>
      <a class="button" v-on:click="refresh">
        <fa icon="sync-alt"/>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      persona: null
    },
    methods: {
      // TODO: These should all emit events so they can be handled centrally
      getActiveTab () {
        return this.persona.tabs.find(function (item) {
          return item.isActive
        })
      },
      getUrl () {
        const activeTab = this.getActiveTab()
        return activeTab ? activeTab.url : 'ERROR'
      },
      canGoBack () {
        const activeTab = this.getActiveTab()
        return activeTab.history.length
      },
      goBack () {
        const activeTab = this.getActiveTab()
        if (activeTab.history.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          activeTab.forwardHistory.push({
            url: activeTab.url,
            title: activeTab.title
          })
          activeTab.url = activeTab.history.pop().url
          activeTab.historyNavigation = true
        }
      },
      getHistory () {
        const activeTab = this.getActiveTab()
        return activeTab.history.map(function (item) { return item.url }).join('\n')
      },
      canGoForward () {
        const activeTab = this.getActiveTab()
        return activeTab.forwardHistory.length
      },
      goForward () {
        const activeTab = this.getActiveTab()
        if (activeTab.forwardHistory.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          activeTab.history.push({
            url: activeTab.url,
            title: activeTab.title
          })
          activeTab.url = activeTab.forwardHistory.pop().url
          activeTab.historyNavigation = true
        }
      },
      getForwardHistory () {
        const activeTab = this.getActiveTab()
        return activeTab.forwardHistory.map(function (item) { return item.url }).join('\n')
      },
      goHome () {
        const activeTab = this.getActiveTab()
        if (activeTab) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          activeTab.history.push({
            url: activeTab.url,
            title: activeTab.title
          })
          activeTab.forwardHistory = []
          activeTab.url = 'home'
        }
      },
      keyPressed (e) {
        if (e.keyCode === 13) {
          const activeTab = this.getActiveTab()
          if (activeTab) {
            const url = document.getElementById('address-text').value
            activeTab.initialUrl = url
            activeTab.url = url
          }
        }
      },
      editBookmark () {
        // TODO:
      },
      refresh () {
        const activeTab = this.getActiveTab()
        if (activeTab.webview) {
          activeTab.webview.reload()
        }
      }
    }
  }
</script>

<style scoped>

  .address-bar-wrapper {
    background-color: #eee;
    height: 34px;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
    padding: 4px;
  }

  .address-bar {
    display: flex;
    line-height: 24px;
  }

  .button {
    border-radius: 2px;
    display: inline-block;
    padding: 0 10px;
  }

  .button:hover {
    background-color: #ddd;
  }

  .button.disabled {
    color: #bbb;
  }

  .button.disabled:hover {
    background-color: inherit;
  }

  .address {
    flex-grow: 1;
    padding: 0 10px;
  }

  .address > input {
    width: 100%;
  }

</style>
