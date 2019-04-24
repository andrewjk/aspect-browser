<template>
  <div class="home-page-background" :style="{ backgroundImage: persona.image ? `url('${getBase64Image}')` : '' }">
    <div class="home-page-wrapper">
      <div class="title">{{ persona.name }} Home</div>
      <div class="welcome" v-if="showWelcome">
        <p>
          Welcome to the Aspect web browser.
        </p>
        <p>
          Your personas are listed along the left column. Each persona has its own set of bookmarks and
          login info. This means that you can access the same sites (or completely different sites!) with
          different logins without leaving the browser.
        </p>
        <p>
          A default, empty persona called "Personal" has been setup for you. You can store your personal
          login details (emails, social media and so on) in this persona and create one or more separate
          personas to store your work login details. Or you can edit this persona to store something else.
          It's up to you!
        </p>
        <p>
          To start adding bookmarks, search for a site using the address bar above and then press the star button.
        </p>
      </div>
      <div class="welcome" v-else-if="!persona.bookmarks.length">
        <p>
          To start adding bookmarks, search for a site using the address bar above and then press the star button.
        </p>
      </div>
      <div class="home-bookmarks">
        <button v-for="(item, index) in persona.bookmarks" :key="item._id" :class="['bookmark-button', editing ? 'editing' : '']" @click="openBookmark(item, $event)">
          <img class="bookmark-icon" :src="item.icon">
          <div class="bookmark-title">{{ item.title }}</div>
          <div v-show="editing" class="edit-bookmark-links">
            <button class="bookmark-edit-button" @click.stop="moveBookmarkUpAndSave({ db: $pdb, persona, index })" title="Move this bookmark up">
              <fa icon="chevron-up"/>
            </button>
            <button class="bookmark-edit-button" @click.stop="moveBookmarkDownAndSave({ db: $pdb, persona, index })" title="Move this bookmark down">
              <fa icon="chevron-down"/>
            </button>
            <button class="bookmark-edit-button" @click.stop="editBookmark({ db: $pdb, persona, index })" title="Edit this bookmark">
              <fa icon="edit"/>
            </button>
            <button class="bookmark-edit-button delete-link" @click.stop="deleteBookmark({ db: $pdb, persona, bookmark: item })" title="Delete this bookmark">
              <fa icon="trash"/>
            </button>
          </div>
        </button>
      </div>
      <div class="home-links">
        <fa class="editing-icon" :icon="editing ? 'check' : 'edit'"/>
        <a href="#" @click="toggleEditing">
          {{ editing ? 'Done editing' : 'Edit home page' }}
        </a>
        <a v-if="editing" href="#" @click="setBackground" style="float: right">Set background image</a>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'
  import { remote } from 'electron'
  import path from 'path'
  import fs from 'fs-extra'

  export default {
    props: {
      persona: null,
      tabs: Array,
      showWelcome: false
    },
    data () {
      return {
        editing: false
      }
    },
    computed: {
      getBase64Image: function () {
        var image = fs.readFileSync(this.persona.image)
        return 'data:image/png;base64,' + Buffer.from(image).toString('base64').replace(/(\r\n|\n|\r)/gm, '')
      }
    },
    mounted () {
      // Focus the address box when the home page has been mounted e.g. when a new tab has been opened
      const box = document.getElementById('address-text-' + this.persona._id)
      box.focus()
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addToHistory',
        'setHasOpenTab'
      ]),
      ...mapActions([
        'openInTab',
        'moveBookmarkUpAndSave',
        'moveBookmarkDownAndSave',
        'editBookmark',
        'deleteBookmark',
        'setBackgroundImage'
      ]),
      openBookmark (bookmark, e) {
        if (this.editing) {
          return
        }

        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: bookmark.url, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: bookmark.url })
        this.addToHistory({ tab: activeTab, url: 'aspect://home', title: 'Home' })
        this.setHasOpenTab(this.persona)
      },
      toggleEditing () {
        this.editing = !this.editing
      },
      async setBackground () {
        const files = remote.dialog.showOpenDialog({
          title: 'Select an image',
          properties: ['openFile']
        })
        if (files && files.length) {
          const destFile = path.join(remote.app.getPath('userData'), 'Data', 'Images', `${this.persona._id}.${files[0].split('.').pop()}`)
          if (this.persona.image) {
            try {
              await fs.unlink(this.persona.image)
            } catch (err) {
              // Don't care if the file doesn't exist
              console.log(err)
            }
            this.persona.image = null
          }
          await fs.copy(files[0], destFile)
          this.setBackgroundImage({ db: this.$pdb, persona: this.persona, image: destFile })
        }
      }
    }
  }
</script>

<style scoped>

  .home-page-background {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: absolute;
    height: 100%;
    width: 100%;
  }

  .home-page-wrapper {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    padding: 10px;
    max-width: 600px;
    margin: 40px auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
    padding: 5px 10px;
  }

  .welcome {
    margin: 40px 0;
  }

  .home-bookmarks {
    margin: 20px 0;
  }

  .bookmark-button {
    border-radius: 2px;
    cursor: default;
    text-align: center;
    width: 100%;
    height: 52px;
    padding: 10px;
  }

  .bookmark-button:hover,
  .bookmark-button:focus {
    background-color: rgba(0, 0, 0, 0.15);
  }

  .bookmark-button.editing:hover,
  .bookmark-button.editing:focus {
    background-color: inherit;
  }

  .bookmark-icon {
    height: 32px;
    width: 32px;
    border-radius: 2px;
    float: left;
  }

  .bookmark-title {
    float: left;
    margin-left: 20px;
    height: 32px;
    line-height: 32px;
    vertical-align: middle;
  }

  .edit-bookmark-links {
    float: right;
    margin-left: 40px;
    height: 32px;
    line-height: 32px;
    vertical-align: middle;
  }

  .bookmark-edit-button {
    border-radius: 2px;
    height: 30px;
    width: 30px;
    line-height: 30px;
    text-align: center;
    color: #777;
  }

  .home-links {
    padding: 10px;
  }

  .editing-icon {
    color: #0077cc;
    margin-right: 5px;
  }

  .bookmark-edit-button:hover,
  .bookmark-edit-button:focus {
    background-color: #eee;
  }

</style>
