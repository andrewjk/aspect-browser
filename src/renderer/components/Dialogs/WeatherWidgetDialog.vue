<template>
  <div class="edit-dialog dialog-mask">
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
                  <label for="location">Location</label>
                </td>
                <td>
                  <input type="text" id="location" v-model="widget.location" placeholder="Location" autofocus>
                </td>
              </tr>
              <tr>
                <td>
                  <label for="units">Units</label>
                </td>
                <td>
                  <label>
                    <input type="radio" id="celsius" value="celsius" v-model="widget.units">
                    Celsius
                  </label>
                  <label>
                    <input type="radio" id="fahrenheit" value="fahrenheit" v-model="widget.units">
                    Fahrenheit
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <footer>
        <a v-show="!adding" href="#" class="delete-link" @click="deleteWidgetAndClose">Delete widget</a>
        <button class="confirm" @click="$close(true)">Save</button>
        <button class="cancel" @click="$close(false)">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: {
      persona: null,
      widgets: null,
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
        await this.deleteWidget({ db: this.$wdb, persona: this.persona, widgets: this.widgets, widget: this.widget })
        this.$close(false)
      }
    }
  }
</script>
