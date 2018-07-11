<template>
  <div class="address-bar-wrapper">
    <div class="address-bar">
      <button :class="['address-button', canGoBack() ? '' : 'disabled']" :tabindex="canGoBack() ? '0' : '-1'" @click="goBack" :title="getBackHistory()">
        <fa icon="arrow-left"/>
      </button>
      <button :class="['address-button', canGoForward() ? '' : 'disabled']" :tabindex="canGoForward() ? '0' : '-1'" @click="goForward" :title="getForwardHistory()">
        <fa icon="arrow-right"/>
      </button>
      <button class="address-button" @click="goHome" title="Open the home page for this persona">
        <fa icon="home"/>
      </button>
      <div class="address-input">
        <input type="text" :id="'address-text-' + persona._id" v-model="activeTab.addressText" onfocus="this.select();" @keypress="keyPressed" title="Type a URL or something to search for">
      </div>
      <button class="address-button" @click="editBookmark" title="Edit the current bookmark">
        <fa icon="star"/>
      </button>
      <button class="address-button" @click="refresh" title = "Reload the current page">
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
    data () {
      return {
        isTextSelected: false
      }
    },
    beforeUpdate: function () {
      // HACK: In various places we set some text and call select() on the address text box, which gets overridden when redrawing
      // This is the only way I can figure out how to maintain the selection before and after redrawing
      const box = document.getElementById('address-text-' + this.persona._id)
      this.isTextSelected = box.selectionStart === 0 && box.selectionEnd === box.value.length
    },
    updated: function () {
      if (this.isTextSelected) {
        const box = document.getElementById('address-text-' + this.persona._id)
        box.select()
        this.isTextSelected = false
      }
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
            let url = this.activeTab.addressText.trim()
            if (url.indexOf('.') !== -1 && url.indexOf(' ') === -1) {
              // If it has a dot and no spaces, treat it as a URL
              // Might need to add http:// on the front there
              if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                url = 'https://' + url
              }
            } else {
              // Search for whatever was typed in
              url = 'https://duckduckgo.com/?q=' + url
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
