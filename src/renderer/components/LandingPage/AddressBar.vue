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
    <address-input :persona="persona"></address-input>
    <button class="address-button" @click="addBookmark({ db: $pdb, persona, url: getActiveTab.url, title: getActiveTab.title, icon: getActiveTab.icon })" title="Add the current page to this persona's bookmarks">
      <fa icon="star"/>
    </button>
    <button v-if="getActiveTab.isLoading" class="address-button" @click="stopLoad" title = "Stop loading the current page">
      <fa icon="times"/>
    </button>
    <button v-else class="address-button" @click="reload" title = "Reload the current page">
      <fa icon="sync-alt"/>
    </button>
    <button class="address-button" @click.stop="toggleOptionsMenu" title = "Open the options menu">
      <fa icon="ellipsis-v"/>
    </button>
    <options-menu v-show="showOptionsMenu" :persona="persona"></options-menu>
    <button v-if="updateExists" class="address-button" @click="getUpdate" title = "There is an updated version available">
      <fa icon="external-link-alt"/>
    </button>
    <login-menu v-show="showLoginMenu" :persona="persona"></login-menu>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
  import octokitrest from '@octokit/rest'
  import { remote, shell } from 'electron'
  import semver from 'semver'

  import AddressInput from './AddressInput'
  import OptionsMenu from './OptionsMenu'
  import LoginMenu from './LoginMenu'

  const octokit = octokitrest()

  export default {
    components: { AddressInput, OptionsMenu, LoginMenu },
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
        systemSettings: state => state.SystemSettings.settings,
        showLoginMenu: state => state.Logins.showLoginMenu
      }),
      ...mapGetters([
        'getActiveTab'
      ])
    },
    mounted () {
      // HACK: Give it time to load the system settings database
      setTimeout(() => {
        this.updateExists = this.systemSettings.updateExists
        this.checkUpdate()
      }, 100)
    },
    beforeUpdate () {
      this.checkUpdate()
    },
    updated () {
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
        'goBack',
        'goForward',
        'goHome',
        'setUpdateChecked',
        'setUpdateExists'
      ]),
      ...mapActions([
        'saveSystemSettings',
        'addBookmark'
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
      checkUpdate (force) {
        const updateChecked = this.systemSettings.updateChecked
        const now = new Date()
        const timeToCheck = 60 * 60 * 1000 // Check once an hour
        const needsCheckDueToTime = !updateChecked || !updateChecked.getTime || now.getTime() - updateChecked.getTime() > timeToCheck

        const updateCheckedVersion = this.systemSettings.updateCheckedVersion
        const localVersion = remote.app.getVersion()
        const needsCheckDueToVersion = !updateCheckedVersion || updateCheckedVersion !== localVersion

        if (needsCheckDueToTime || needsCheckDueToVersion) {
          this.setUpdateChecked({ updateChecked: now, updateCheckedVersion: localVersion })
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
            if (semver.gt(version, localVersion)) {
              console.log('checked for updates ' + version + ' vs ' + localVersion + ' - update exists')
              this.updateExists = true
              this.updateUrl = release.html_url
            } else {
              console.log('checked for updates ' + version + ' vs ' + localVersion + ' - no update found')
              this.updateExists = false
            }
            this.setUpdateExists({ updateExists: this.updateExists })
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

</style>
