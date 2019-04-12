<template>
  <div class="edit-dialog dialog-mask" @click="$close(false)">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>Edit Settings:</h2>
      </header>
      <div class="dialog-body">
        <form>
          <table>
            <tbody>
              <tr>
                <td>
                  <label for="searchProvider">Search</label>
                </td>
                <td>
                  <input type="text" id="searchProvider" v-model="settings.searchProvider" placeholder="Search provider">
                </td>
              </tr>
              <tr>
                <td>
                  <label for="enableLoginManager">Login manager</label>
                </td>
                <td>
                  <label>
                    <input type="checkbox" id="enableLoginManager" v-model="settings.enableLoginManager">
                    {{ settings.enableLoginManager ? "Enabled" : "Disabled" }}
                  </label>
                </td>
              </tr>
              <tr v-show="this.settings.enableLoginManager && this.loginsDatabaseExists">
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
      </div>
      <footer>
        <button id="dialog-confirm" class="confirm" @click="$close(true)">Save</button>
        <button id="dialog-cancel" class="cancel" @click="$close(false)">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import AlertDialog from '../Dialogs/AlertDialog'
  import CreatePasswordDialog from '../Dialogs/CreatePasswordDialog'
  import ChangePasswordDialog from '../Dialogs/ChangePasswordDialog'

  import { remote } from 'electron'
  import fs from 'fs'
  import path from 'path'
  import Encrypter from '../../data/Encrypter'

  export default {
    props: {
      settings: null
    },
    computed: {
      ...mapState({
        settingsToEdit: state => state.Settings.settingsToEdit
      })
    },
    methods: {
      ...mapMutations([
        'setSettingsDetails'
      ]),
      ...mapActions([
        'saveMasterPasswordRecord'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      loginsDatabaseExists () {
        // Check whether there's already a database file
        const filename = path.join(remote.app.getPath('appData'), '/Aspect Browser/logins.db')
        return fs.existsSync(filename)
      },
      async maybeSetEnableLoginManager (value) {
        // TODO: This is some spaghetti that needs to be cleaned up...
        // If turning on and there's no existing database file, require setting the master password
        if (value && !this.loginsDatabaseExists()) {
          const prompt = create(CreatePasswordDialog)
          const result = await prompt({ content: 'Enter a master password below. This password will be used to encrypt your login details. You will be required to enter it the first time you encounter a password field after starting Aspect.' }).transition()
          if (result) {
            if (!result.password || !result.confirmPassword) {
              const dialog = create(AlertDialog)
              await dialog({ content: 'A password is required.' }).transition()
              // Turn it back off
              document.getElementById('enableLoginManager').checked = false
              this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: false })
              return
            }
            if (result.password !== result.confirmPassword) {
              const dialog = create(AlertDialog)
              await dialog({ content: 'The password and confirmation don\'t match.' }).transition()
              // Turn it back off
              document.getElementById('enableLoginManager').checked = false
              this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: false })
              return
            }

            // Maybe load the database
            const db = this.$ldb
            if (!db.persistence.isLoaded) {
              const crypt = new Encrypter(result.password)
              db.persistence.afterSerialization = crypt.encrypt
              db.persistence.beforeDeserialization = crypt.decrypt
              db.loadDatabase(async (err) => {
                if (err) {
                  const dialog = create(AlertDialog)
                  await dialog({ content: 'Failed to unlock database.' }).transition()
                  // Turn it back off
                  document.getElementById('enableLoginManager').checked = false
                  this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: false })
                  return
                }
                db.persistence.isLoaded = true
                // Put a record in the database so that we know it works
                await this.saveMasterPasswordRecord({ db })
                // Turn it on
                this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
              })
            } else {
              // Put a record in the database so that we know it works
              await this.saveMasterPasswordRecord({ db })
              // Turn it on
              this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
            }
          } else {
            // Turn it back off
            document.getElementById('enableLoginManager').checked = false
            this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: false })
          }
        } else {
          // Just turn it on or off
          this.setSettingsDetails({ settings: this.settingsToEdit, enableLoginManager: value })
        }
      },
      async changeLoginManagerPassword () {
        // TODO: This is some spaghetti that needs to be cleaned up...
        // Get the existing master password
        const prompt = create(ChangePasswordDialog)
        const result = await prompt({ content: 'Enter your old master password and new master password below:', type: 'password' }).transition()
        if (result) {
          if (!result.newPassword || !result.confirmPassword) {
            const dialog = create(AlertDialog)
            await dialog({ content: 'A password is required.' }).transition()
            return
          }
          if (result.newPassword !== result.confirmPassword) {
            const dialog = create(AlertDialog)
            await dialog({ content: 'The password and confirmation don\'t match.' }).transition()
            return
          }

          // Try to load the database with the supplied password
          const db = this.$ldb
          const oldcrypt = new Encrypter(result.oldPassword)
          db.persistence.afterSerialization = oldcrypt.encrypt
          db.persistence.beforeDeserialization = oldcrypt.decrypt
          db.loadDatabase(async (err) => {
            if (err) {
              const dialog = create(AlertDialog)
              await dialog({ content: 'Failed to unlock database.' }).transition()
              // Require the correct password to be entered before using this database again
              db.persistence.isLoaded = false
              return
            }
            db.persistence.isLoaded = true

            // Load every record with the old encrypter
            db.find({}, (err, dbRecords) => {
              if (err) {
                alert('ERROR: ' + err)
                return
              }

              // Delete the old database file
              const filename = path.join(remote.app.getPath('appData'), '/Aspect Browser/logins.db')
              fs.unlinkSync(filename)

              // Encrypt every record with the new encrypter
              const newcrypt = new Encrypter(result.newPassword)
              db.persistence.afterSerialization = newcrypt.encrypt

              const recordCount = dbRecords.length
              let recordIndex = 0
              for (let record of dbRecords) {
                db.update({ _id: record._id }, record, {}, (err, numReplaced) => {
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
          })
        }
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
