<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="title">Title</label>
          </td>
          <td>
            <input id="title" v-model="title" placeholder="Title">
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
        bookmarkToEdit: state => state.Personas.bookmarkToEdit
      }),
      // Computed properties for v-model binding
      title: {
        get () {
          return this.bookmarkToEdit.title
        },
        set (value) {
          this.setBookmarkDetails({ bookmark: this.bookmarkToEdit, title: value })
        }
      }
    },
    methods: {
      ...mapMutations([
        'setBookmarkDetails'
      ])
    }
  }
</script>
