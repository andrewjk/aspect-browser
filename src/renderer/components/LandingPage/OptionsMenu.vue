<template>
  <div id="options-menu">
    <button class="options-menu-item" @click="editSettings({ db: $usdb, settings })" title="Edit application settings">
      <div class="options-menu-item-grid">
        <fa icon="cog" class="options-menu-icon"/>
        <span>Settings</span>
      </div>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="showHistory" title="Show browsing history for this persona">
      <div class="options-menu-item-grid">
        <fa :icon="['far', 'clock']" class="options-menu-icon"/>
        <span>View {{ this.persona.name }} History</span>
      </div>
    </button>
    <button class="options-menu-item" @click="clearHistory({ db: $hdb, personaId: persona._id })" title="Clear the browsing history for this persona">
      <div class="options-menu-item-grid">
        <fa icon="trash" class="options-menu-icon"/>
        <span>Clear {{ this.persona.name }} History</span>
      </div>
    </button>
    <button class="options-menu-item" @click="clearAllHistory({ db: $hdb, personaId: persona._id })" title="Clear the browsing history for all personas">
      <div class="options-menu-item-grid">
        <fa icon="trash" class="options-menu-icon"/>
        <span>Clear All History</span>
      </div>
    </button>
    <div class="options-menu-separator"></div>
    <button class="options-menu-item" @click="maybeShowLogins" title="Show login details for this persona">
      <div class="options-menu-item-grid">
        <fa icon="key" class="options-menu-icon"/>
        <span>View {{ this.persona.name }} Logins</span>
      </div>
    </button>
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
  import { mapState, mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import AlertDialog from './AlertDialog'
  import PromptDialog from './PromptDialog'
  import AboutDialog from './AboutDialog'

  import Encrypter from '../../data/Encrypter'

  export default {
    props: {
      persona: null
    },
    computed: {
      ...mapState({
        settings: state => state.Settings.settings
      })
    },
    methods: {
      ...mapMutations([
        'showHistory',
        'showLogins'
      ]),
      ...mapActions([
        'editSettings',
        'clearHistory',
        'clearAllHistory'
      ]),
      maybeShowLogins () {
        // Always get the password before showing the saved logins
        // TODO: Loop this until we get the right password
        const db = this.$ldb
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
                this.showLogins({ persona: this.persona })
              })
            }
          })
      },
      showAboutDialog () {
        const dialog = create(AboutDialog)
        dialog({}).transition()
          .catch((err) => {
            alert('ERROR: ' + err)
          })
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
    width: 200px;
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
    grid-template-columns: auto 1fr;
  }

  .options-menu-icon {
    margin-right: 10px;
  }

  .options-menu-separator {
    height: 1px;
    border-bottom: 1px solid #ddd;
    margin: 2px 0;
  }

</style>