<template>
  <div class="settings-page-wrapper">
    <div class="title">Settings</div>
    <form>
      <table>
        <tbody>
          <tr>
            <td>
              <label for="searchProvider">Search</label>
            </td>
            <td>
              <input type="text" id="searchProvider" v-model="settingsToEdit.searchProvider" placeholder="Search provider" @blur="saveSettings">
            </td>
          </tr>
          <tr>
            <td>
              <label for="enableLoginManager">Login manager</label>
            </td>
            <td>
              <label>
                <input type="checkbox" id="enableLoginManager" v-model="settingsToEdit.enableLoginManager" @change="maybeSetEnableLoginManager">
                {{ settingsToEdit.enableLoginManager ? "Enabled" : "Disabled" }}
              </label>
            </td>
          </tr>
          <tr v-show="this.settingsToEdit.enableLoginManager && this.loginsDatabaseExists()">
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
    data () {
      return {
        settingsToEdit: {}
      }
    },
    computed: {
      ...mapState({
        settings: state => state.Settings.settings
      })
    },
    created: function () {
      this.settingsToEdit = {
        searchProvider: this.settings.searchProvider,
        enableLoginManager: this.settings.enableLoginManager
      }
    },
    methods: {
      ...mapMutations([
        'setSettingsDetails'
      ]),
      ...mapActions([
        'saveMasterPasswordRecord'
      ]),
      loginsDatabaseExists () {
        // Check whether there's already a database file
        const filename = path.join(remote.app.getPath('userData'), 'Data/logins.db')
        return fs.existsSync(filename)
      },
      async maybeSetEnableLoginManager () {
        // TODO: This is some spaghetti that needs to be cleaned up...
        // If turning on and there's no existing database file, require setting the master password
        if (this.settingsToEdit.enableLoginManager && !this.loginsDatabaseExists()) {
          const prompt = create(CreatePasswordDialog)
          const result = await prompt({ content: 'Enter a master password below. This password will be used to encrypt your login details. You will be required to enter it the first time you encounter a password field after starting Aspect.' }).transition()
          if (result) {
            if (!result.password || !result.confirmPassword) {
              const dialog = create(AlertDialog)
              await dialog({ content: 'A password is required.' }).transition()
              // Turn it back off
              this.settingsToEdit.enableLoginManager = false
              this.saveSettings()
              return
            }
            if (result.password !== result.confirmPassword) {
              const dialog = create(AlertDialog)
              await dialog({ content: 'The password and confirmation don\'t match.' }).transition()
              // Turn it back off
              this.settingsToEdit.enableLoginManager = false
              this.saveSettings()
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
                  this.settingsToEdit.enableLoginManager = false
                  this.saveSettings()
                  return
                }
                db.persistence.isLoaded = true
                // Put a record in the database so that we know it works
                await this.saveMasterPasswordRecord({ db })
              })
            } else {
              // Put a record in the database so that we know it works
              await this.saveMasterPasswordRecord({ db })
            }
          } else {
            // Turn it back off
            this.settingsToEdit.enableLoginManager = false
            this.saveSettings()
          }
        }
        this.saveSettings()
      },
      async changeLoginManagerPassword () {
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
              const filename = path.join(remote.app.getPath('userData'), 'Data/logins.db')
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
        this.saveSettings()
      },
      saveSettings () {
        const settingsDetails = {
          searchProvider: this.settingsToEdit.searchProvider,
          enableLoginManager: this.settingsToEdit.enableLoginManager
        }
        this.setSettingsDetails(settingsDetails)
        this.$usdb.update({ _id: this.settings._id }, settingsDetails, {}, (err, numReplaced) => {
          if (err) {
            alert('ERROR: ' + err)
          }
        })
      }
    }
  }
</script>

<style scoped>

  .settings-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .settings-search {
    margin: 20px 0;
  }

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
