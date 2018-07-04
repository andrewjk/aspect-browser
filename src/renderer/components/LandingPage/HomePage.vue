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
      </p>
    </div>
    <div class="home-bookmarks">
      <a v-for="(item, index) in persona.bookmarks" v-bind:key="item.id" class="bookmark" v-on:click="bookmarkClicked(item)">
        <div class="bookmark-icon" v-bind:style="{ backgroundColor: getBackgroundColor(index) }">
          G
        </div>
        <div class="bookmark-title">{{ item.title }}</div>
      </a>
    </div>
    <div class="home-links">
      <a href="#" v-on:click="addBookmark">Add a bookmark</a> |
      <a href="#" v-on:click="editPersona">Edit this persona</a>
    </div>
    <modal v-if="showBookmarkModal" @close="showBookmarkModal = false">
      <h3 slot="header">Add Bookmark:</h3>
      <bookmark-form slot="body" v-bind:bookmark="newBookmark"></bookmark-form>
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
      <persona-form slot="body" v-bind:persona="persona"></persona-form>
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
        showBookmarkModal: false,
        oldBookmark: null,
        newBookmark: null,
        showPersonaModal: false,
        oldPersona: null
      }
    },
    methods: {
      getBackgroundColor (index) {
        return 'red'
      },
      bookmarkClicked (bookmark) {
        const activeTab = this.persona.tabs.find(function (item) {
          return item.isActive
        })

        // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
        activeTab.history.push({
          url: 'home',
          title: 'Home'
        })
        activeTab.forwardHistory = []
        activeTab.historyNavigation = true

        activeTab.isLoading = true
        activeTab.initialUrl = bookmark.url
        activeTab.url = bookmark.url
      },
      addBookmark () {
        // TODO: Should I emit an event so that this gets done centrally in the landing page?
        this.newBookmark = {
          _id: uuid(),
          order: this.persona.bookmarks.length + 1
        }
        this.showBookmarkModal = true
      },
      commitBookmarkEdit () {
        // Add the bookmark to the persona
        this.persona.bookmarks.push(this.newBookmark)
        // Save the persona to the database
        const self = this
        this.$db.update({ _id: this.persona._id }, this.persona, {}, function (err, numReplaced) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          // Close the modal
          self.showBookmarkModal = false
        })
      },
      cancelBookmarkEdit () {
        // Close the modal
        this.showBookmarkModal = false
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
      deletePersona () {
        if (confirm('Are you sure you want to delete this persona? This will delete all bookmarks and saved data associated with it.') && confirm('Are you really sure you want to delete this persona?')) {
          // Remove the persona to the database
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

  .home-bookmarks {
    margin-bottom: 20px;
  }

  .bookmark {
    border-radius: 2px;
    display: inline-block;
    margin-left: 10px;
    cursor: default;
    padding: 5px;
    text-align: center;
  }

  .bookmark:hover {
    background-color: #ddd;
  }

  .bookmark-icon {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    border: 2px solid white;
    color: white;
    line-height: 60px; 
    margin-bottom: 10px;
    font-size: 18px;
  }

  .bookmark-title {
    font-size: 11px;
  }

  .modal-button-footer {
    text-align: right;
  }

  .modal-button-footer button {
    margin-left: 10px;
  }

  .delete-link {
    color: red;
  }

</style>
