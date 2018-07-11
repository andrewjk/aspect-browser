<template>
  <div class="home-page-wrapper">
    <div class="title">{{ persona.name }} Home</div>
    <div class="welcome" v-if="showWelcome">
      <p>
        Welcome to this browser.
      </p>
      <p>
        Your personas are listed along the left column. Each persona has its own set of bookmarks and
        login info. This means that you can access the same sites (or completely different sites!) with
        different logins without leaving this browser.
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
      <button v-for="(item, index) in persona.bookmarks" :key="item._id" class="bookmark-button" @click="openBookmark(item, $event)">
        <img class="bookmark-icon" :src="item.icon" :style="{ backgroundColor: getBackgroundColor(index) }">
        <div class="bookmark-title">{{ item.title }}</div>
        <div v-show="showEditBookmarkLinks" class="edit-bookmark-links">
          <a href="#" @click.stop="moveBookmarkUp(index)">
            <fa icon="chevron-up"/>
          </a>
          <a href="#" @click.stop="moveBookmarkDown(index)">
            <fa icon="chevron-down"/>
          </a>
          <span class="divider">|</span>
          <a href="#" @click.stop="editBookmark(index)">Edit</a>
          <span class="divider">|</span>
          <a href="#" class="delete-link" @click.stop="deleteBookmark(index)">Delete</a>
        </div>
      </button>
    </div>
    <div class="home-links">
      <a href="#" v-show="persona.bookmarks.length" @click="editBookmarks">Edit bookmarks</a>
      <span v-show="persona.bookmarks.length" class="divider">|</span>
      <a href="#" @click="editPersona">Edit persona</a>
    </div>
    <modal v-if="showBookmarkModal" @close="showBookmarkModal = false">
      <h3 slot="header">{{ newBookmark._id ? 'Edit Bookmark:' : 'Add Bookmark:' }} </h3>
      <bookmark-form slot="body" :bookmark="newBookmark"></bookmark-form>
      <div slot="footer" class="modal-button-footer">
        <button @click="commitBookmarkEdit">
          Save
        </button>
        <button @click="cancelBookmarkEdit">
          Cancel
        </button>
      </div>
    </modal>
    <modal v-if="showPersonaModal" @close="showPersonaModal = false">
      <h3 slot="header">Edit Persona:</h3>
      <persona-form slot="body" :persona="persona"></persona-form>
      <div slot="footer" class="modal-button-footer">
        <a href="#" class="delete-link" @click="deletePersona">Delete persona</a>
        <button @click="commitPersonaEdit">
          Save
        </button>
        <button @click="cancelPersonaEdit">
          Cancel
        </button>
      </div>
    </modal>
  </div>
</template>

