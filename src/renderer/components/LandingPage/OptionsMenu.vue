<template>
  <div id="options-menu">
    <button class="options-menu-item" @click="editSettings" title="Edit application settings">
      <div class="options-menu-item-grid">
        <fa icon="cog" class="options-menu-icon"/>
        <span>Settings</span>
      </div>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="showHistory" title="Show browsing history for this persona">
      <div class="options-menu-item-grid">
        <fa :icon="['far', 'clock']" class="options-menu-icon"/>
        <span>View {{ this.persona.name }} history</span>
      </div>
    </button>
    <button class="options-menu-item" @click="clearHistoryAndRelated" title="Clear the browsing history for this persona">
      <div class="options-menu-item-grid">
        <fa icon="trash" class="options-menu-icon"/>
        <span>Clear {{ this.persona.name }} history</span>
      </div>
    </button>
    <button class="options-menu-item" @click="clearAllHistoryAndRelated" title="Clear the browsing history for all personas">
      <div class="options-menu-item-grid">
        <fa icon="trash" class="options-menu-icon"/>
        <span>Clear all history</span>
      </div>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="restoreSession({ db: $adb })" title="Restore the session that was active when you last closed Aspect">
      <div class="options-menu-item-grid">
        <fa icon="table" class="options-menu-icon"/>
        <span>Restore previous session</span>
      </div>
    </button>
    <button class="options-menu-item" @click="saveSessionWithName" title="Save the active tabs for this session so they can be reopened later">
      <div class="options-menu-item-grid">
        <fa icon="table" class="options-menu-icon"/>
        <span>Save this session</span>
      </div>
    </button>
    <button class="options-menu-item" @click="loadSessionWithName" title="Load a previously-saved session">
      <div class="options-menu-item-grid">
        <fa icon="table" class="options-menu-icon"/>
        <span>Load a session</span>
      </div>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="showDownloads({ persona })" title="Show downloaded files for this persona">
      <div class="options-menu-item-grid">
        <fa :icon="['far', 'file']" class="options-menu-icon"/>
        <span>View {{ this.persona.name }} downloads</span>
      </div>
    </button>
    <div v-if="settings.enableLoginManager" class="options-menu-separator"></div>
    <button v-if="settings.enableLoginManager" class="options-menu-item" @click="maybeShowLogins" title="Show login details for this persona">
      <div class="options-menu-item-grid">
        <fa icon="key" class="options-menu-icon"/>
        <span>View {{ this.persona.name }} logins</span>
      </div>
    </button>
    <!--<button v-if="settings.enableLoginManager" class="options-menu-item" @click="fillLogin" title="Fill login details on this page">
      <div class="options-menu-item-grid">
        <fa icon="key" class="options-menu-icon"/>
        <span>Fill login details</span>
      </div>
    </button>-->
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="showAboutDialog" title="Show information about Aspect">
      <div class="options-menu-item-grid">
        <fa icon="info-circle" class="options-menu-icon"/>
        <span>About Aspect</span>
      </div>
    </button>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import AlertDialog from '../Dialogs/AlertDialog'
  import PromptDialog from '../Dialogs/PromptDialog'
  import AboutDialog from '../Dialogs/AboutDialog'
  import ConfirmDialog from '../Dialogs/ConfirmDialog'

  import Encrypter from '../../data/Encrypter'

  export default {
    props: {
      persona: null
    },
    computed: {
      ...mapState({
        settings: state => state.Settings.settings
      }),
      ...mapGetters([
        'getActiveTab'
      ])
    },
    methods: {
      ...mapActions([
        'editSettings',
        'clearHistory',
        'clearAllHistory',
        'clearActivity',
        'clearAllActivity',
        'clearDownloads',
        'clearAllDownloads',
        'restoreSession',
        'saveSession',
        'loadSession',
        'showHistory',
        'showDownloads',
        'showLogins',
        'loadLoginDetails'
      ]),
      async saveSessionWithName () {
        const prompt = create(PromptDialog)
        const result = await prompt({ content: 'Enter a name for this session:' }).transition()
        if (result) {
          this.saveSession({ db: this.$adb, name: result })
        }
      },
      async loadSessionWithName () {
        const prompt = create(PromptDialog)
        const result = await prompt({ content: 'Enter the name of the session to load:' }).transition()
        if (result) {
          this.loadSession({ db: this.$adb, name: result })
        }
      },
      async maybeShowLogins () {
        // Always get the password before showing the saved logins
        let result
        do {
          result = await this.decryptLogins()
        } while (!result)
      },
      async decryptLogins () {
        return new Promise(async (resolve, reject) => {
          const db = this.$ldb
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
              this.showLogins({ persona: this.persona })
              console.log('returning true')
              resolve(true)
            })
          } else {
            resolve(true)
          }
        })
      },
      async fillLogin () {
        const activeTab = this.getActiveTab
        const personaId = this.persona._id
        activeTab.webview.send('force-password-fill', personaId)
      },
      async showAboutDialog () {
        const dialog = create(AboutDialog)
        await dialog({}).transition()
      },
      async clearHistoryAndRelated () {
        const dialog = create(ConfirmDialog)
        const result = await dialog({ content: 'Are you sure you want to clear the browsing history for this persona?' }).transition()
        if (result) {
          this.clearHistory({ db: this.$hdb, personaId: this.persona._id })
          this.clearActivity({ db: this.$adb, personaId: this.persona._id })
          this.clearDownloads({ db: this.$ddb, personaId: this.persona._id })
        }
      },
      async clearAllHistoryAndRelated () {
        const dialog = create(ConfirmDialog)
        const result = await dialog({ content: 'Are you sure you want to clear the browsing history for all personas?' }).transition()
        if (result) {
          this.clearAllHistory({ db: this.$hdb })
          this.clearAllActivity({ db: this.$adb })
          this.clearAllDownloads({ db: this.$ddb })
        }
      }
    }
  }
</script>

<style scoped>

  #options-menu {
    border: 1px solid #ddd;
    border-radius: 2px;
    background-color: white;
    position: absolute;
    right: 3px;
    top: 65px;
    width: 230px;
    padding: 4px 0;
  }

  .options-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 8px;
  }

  .options-menu-item:hover,
  .options-menu-item:focus {
    background-color: #eee;
  }

  .options-menu-item-grid {
    display: grid;
    grid-template-columns: 24px 1fr;
  }

  .options-menu-icon {
  }

  .options-menu-separator {
    height: 1px;
    border-bottom: 1px solid #ddd;
    margin: 2px 0;
  }

</style>