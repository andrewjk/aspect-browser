<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="searchProvider">Search</label>
          </td>
          <td>
            <input type="text" id="searchProvider" v-model="searchProvider" placeholder="Search provider">
          </td>
        </tr>
        <tr>
          <td>
            <label for="enableLoginManager">Login Manager</label>
          </td>
          <td>
            <label>
              <input type="checkbox" id="enableLoginManager" v-model="enableLoginManager">
              {{ enableLoginManager ? "Enabled" : "Disabled" }}
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex'

  import { remote } from 'electron'
  import fs from 'fs'
  import path from 'path'
  import Encrypter from '../../data/Encrypter'

  export default {
    computed: {
      ...mapState({
        settingsToEdit: state => state.Store.settingsToEdit
      }),
      // Computed properties for v-model binding
      searchProvider: {
        get () {
          return this.settingsToEdit.searchProvider
        },
        set (value) {
          this.setSettingsDetails({ settings: this.settingsToEdit, searchProvider: value })
        }
      },
      enableLoginManager: {
        get () {
          return this.settingsToEdit.enableLoginManager
        },
        set (value) {
          // Check whether there's already a database file
          const filename = path.join(remote.app.getPath('userData'), '/logins.db')

          // If turning on and there's no existing database file, require setting the master password
          if (value && !fs.existsSync(filename)) {
            this.$swal({
              title: 'Login Manager',
              text: 'Enter a master password below. This password will be used to encrypt your login details. You will be required to enter it the first time you encounter a password field after starting Aspect.',
              input: 'password',
              showConfirmButton: true,
              showCancelButton: true,
              allowOutsideClick: false,
              animation: false,
              customClass: 'dialog-custom'
            })
              .then((result) => {
                if (result.value) {
                  const db = this.$ldb
                  // Maybe load the database
                  if (!db.persistence.isLoaded) {
                    const crypt = new Encrypter(result.value)
                    db.persistence.afterSerialization = crypt.encrypt
                    db.persistence.beforeDeserialization = crypt.decrypt
                    db.loadDatabase((err) => {
                      if (err) {
                        alert('Failed to unlock database.')
                        return
                      }
                      db.persistence.isLoaded = true
                      // Put a record in the database so that we know it works
                      this.saveMasterPasswordRecord({ db })
                        .then(() => {
                          // Turn it on
                          this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
                        })
                    })
                  } else {
                    // Put a record in the database so that we know it works
                    this.saveMasterPasswordRecord({ db })
                      .then(() => {
                        // Turn it on
                        this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
                      })
                  }
                } else {
                  // Turn it back off
                  document.getElementById('enableLoginManager').checked = false
                  this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: false })
                }
              })
              .catch((err) => {
                alert('ERROR: ' + err)
              })
          } else {
            // Just turn it on or off
            this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
          }
        }
      }
    },
    methods: {
      ...mapMutations([
        'setSettingsDetails'
      ]),
      ...mapActions([
        'saveMasterPasswordRecord'
      ])
    }
  }
</script>
