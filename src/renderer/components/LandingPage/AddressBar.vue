<template>
  <div class="address-bar-wrapper">
    <div class="address-bar">
      <button :class="['address-button', canGoBack() ? '' : 'disabled']" :tabindex="canGoBack() ? '0' : '-1'" @click="goBack({ persona, tab: getActiveTab })" :title="getBackHistory()">
        <fa icon="arrow-left"/>
      </button>
      <button :class="['address-button', canGoForward() ? '' : 'disabled']" :tabindex="canGoForward() ? '0' : '-1'" @click="goForward({ persona, tab: getActiveTab })" :title="getForwardHistory()">
        <fa icon="arrow-right"/>
      </button>
      <button class="address-button" @click="goHome(getActiveTab)" title="Open the home page for this persona">
        <fa icon="home"/>
      </button>
      <div class="address-input">
        <input type="text" :id="'address-text-' + persona._id" v-model="addressText" onfocus="this.select();" @keypress="keyPressed" placeholder="Search or enter an address" title="The address bar, where you can type something to search for or enter a Web address">
      </div>
      <button class="address-button" @click="addBookmark({ persona, url: getActiveTab.url, title: getActiveTab.title, icon: getActiveTab.icon })" title="Add the current page to this persona's bookmarks">
        <fa icon="star"/>
      </button>
      <button v-if="getActiveTab.isLoading" class="address-button" @click="stopLoad" title = "Stop loading the current page">
        <fa icon="times"/>
      </button>
      <button v-else class="address-button" @click="reload" title = "Reload the current page">
        <fa icon="sync-alt"/>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations } from 'vuex'

  export default {
    props: {
      persona: null
    },
    computed: {
      ...mapState({
        activity: state => state.Store.activity,
        settings: state => state.Store.settings
      }),
      ...mapGetters([
        'getActiveTab'
      ]),
      // Computed properties for v-model binding
      addressText: {
        get () {
          return this.getActiveTab.addressText
        },
        set (value) {
          this.setTabDetails({ persona: this.persona, tab: this.getActiveTab, addressText: value })
        }
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addBookmark',
        'goBack',
        'goForward',
        'goToUrl',
        'goHome'
      ]),
      canGoBack () {
        const tab = this.getActiveTab
        return tab.backHistory && tab.backHistory.length
      },
      getBackHistory () {
        const tab = this.getActiveTab
        return tab.backHistory ? tab.backHistory.map(function (item) { return item.title }).reverse().join('\n') : []
      },
      canGoForward () {
        const tab = this.getActiveTab
        return tab.forwardHistory && tab.forwardHistory.length
      },
      getForwardHistory () {
        const tab = this.getActiveTab
        return tab.forwardHistory ? tab.forwardHistory.map(function (item) { return item.title }).join('\n') : []
      },
      keyPressed (e) {
        if (e.keyCode === 13) {
          let tab = this.getActiveTab
          let url = tab.addressText.trim()
          if (url) {
            this.goToUrl({ tab, url })
          } else {
            this.goHome(tab)
          }
        }
      },
      stopLoad () {
        const tab = this.getActiveTab
        if (tab.webview) {
          tab.webview.stop()
        }
      },
      reload () {
        const tab = this.getActiveTab
        if (tab.webview) {
          tab.webview.reload()
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
