<template>
  <div class="address-bar-wrapper">
    <div class="address-bar">
      <button :class="['address-button', canGoBack() ? '' : 'disabled']" :tabindex="canGoBack() ? '0' : '-1'" @click="goBack" :title="getBackHistory()">
        <fa icon="arrow-left"/>
      </button>
      <button :class="['address-button', canGoForward() ? '' : 'disabled']" :tabindex="canGoForward() ? '0' : '-1'" @click="goForward" :title="getForwardHistory()">
        <fa icon="arrow-right"/>
      </button>
      <button class="address-button" @click="goHome" title="Open the home page for this persona">
        <fa icon="home"/>
      </button>
      <div class="address-input">
        <input type="text" :id="'address-text-' + persona._id" v-model="activeTab.addressText" onfocus="this.select();" @keypress="keyPressed" title="Type a URL or something to search for">
      </div>
      <button class="address-button" @click="addBookmark" title="Add the current page to this persona's bookmarks">
        <fa icon="star"/>
      </button>
      <button v-if="activeTab.isLoading" class="address-button" @click="stopLoad" title = "Stop loading the current page">
        <fa icon="times"/>
      </button>
      <button v-else class="address-button" @click="reload" title = "Reload the current page">
        <fa icon="sync-alt"/>
      </button>
    </div>
    <modal v-if="showBookmarkModal" @close="showBookmarkModal = false">
      <h3 slot="header">Add Bookmark:</h3>
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
  </div>
</template>

<script>
  import Modal from './Modal'
  import BookmarkForm from './BookmarkForm'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    components: { Modal, BookmarkForm },
    props: {
      persona: null,
      activeTab: null
    },
    data () {
      return {
        isTextSelected: false,
        showBookmarkModal: false,
        newBookmark: null
      }
    },
    beforeUpdate: function () {
      // HACK: In various places we set some text and call select() on the address text box, which gets overridden when redrawing
      // This is the only way I can figure out how to maintain the selection before and after redrawing
      const box = document.getElementById('address-text-' + this.persona._id)
      this.isTextSelected = box.selectionStart === 0 && box.selectionEnd === box.value.length
    },
    updated: function () {
      if (this.isTextSelected) {
        const box = document.getElementById('address-text-' + this.persona._id)
        box.select()
        this.isTextSelected = false
      }
    },
    methods: {
      // TODO: These should probably all emit events so they can be handled centrally
      canGoBack () {
        return this.activeTab.backHistory && this.activeTab.backHistory.length
      },
      goBack () {
        if (this.activeTab.backHistory.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          this.activeTab.forwardHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.url = this.activeTab.backHistory.pop().url
          this.activeTab.backHistoryNavigation = true
        }
      },
      getBackHistory () {
        return this.activeTab.backHistory ? this.activeTab.backHistory.map(function (item) { return item.url }).join('\n') : []
      },
      canGoForward () {
        return this.activeTab.forwardHistory && this.activeTab.forwardHistory.length
      },
      goForward () {
        if (this.activeTab.forwardHistory.length) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          if (!this.activeTab.forwardHistory) {
            this.activeTab.forwardHistory = []
          }
          this.activeTab.backHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.url = this.activeTab.forwardHistory.pop().url
          this.activeTab.backHistoryNavigation = true
        }
      },
      getForwardHistory () {
        return this.activeTab.forwardHistory ? this.activeTab.forwardHistory.map(function (item) { return item.url }).join('\n') : []
      },
      goHome () {
        if (this.activeTab) {
          // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
          if (!this.activeTab.backHistory) {
            this.activeTab.backHistory = []
          }
          this.activeTab.backHistory.push({
            url: this.activeTab.url,
            title: this.activeTab.title
          })
          this.activeTab.forwardHistory = []
          this.activeTab.url = 'home'
          this.activeTab.addressText = 'home'
          this.activeTab.title = 'Home'
        }
      },
      keyPressed (e) {
        if (e.keyCode === 13) {
          if (this.activeTab) {
            let url = this.activeTab.addressText.trim()
            if (url.indexOf('.') !== -1 && url.indexOf(' ') === -1) {
              // If it has a dot and no spaces, treat it as a URL
              // Might need to add http:// on the front there
              if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                url = 'https://' + url
              }
            } else {
              // Search for whatever was typed in
              url = 'https://duckduckgo.com/?q=' + url
            }
            this.activeTab.addressText = url

            if (this.activeTab.webview) {
              this.activeTab.webview.loadURL(url)
            } else {
              this.activeTab.url = url
            }
          }
        }
      },
      addBookmark () {
        // TODO: Should I emit an event so that this gets done centrally in the landing page?
        this.newBookmark = {
          _id: uuid(),
          url: this.activeTab.url,
          title: this.activeTab.title,
          icon: this.activeTab.icon,
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
          self.newBookmark = null
          self.showBookmarkModal = false
        })
      },
      cancelBookmarkEdit () {
        //  Close the modal
        this.newBookmark = null
        this.showBookmarkModal = false
      },
      stopLoad () {
        if (this.activeTab.webview) {
          this.activeTab.webview.stop()
        }
      },
      reload () {
        if (this.activeTab.webview) {
          this.activeTab.webview.reload()
        }
      }
    }
  }
</script>

<style scoped>

  .address-bar-wrapper {
    background-color: #eee;
    height: 34px;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
    padding: 4px;
  }

  .address-bar {
    display: flex;
    line-height: 24px;
  }

  .address-button {
    border: inherit;
    background-color: inherit;
    border-radius: 2px;
    display: inline-block;
    padding: 0 10px;
  }

  .address-button:hover,
  .address-button:focus {
    background-color: #ddd;
  }

  .address-button.disabled {
    color: #bbb;
  }

  .address-button.disabled:hover {
    background-color: inherit;
  }

  .address-input {
    flex-grow: 1;
    padding: 0 5px;
  }

  .address-input > input {
    width: 100%;
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

</style>
