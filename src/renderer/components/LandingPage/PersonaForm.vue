<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="name">Name</label>
          </td>
          <td>
            <input type="text" id="name" v-model="name" placeholder="Name" autofocus>
          </td>
        </tr>
        <tr>
          <td>
            <label for="shortName">Initials</label>
          </td>
          <td>
            <input type="text" id="shortName" v-model="shortName" placeholder="Initials">
          </td>
        </tr>
        <tr>
          <td>
            <label for="color">Color</label>
          </td>
          <td>
            <input type="text" id="color" v-model="color" placeholder="Color">
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

  export default {
    computed: {
      ...mapState({
        personaToEdit: state => state.Store.personaToEdit
      }),
      // Computed properties for v-model binding
      name: {
        get () {
          return this.personaToEdit.name
        },
        set (value) {
          this.setPersonaDetails({ persona: this.personaToEdit, name: value })
        }
      },
      shortName: {
        get () {
          return this.personaToEdit.shortName
        },
        set (value) {
          this.setPersonaDetails({ persona: this.personaToEdit, shortName: value })
        }
      },
      color: {
        get () {
          return this.personaToEdit.color
        },
        set (value) {
          this.setPersonaDetails({ persona: this.personaToEdit, color: value })
        }
      }
    },
    methods: {
      ...mapMutations([
        'setPersonaDetails'
      ])
    }
  }
</script>
