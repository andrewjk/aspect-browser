<template>
  <div class="edit-dialog dialog-mask">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>{{ adding ? 'Add Bookmark:' : 'Edit Bookmark:' }}</h2>
      </header>
      <div class="dialog-body">
        <form>
          <table>
            <tbody>
              <tr>
                <td>
                  <label for="title">Title</label>
                </td>
                <td>
                  <input type="text" id="title" v-model="bookmark.title" placeholder="Title">
                </td>
              </tr>
              <tr>
                <td>
                  <label for="url">URL</label>
                </td>
                <td>
                  <input type="text" id="url" v-model="bookmark.url" placeholder="URL">
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <footer>
        <a v-show="!adding" href="#" class="delete-link" @click="deleteBookmarkAndClose">Delete bookmark</a>
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
      bookmark: null,
      persona: null,
      adding: false
    },
    methods: {
      ...mapActions([
        'deleteBookmark'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      async deleteBookmarkAndClose () {
        await this.deleteBookmark({ db: this.$pdb, bookmark: this.bookmark, persona: this.persona })
        this.$close(false)
      }
    }
  }
</script>
