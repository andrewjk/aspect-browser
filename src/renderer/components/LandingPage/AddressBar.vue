<template>
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
    <button class="address-button" @click="toggleOptionsMenu" title = "Open the options menu">
      <fa icon="ellipsis-v"/>
    </button>
    <options-menu v-show="showOptionsMenu" @close-options-menu="toggleOptionsMenu"></options-menu>
    <button v-if="updateExists" class="address-button" @click="getUpdate" title = "There is an updated version available">
      <fa icon="external-link-alt"/>
    </button>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
  import octokitrest from '@octokit/rest'
  import { remote, shell } from 'electron'
  import semver from 'semver'

  import OptionsMenu from './OptionsMenu'

  const octokit = octokitrest()

  export default {
    components: { OptionsMenu },
    props: {
      persona: null
    },
    data () {
      return {
        updateExists: false,
        updateUrl: '',
        showOptionsMenu: false
      }
    },
    computed: {
      ...mapState({
        activity: state => state.Store.activity,
        systemSettings: state => state.Store.systemSettings
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
    mounted: function () {
      // HACK: Give it time to load the system settings database
      setInterval(() => {
        this.updateExists = this.systemSettings.updateExists
        this.checkUpdate()
      }, 100)
    },
    beforeUpdate: function () {
      this.checkUpdate()
    },
    updated: function () {
      // HACK: Is this a good way to do this?
      if (this.showOptionsMenu) {
        document.removeEventListener('click', this.toggleOptionsMenu)
        document.addEventListener('click', this.toggleOptionsMenu)
      } else {
        document.removeEventListener('click', this.toggleOptionsMenu)
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addBookmark',
        'goBack',
        'goForward',
        'goToUrl',
        'goHome',
        'setUpdateChecked',
        'setUpdateExists'
      ]),
      ...mapActions([
        'saveSystemSettings'
      ]),
      canGoBack () {
        const tab = this.getActiveTab
        return tab.backHistory && tab.backHistory.length
      },
      getBackHistory () {
        const tab = this.getActiveTab
        return tab.backHistory ? tab.backHistory.map((item) => { return item.title }).reverse().join('\n') : []
      },
      canGoForward () {
        const tab = this.getActiveTab
        return tab.forwardHistory && tab.forwardHistory.length
      },
      getForwardHistory () {
        const tab = this.getActiveTab
        return tab.forwardHistory ? tab.forwardHistory.map((item) => { return item.title }).join('\n') : []
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
      },
      toggleOptionsMenu () {
        this.showOptionsMenu = !this.showOptionsMenu
      },
      checkUpdate () {
        const updateChecked = this.systemSettings.updateChecked
        const now = new Date()
        const timeToCheck = 60 * 60 * 1000 // Check once an hour
        if (!updateChecked || now.getTime() - updateChecked.getTime() > timeToCheck) {
          this.setUpdateChecked(new Date())
          this.saveSystemSettings({ db: this.$ssdb, systemSettings: this.systemSettings })

          // Sample code from https://github.com/octokit/rest.js/blob/master/examples/getReleaseAsset.js
          octokit.repos.getReleases({
            owner: 'andrewjk',
            repo: 'aspect-browser'
          }).then(result => {
            if (result.data.length === 0) {
              console.log('repository has no releases')
              return
            }

            const release = result.data[0]
            const version = release.tag_name.replace('v', '')
            const localVersion = remote.app.getVersion()
            if (semver.gt(version, localVersion)) {
              console.log('checked for updates ' + version + ' vs ' + localVersion + ' - update exists')
              this.updateExists = true
              this.updateUrl = release.html_url
            } else {
              console.log('checked for updates ' + version + ' vs ' + localVersion + ' - no update found')
              this.updateExists = false
            }
            this.setUpdateExists({ updateExists: this.updateExists, oldVersion: localVersion })
            this.saveSystemSettings({ db: this.$ssdb, systemSettings: this.systemSettings })
          })
        }
      },
      getUpdate () {
        // TODO: Open inside our browser when downloads are working. We could also automatically indicate/download the appropriate package for the current OS?
        shell.openExternal(this.updateUrl)
      }
    }
  }
</script>

<style scoped>

  .address-bar {
    background-color: #eee;
    height: 34px;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
    padding: 4px;
    overflow: visible;
    display: flex;
    line-height: 26px;
    z-index: 9999;
  }

  .address-button {
    background-color: inherit;
    border-radius: 2px;
    display: inline-block;
    padding: 0 10px;
    height: 26px;
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
