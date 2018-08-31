<template>
  <div class="edit-dialog dialog-mask" @click="$close(false)">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>{{ adding ? 'Add Persona:' : 'Edit Persona:' }}</h2>
      </header>
      <div class="dialog-body">
        <form>
          <table>
            <tbody>
              <tr>
                <td>
                  <label for="name">Name</label>
                </td>
                <td>
                  <input type="text" id="name" v-model="persona.name" placeholder="Name" autofocus>
                </td>
              </tr>
              <tr>
                <td>
                  <label for="shortName">Initials</label>
                </td>
                <td>
                  <input type="text" id="shortName" v-model="persona.shortName" placeholder="Initials">
                </td>
              </tr>
              <tr>
                <td>
                  <label for="color">Color</label>
                </td>
                <td>
                  <input type="text" id="color" v-model="persona.color" placeholder="Color">
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <footer>
        <a v-show="!adding" href="#" class="delete-link" @click="deletePersonaAndClose">Delete persona</a>
        <button id="dialog-confirm" class="confirm" @click="$close(true)">Save</button>
        <button id="dialog-cancel" class="cancel" @click="$close(false)">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: {
      persona: null,
      adding: false
    },
    methods: {
      ...mapActions([
        'deletePersona'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      deletePersonaAndClose () {
        this.deletePersona({ db: this.$pdb, persona: this.persona })
          .then(() => {
            this.$close(false)
          })
      }
    }
  }
</script>
