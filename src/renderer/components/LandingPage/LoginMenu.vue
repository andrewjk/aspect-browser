<template>
  <div id="login-menu">
    <button class="login-menu-item" @click="saveLogin" title="Save these login details">
      <div class="login-menu-item-grid">
        <fa icon="check" class="login-menu-icon"/>
        <span>Save this login</span>
      </div>
    </button>
    <button class="login-menu-item" @click="dontSaveLogin" title="Don't save these login details">
      <div class="login-menu-item-grid">
        <fa icon="times" class="login-menu-icon"/>
        <span>Don't save this login</span>
      </div>
    </button>
    <div class="login-menu-separator"></div>
    <button class="login-menu-item" @click="neverSaveLogin" title="Never save login details for this site">
      <div class="login-menu-item-grid">
        <fa icon="times" class="login-menu-icon"/>
        <span>Never save logins for {{ this.loginSettings.host }}</span>
      </div>
    </button>
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex'

  export default {
    props: {
      persona: null
    },
    computed: {
      ...mapState({
        loginSettings: state => state.Logins.loginSettings
      })
    },
    methods: {
      ...mapMutations([
        'closeLoginMenu'
      ]),
      ...mapActions([
        'saveLoginDetails',
        'ignoreLoginDetails'
      ]),
      async saveLogin () {
        const db = this.$ldb
        const personaId = this.persona._id
        const host = this.loginSettings.host
        const url = this.loginSettings.url
        const title = this.loginSettings.title
        const icon = this.loginSettings.icon
        const fields = this.loginSettings.fields
        await this.saveLoginDetails({ db, personaId, host, url, title, icon, fields })
        this.closeLoginMenu()
      },
      dontSaveLogin () {
        this.closeLoginMenu()
      },
      async neverSaveLogin () {
        const db = this.$ldb
        const personaId = this.persona._id
        const host = this.loginSettings.host
        const url = this.loginSettings.url
        const title = this.loginSettings.title
        const icon = this.loginSettings.icon
        await this.ignoreLoginDetails({ db, personaId, host, url, title, icon })
        this.closeLoginMenu()
      }
    }
  }
</script>

<style scoped>

  #login-menu {
    border: 1px solid #ddd;
    border-radius: 2px;
    background-color: white;
    position: absolute;
    right: 3px;
    top: 65px;
    width: 200px;
    padding: 4px 0;
  }

  .login-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 8px;
  }

  .login-menu-item-grid {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .login-menu-item:hover,
  .login-menu-item:focus {
    background-color: #eee;
  }

  .login-menu-item-grid {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .login-menu-icon {
    margin-right: 10px;
  }

  .login-menu-separator {
    height: 1px;
    border-bottom: 1px solid #ddd;
    margin: 2px 0;
  }

</style>