<script>
  import Modal from './Modal'
  import BookmarkForm from './BookmarkForm'
  import PersonaForm from './PersonaForm'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    components: { Modal, BookmarkForm, PersonaForm },
    props: {
      persona: null,
      showWelcome: false
    },
    data () {
      return {
        showEditBookmarkLinks: false,
        showBookmarkModal: false,
        newBookmark: null,
        showPersonaModal: false,
        oldPersona: null
      }
    },
    mounted: function () {
      this.sortBookmarks()
    },
    methods: {
      getBackgroundColor (index) {
      },
      openBookmark (bookmark, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.$emit('open-new-window', bookmark.url, true)
          return
        }

        const activeTab = this.persona.tabs.find(function (item) {
          return item.isActive
        })

        // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
        if (!activeTab.backHistory) {
          activeTab.backHistory = []
        }
        activeTab.backHistory.push({
          url: 'home',
          title: 'Home'
        })
        activeTab.forwardHistory = []
        activeTab.backHistoryNavigation = true

        activeTab.isLoading = true
        activeTab.initialUrl = bookmark.url
        activeTab.url = bookmark.url
      },
      editBookmarks () {
        this.showEditBookmarkLinks = !this.showEditBookmarkLinks
      },
      moveBookmarkUp (index) {
        if (index === 0) {
          return
        }
        // Swap this bookmark's order with the next bookmark's order
        const thisOrder = this.persona.bookmarks[index].order
        const prevOrder = this.persona.bookmarks[index - 1].order
        this.persona.bookmarks[index].order = prevOrder
        this.persona.bookmarks[index - 1].order = thisOrder
        this.sanitizeBookmarkOrders()
      },
      moveBookmarkDown (index) {
        if (index === this.persona.bookmarks.length - 1) {
          return
        }
        // Swap this bookmark's order with the next bookmark's order
        const thisOrder = this.persona.bookmarks[index].order
        const nextOrder = this.persona.bookmarks[index + 1].order
        this.persona.bookmarks[index].order = nextOrder
        this.persona.bookmarks[index + 1].order = thisOrder
        this.sanitizeBookmarkOrders()
      },
      sanitizeBookmarkOrders () {
        // Sort the bookmarks
        this.sortBookmarks()
        // Renumber everything, just in case something funny has gone on
        for (var i = 0; i < this.persona.bookmarks.length; i++) {
          this.persona.bookmarks[i].order = i + 1
        }
        // Save the persona
        this.savePersona()
      },
      deleteBookmark (index) {
        if (confirm('Are you sure you want to delete this bookmark?') && confirm('Are you really sure you want to delete this bookmark?')) {
          // Remove the bookmark from the persona
          this.persona.bookmarks.splice(index, 1)

          // Save the persona to the database
          this.$db.update({ _id: this.persona._id }, this.persona, {}, function (err, numReplaced) {
            if (err) {
              alert('ERROR: ' + err)
            }
          })
        }
      },
      editBookmark (index) {
        const bookmark = this.persona.bookmarks[index]
        this.newBookmark = {
          _id: bookmark._id,
          url: bookmark.url,
          title: bookmark.title,
          icon: bookmark.icon,
          order: bookmark.order
        }
        // Show the modal
        this.showBookmarkModal = true
      },
      commitBookmarkEdit () {
        if (this.newBookmark._id) {
          // Update the bookmark's details
          const self = this
          const bookmark = this.persona.bookmarks.find(function (item) {
            return item._id === self.newBookmark._id
          })
          bookmark.url = this.newBookmark.url
          bookmark.title = this.newBookmark.title
          bookmark.icon = this.newBookmark.icon
          bookmark.order = this.newBookmark.order
        } else {
          // Add the bookmark to the persona
          this.newBookmark._id = uuid()
          this.persona.bookmarks.push(this.newBookmark)
        }
        this.savePersona()
      },
      cancelBookmarkEdit () {
        // Close the modal
        this.showBookmarkModal = false
      },
      sortBookmarks () {
        this.persona.bookmarks.sort(function (a, b) {
          if (a.order < b.order) {
            return -1
          } else if (a.order > b.order) {
            return 1
          } else {
            return 0
          }
        })
      },
      editPersona () {
        // Store the persona's details so they can be reset if the user presses the Cancel button
        this.oldPersona = {
          name: this.persona.name,
          shortName: this.persona.shortName,
          color: this.persona.color
        }
        // Show the modal
        this.showPersonaModal = true
      },
      commitPersonaEdit () {
        // Save the persona to the database
        const self = this
        this.$db.update({ _id: this.persona._id }, this.persona, {}, function (err, numReplaced) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          // Do things further up the chain
          self.$emit('persona-edited', self.persona)
          // Close the modal
          self.oldPersona = null
          self.showPersonaModal = false
        })
      },
      cancelPersonaEdit () {
        // Reset the persona's details
        this.persona.name = this.oldPersona.name
        this.persona.shortName = this.oldPersona.shortName
        this.persona.color = this.oldPersona.color
        //  Close the modal
        this.oldPersona = null
        this.showPersonaModal = false
      },
      savePersona () {
        // Save the persona to the database
        const self = this
        this.$db.update({ _id: this.persona._id }, this.persona, {}, function (err, numReplaced) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          // Sort bookmarks
          self.sortBookmarks()
          // Close the modal
          self.showBookmarkModal = false
        })
      },
      deletePersona () {
        if (confirm('Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.') && confirm('Are you really sure you want to delete this persona?')) {
          // Remove the persona from the database
          const self = this
          this.$db.remove({ _id: this.persona._id }, {}, function (err, numReplaced) {
            if (err) {
              alert('ERROR: ' + err)
              return
            }
            // Do things further up the chain
            self.$emit('persona-deleted', self.persona)
            // Close the modal
            self.oldPersona = null
            self.showPersonaModal = false
          })
        }
      }
    }
  }
</script>

<style scoped>

  .home-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 600px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .welcome {
    margin: 40px 0;
  }

  .home-bookmarks {
    margin: 40px 0;
  }

  .bookmark-button {
    border-radius: 2px;
    cursor: default;
    padding: 5px;
    text-align: center;
    width: 100%;
    height: 52px;
    padding: 10px;
  }

  .bookmark-button:hover,
  .bookmark-button:focus {
    background-color: #ddd;
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

  .modal-button-footer {
    text-align: right;
  }

  .modal-button-footer button {
    margin-left: 10px;
    border: 1px solid #aaa;
    border-radius: 10px;
  }

  .modal-button-footer button:hover,
  .modal-button-footer button:focus {
    background-color: #ddd;
  }

  .delete-link {
    color: red;
  }

  .divider {
    color: #aaa;
    margin: 0 2px;
  }

</style>
