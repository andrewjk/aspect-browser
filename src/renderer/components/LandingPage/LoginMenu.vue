<template>
  <div id="logins-menu">
    <button class="logins-menu-item" @click="saveLogin" title="Save these login details">
      <fa icon="check"/>
      <span>Save this login</span>
    </button>
    <button class="logins-menu-item" @click="dontSaveLogin" title="Don't save these login details">
      <fa icon="times"/>
      <span>Don't save this login</span>
    </button>
    <div class="logins-menu-separator"></div>
    <button class="logins-menu-item" @click="neverSaveLogin" title="Never save login details for this site">
      <fa icon="times"/>
      <span>Never save logins for {{ this.loginSettings.host }}</span>
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
        loginSettings: state => state.Store.loginSettings
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
      saveLogin () {
        const db = this.$ldb
        const personaId = this.persona._id
        const host = this.loginSettings.host
        const fields = this.loginSettings.fields
        this.saveLoginDetails({ db, personaId, host, fields })
          .then(() => {
            this.closeLoginMenu()
          })
          .catch((err) => {
            alert('ERROR', err)
          })
      },
      dontSaveLogin () {
        this.closeLoginMenu()
      },
      neverSaveLogin () {
        const db = this.$ldb
        const personaId = this.persona._id
        const host = this.loginSettings.host
        this.ignoreLoginDetails({ db, personaId, host })
          .then(() => {
            this.closeLoginMenu()
          })
          .catch((err) => {
            alert('ERROR', err)
          })
      }
    }
  }
</script>

<style scoped>

  #logins-menu {
    border: 1px solid #ddd;
    border-radius: 2px;
    background-color: white;
    position: absolute;
    right: 3px;
    top: 65px;
    width: 200px;
    padding: 4px 0;
  }

  .logins-menu-item {
    text-align: left;
    width: 100%;
    padding: 4px 8px;
  }

  .logins-menu-item:hover,
  .logins-menu-item:focus {
    background-color: #eee;
  }

  .logins-menu-separator {
    height: 1px;
    border-bottom: 1px solid #ddd;
    margin: 2px 0;
  }

</style>
