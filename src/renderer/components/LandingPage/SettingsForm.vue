<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="searchProvider">Search</label>
          </td>
          <td>
            <input id="searchProvider" v-model="searchProvider" placeholder="Search provider">
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
        settingsToEdit: state => state.Personas.settingsToEdit
      }),
      // Computed properties for v-model binding
      searchProvider: {
        get () {
          return this.settingsToEdit.searchProvider
        },
        set (value) {
          this.setSettingsDetails({ settings: this.settingsToEdit, searchProvider: value })
        }
      }
    },
    methods: {
      ...mapMutations([
        'setSettingsDetails'
      ])
    }
  }
</script>
