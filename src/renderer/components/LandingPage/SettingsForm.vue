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
        <tr v-show="this.enableLoginManager && this.loginsDatabaseExists">
          <td>
            &nbsp;
          </td>
          <td>
            <button class="settings-button" @click="changeLoginManagerPassword">
              Change Password
            </button>
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
          this.maybeSetEnableLoginManager(value)
        }
      }
    },
    methods: {
      ...mapMutations([
        'setSettingsDetails'
      ]),
      ...mapActions([
        'saveMasterPasswordRecord'
      ]),
      loginsDatabaseExists: function () {
        // Check whether there's already a database file
        const filename = path.join(remote.app.getPath('userData'), '/logins.db')
        return fs.existsSync(filename)
      },
      maybeSetEnableLoginManager: function (value) {
        // TODO: This is some spaghetti that needs to be cleaned up...
        // If turning on and there's no existing database file, require setting the master password
        if (value && !this.loginsDatabaseExists()) {
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
      },
      changeLoginManagerPassword: function () {
        // TODO: This is some spaghetti that needs to be cleaned up...
        // Get the existing master password
        this.$swal({
          title: 'Login Manager',
          text: 'Enter your old master password:',
          input: 'password',
          showConfirmButton: true,
          showCancelButton: true,
          allowOutsideClick: false,
          animation: false,
          customClass: 'dialog-custom'
        })
          .then((result) => {
            if (result.value) {
              // Try to load the database with the supplied password
              const db = this.$ldb
              const oldcrypt = new Encrypter(result.value)
              db.persistence.afterSerialization = oldcrypt.encrypt
              db.persistence.beforeDeserialization = oldcrypt.decrypt
              db.loadDatabase((err) => {
                if (err) {
                  alert('Failed to unlock database.')
                  // Require the correct password to be entered before using this database again
                  db.persistence.isLoaded = false
                  return
                }
                db.persistence.isLoaded = true
                this.$swal({
                  title: 'Login Manager',
                  text: 'Enter your new master password:',
                  input: 'password',
                  showConfirmButton: true,
                  showCancelButton: true,
                  allowOutsideClick: false,
                  animation: false,
                  customClass: 'dialog-custom'
                })
                  .then((newresult) => {
                    if (newresult.value) {
                      // Load every record with the old encrypter
                      db.find({}, (err, dbRecords) => {
                        if (err) {
                          alert('ERROR: ' + err)
                          return
                        }

                        // Delete the old database file
                        const filename = path.join(remote.app.getPath('userData'), '/logins.db')
                        fs.unlinkSync(filename)

                        // Encrypt every record with the new encrypter
                        const newcrypt = new Encrypter(newresult.value)
                        db.persistence.afterSerialization = newcrypt.encrypt

                        const recordCount = dbRecords.length
                        let recordIndex = 0
                        for (let record of dbRecords) {
                          db.update({ _id: record._id }, record, {}, function (err, numReplaced) {
                            if (err) {
                              // TODO: Really need to handle errors much better...
                              // Maybe could copy the database and restore it if anything goes wrong?
                              alert('ERROR: ' + err)
                              return
                            }
                            recordIndex = recordIndex + 1
                            if (recordIndex === recordCount) {
                              // If this is the last record, update the decrypter with the new password
                              db.persistence.beforeDeserialization = newcrypt.decrypt
                            }
                          })
                        }
                      })
                    }
                  })
              })
            }
          })
      }
    }
  }
</script>

<style scoped>

  .settings-button {
    border: 1px solid #aaa;
    border-radius: 10px;
    padding: 4px 10px;
  }

  .settings-button:hover,
  .settings-button:focus {
    background-color: #ddd;
  }

</style>
