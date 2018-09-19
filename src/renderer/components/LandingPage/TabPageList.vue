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

  import AlertDialog from './AlertDialog'
  import PromptDialog from './PromptDialog'

  import HomePage from './HomePage'
  import HistoryPage from './HistoryPage'
  import DownloadsPage from './DownloadsPage'
  import LoginsPage from './LoginsPage'
  import ErrorPage from './ErrorPage'
  import SuspendedPage from './SuspendedPage'
  import TabPage from './TabPage'

  import electron from 'electron'
  import Encrypter from '../../data/Encrypter'

  export default {
    components: { HomePage, HistoryPage, DownloadsPage, LoginsPage, ErrorPage, SuspendedPage, TabPage },
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
      setupLoginManager () {
        // Set up login management for forms with password fields
        const personaId = this.persona._id
        electron.remote.ipcMain.on('form-found-with-password-' + personaId, (event, data) => {
          // Is the login manager enabled?
          if (this.settings.enableLoginManager) {
            // Load the existing username/password
            const db = this.$ldb
            const form = data.form
            const host = data.host

            // Maybe load the logins database
            if (!db.persistence.isLoaded) {
              const prompt = create(PromptDialog)
              prompt({ content: 'Enter your master password:', type: 'password' }).transition()
                .then((result) => {
                  if (result) {
                    const crypt = new Encrypter(result)
                    db.persistence.afterSerialization = crypt.encrypt
                    db.persistence.beforeDeserialization = crypt.decrypt
                    db.loadDatabase((err) => {
                      if (err) {
                        const dialog = create(AlertDialog)
                        dialog({ content: 'Failed to unlock database.' }).transition()
                          .catch((err) => {
                            alert('ERROR: ' + err)
                          })
                        return
                      }
                      db.persistence.isLoaded = true
                      this.loadFormLoginDetails(db, host, form, event)
                    })
                  }
                })
            } else {
              this.loadFormLoginDetails(db, host, form, event)
            }
          }
        })
        electron.remote.ipcMain.on('form-submitted-with-password-' + personaId, (event, data) => {
          // Is the login manager enabled?
          if (this.settings.enableLoginManager) {
            // Has the user entered the master password?
            // TODO: If not, prompt them to enter it...
            const db = this.$ldb
            if (db.persistence.isLoaded) {
              const host = data.host
              const fields = data.fields
              // If login details have already been saved for this host, update them
              db.find({ personaId, host }).exec((err, dbDetails) => {
                if (err) {
                  alert('ERROR: ' + err)
                }
                if (dbDetails.length) {
                  if (!dbDetails[0].ignore) {
                    this.saveLoginDetails({ db, personaId, host, fields })
                      .catch((err) => {
                        alert('ERROR', err)
                      })
                  }
                } else {
                  // Otherwise, ask the user whether to save the login details
                  this.openLoginMenu({ host, fields })
                  setInterval(() => {
                    this.closeLoginMenu()
                  }, 10 * 1000)
                }
              })
            }
          }
        })
      },
      loadFormLoginDetails (db, host, form, event) {
        // TODO: to function
        const personaId = this.persona._id
        this.loadLoginDetails({ db, personaId, host })
          .then((result) => {
            if (result && result.ignore) console.log('ignoring that one')
            if (result && result.fields && !result.ignore) {
              event.sender.send('form-password-fill-' + personaId, { form, fields: result.fields })
            }
          })
          .catch((err) => {
            alert('ERROR', err)
          })
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
