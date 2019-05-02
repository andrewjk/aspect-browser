<template>
  <div class="edit-dialog dialog-mask" @click="$close(false)">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>{{ adding ? 'Add Widget:' : 'Edit Widget:' }}</h2>
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
                  <input type="text" id="name" v-model="widget.name" placeholder="Name" autofocus>
                </td>
              </tr>
              <tr>
                <td>
                  <label for="location">Timezone name</label>
                </td>
                <td>
                  <input type="text" id="location" v-model="widget.location" placeholder="e.g. America/New_York">
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  Note: the timezone name must be one of the names from https://en.wikipedia.org/wiki/List_of_tz_database_time_zones, e.g. America/New_York.
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <footer>
        <a v-show="!adding" href="#" class="delete-link" @click="deleteWidgetAndClose">Delete widget</a>
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
      widget: null,
      adding: false
    },
    methods: {
      ...mapActions([
        'deleteWidget'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      async deleteWidgetAndClose () {
        await this.deleteWidget({ db: this.$wdb, widget: this.widget })
        this.$close(false)
      }
    }
  }
</script>
