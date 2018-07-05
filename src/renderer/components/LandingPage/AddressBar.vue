<template>
  <div class="address-bar-wrapper">
    <div class="address-bar">
      <button v-bind:class="['address-button', canGoBack() ? '' : 'disabled']" v-bind:tabindex="canGoBack() ? '0' : '-1'" v-on:click="goBack" v-bind:title="getBackHistory()">
        <fa icon="arrow-left"/>
      </button>
      <button v-bind:class="['address-button', canGoForward() ? '' : 'disabled']" v-bind:tabindex="canGoForward() ? '0' : '-1'" v-on:click="goForward" v-bind:title="getForwardHistory()">
        <fa icon="arrow-right"/>
      </button>
      <button class="address-button" v-on:click="goHome">
        <fa icon="home"/>
      </button>
      <div class="address-input">
        <input type="text" v-bind:id="'address-text-' + persona._id" v-model="activeTab.addressText" onfocus="this.select();" v-on:keypress="keyPressed">
      </div>
      <button class="address-button" v-on:click="editBookmark">
        <fa icon="star"/>
      </button>
      <button class="address-button" v-on:click="refresh">
        <fa icon="sync-alt"/>
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      persona: null,
      activeTab: null
    },
    methods: {
      // TODO: These should probably all emit events so they can be handled centrally
      canGoBack () {
        return this.activeTab.backHistory && this.activeTab.backHistory.length
      },
      goBack () {
        if (this.activeTab.backHistory.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          this.activeTab.forwardHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.url = this.activeTab.backHistory.pop().url
          this.activeTab.backHistoryNavigation = true
        }
      },
      getBackHistory () {
        return this.activeTab.backHistory ? this.activeTab.backHistory.map(function (item) { return item.url }).join('\n') : []
      },
      canGoForward () {
        return this.activeTab.forwardHistory && this.activeTab.forwardHistory.length
      },
      goForward () {
        if (this.activeTab.forwardHistory.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          if (!this.activeTab.forwardHistory) {
            this.activeTab.forwardHistory = []
          }
          this.activeTab.backHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.url = this.activeTab.forwardHistory.pop().url
          this.activeTab.backHistoryNavigation = true
        }
      },
      getForwardHistory () {
        return this.activeTab.forwardHistory ? this.activeTab.forwardHistory.map(function (item) { return item.url }).join('\n') : []
      },
      goHome () {
        if (this.activeTab) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          if (!this.activeTab.backHistory) {
            this.activeTab.backHistory = []
          }
          this.activeTab.backHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.forwardHistory = []
          this.activeTab.url = 'home'
          this.activeTab.addressText = 'home'
          this.activeTab.title = 'Home'
        }
      },
      keyPressed (e) {
        if (e.keyCode === 13) {
          if (this.activeTab) {
            // Might need to add http:// on the front there
            let url = this.activeTab.addressText.trim()
            if (url.indexOf('http://') !== 0) {
              url = 'http://' + url
            }
            this.activeTab.addressText = url

            if (this.activeTab.webview) {
              this.activeTab.webview.loadURL(url)
            } else {
              this.activeTab.initialUrl = url
              this.activeTab.url = url
            }
          }
        }
      },
      editBookmark () {
        // TODO:
      },
      refresh () {
        if (this.activeTab.webview) {
          this.activeTab.webview.reload()
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

  .address-button {
    border: inherit;
    background-color: inherit;
    border-radius: 2px;
    display: inline-block;
    padding: 0 10px;
  }

  .address-button:hover,
  .address-button:focus {
    background-color: #ddd;
  }

  .address-button.disabled {
    color: #bbb;
  }

  .address-button.disabled:hover {
    background-color: inherit;
  }

  .address-input {
    flex-grow: 1;
    padding: 0 5px;
  }

  .address-input > input {
    width: 100%;
  }

</style>
