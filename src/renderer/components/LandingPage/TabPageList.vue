<template>
  <div class="tab-page-list-wrapper">
      <div v-for="(item, index) in tabs" :key="item._id" class="tab-page-list-item" :style="{ zIndex: getZIndex(index) }">
        <template v-if="item.isSuspended">
          <suspended-page></suspended-page>
        </template>
        <template v-else-if="item.url === 'aspect://home'">
          <home-page :persona="persona" :tabs="tabs" :show-welcome="showWelcome"></home-page>
        </template>
        <template v-else-if="item.url === 'aspect://history'">
          <history-page :persona="persona" :tabs="tabs"></history-page>
        </template>
        <template v-else-if="item.url === 'aspect://downloads'">
          <downloads-page :persona="persona" :tabs="tabs"></downloads-page>
        </template>
        <template v-else-if="item.url === 'aspect://logins'">
          <logins-page :persona="persona" :tabs="tabs"></logins-page>
        </template>
        <template v-else-if="item.url === 'aspect://settings'">
          <settings-page></settings-page>
        </template>
        <template v-else-if="item.url === 'aspect://error'">
          <error-page :persona="persona" :tabs="tabs"></error-page>
        </template>
        <template v-else>
          <tab-page :persona="persona" :tab="item"></tab-page>
        </template>
      </div>
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import AlertDialog from '../Dialogs/AlertDialog'
  import PromptDialog from '../Dialogs/PromptDialog'

  import HomePage from './HomePage'
  import HistoryPage from './HistoryPage'
  import DownloadsPage from './DownloadsPage'
  import LoginsPage from './LoginsPage'
  import SettingsPage from './SettingsPage'
  import ErrorPage from './ErrorPage'
  import SuspendedPage from './SuspendedPage'
  import TabPage from './TabPage'

  import electron from 'electron'
  import Encrypter from '../../data/Encrypter'

  export default {
    components: { HomePage, HistoryPage, DownloadsPage, LoginsPage, SettingsPage, ErrorPage, SuspendedPage, TabPage },
    props: {
      persona: null,
      showWelcome: false
    },
    data () {
      return {
        tabs: this.persona.tabs
      }
    },
    computed: mapState({
      settings: state => state.Settings.settings
    }),
    mounted () {
      this.setupLoginManager()
    },
    methods: {
      ...mapMutations([
        'openLoginMenu',
        'closeLoginMenu'
      ]),
      ...mapActions([
        'loadLoginDetails',
        'saveLoginDetails'
      ]),
      getZIndex (index) {
        return this.tabs[index].isActive ? 99 : -99
      },
      async setupLoginManager () {
        // Set up login management for forms with password fields
        const personaId = this.persona._id
        electron.remote.ipcMain.on('form-found-with-password-' + personaId, async (event, data) => {
          // Is the login manager enabled?
          if (this.settings.enableLoginManager) {
            // Load the existing username/password
            const db = this.$ldb
            const form = data.form
            const host = data.host
            // Maybe load the logins database
            if (!db.persistence.isLoaded) {
              let result
              do {
                result = await this.decryptLogins(db, host, form, event)
              } while (!result)
            } else {
              this.loadFormLoginDetails(db, host, form, event)
            }
          }
        })
        electron.remote.ipcMain.on('form-submitted-with-password-' + personaId, async (event, data) => {
          // Is the login manager enabled?
          if (this.settings.enableLoginManager) {
            // Has the user entered the master password?
            // TODO: If not, prompt them to enter it...
            const db = this.$ldb
            if (db.persistence.isLoaded) {
              // Get host, url and fields that were passed from the script
              const host = data.host
              const url = data.url
              const fields = data.fields
              // Get the title and icon from the active tab
              let title
              let icon
              const activeTab = this.tabs.find((tab) => {
                return tab.isActive
              })
              if (activeTab) {
                title = activeTab.title
                icon = activeTab.icon
              }
              // If login details have already been saved for this host, update them
              db.find({ personaId, host }).exec(async (err, dbDetails) => {
                if (err) {
                  alert('ERROR: ' + err)
                }
                if (dbDetails.length) {
                  if (!dbDetails[0].ignore) {
                    await this.saveLoginDetails({ db, personaId, host, url, title, icon, fields })
                  }
                } else {
                  // Otherwise, ask the user whether to save the login details
                  this.openLoginMenu({ host, url, title, icon, fields })
                  setTimeout(() => {
                    this.closeLoginMenu()
                  }, 10 * 1000)
                }
              })
            }
          }
        })
      },
      async decryptLogins (db, host, form, event) {
        return new Promise(async (resolve, reject) => {
          const prompt = create(PromptDialog)
          const result = await prompt({ content: 'Enter your master password:', type: 'password' }).transition()
          if (result) {
            const crypt = new Encrypter(result)
            db.persistence.afterSerialization = crypt.encrypt
            db.persistence.beforeDeserialization = crypt.decrypt
            db.loadDatabase(async (err) => {
              if (err) {
                const dialog = create(AlertDialog)
                await dialog({ content: 'Failed to unlock database.' }).transition()
                resolve(false)
                return
              }
              db.persistence.isLoaded = true
              this.loadFormLoginDetails(db, host, form, event)
              resolve(true)
            })
          } else {
            resolve(true)
          }
        })
      },
      async loadFormLoginDetails (db, host, form, event) {
        // TODO: to function
        const personaId = this.persona._id
        const result = await this.loadLoginDetails({ db, personaId, host })
        if (result) {
          if (result.ignore) {
            console.log('Ignoring login')
          } else if (result.fields) {
            event.sender.send('form-password-fill-' + personaId, { form, fields: result.fields })
          }
        }
      }
    }
  }
</script>

<style scoped>

  .tab-page-list-wrapper {
    position: relative;
  }

  .tab-page-list-item {
    background-color: white;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;
  }

</style>
