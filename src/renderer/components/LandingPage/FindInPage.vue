<template>
  <div class="find-in-page-wrapper">
    <div class="find-in-page">
      <div class="find-input">
        <input type="text" :id="'find-text-' + persona._id" :class="[this.haveSearched && this.findText && !this.matchCount ? 'not-found' : '']" v-model="findText" onfocus="this.select();" @keyup.enter.exact="goToNext" @keyup.shift.enter="goToPrevious" @keyup.esc="closeFind" @keydown="keyDown" placeholder="Find in page">
      </div>
      <button :class="['find-button', canNavigate() ? '' : 'disabled']" :tabindex="canNavigate() ? '0' : '-1'" @click="goToPrevious" title="Go to the previous match">
        <fa icon="chevron-up"/>
      </button>
      <button :class="['find-button', canNavigate() ? '' : 'disabled']" :tabindex="canNavigate() ? '0' : '-1'" @click="goToNext" title="Go to the next match">
        <fa icon="chevron-down"/>
      </button>
      <div class="find-result">
        <span>{{ matchNumber }} of {{ matchCount }} matches</span>
      </div>
      <button class="find-button" @click="closeFind" title="Close the find bar">
        <fa icon="times"/>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    props: {
      persona: null
    },
    data () {
      return {
        findText: '',
        activeWebview: null,
        haveSearched: false,
        haveFoundText: false,
        matchNumber: 0,
        matchCount: 0
      }
    },
    watch: {
      findText (val, oldVal) {
        this.haveSearched = false
        if (val) {
          this.startFind()
        } else {
          if (this.activeWebview) {
            this.activeWebview.stopFindInPage('clearSelection')
          }
        }
      }
    },
    computed: {
      ...mapState({
        activity: state => state.Store.activity
      })
    },
    methods: {
      getActiveWebview () {
        const tabs = this.activity[this.persona._id].tabs
        const activeTab = tabs.find((item) => {
          return item.isActive
        })
        return activeTab.webview
      },
      canNavigate () {
        return this.haveFoundText
      },
      startFind () {
        if (this.activeWebview) {
          this.activeWebview.removeEventListener('found-in-page', this.foundInPage)
        }
        // Default to nothing found, which will get overridden as soon as there's a found-in-page event
        this.haveSearched = true
        this.haveFoundText = false
        // Do the find
        this.activeWebview = this.getActiveWebview()
        if (this.activeWebview) {
          this.activeWebview.addEventListener('found-in-page', this.foundInPage)
          this.activeWebview.addEventListener('keydown', this.keyDown)
          this.activeWebview.findInPage(this.findText)
        }
      },
      goToPrevious () {
        if (this.activeWebview) {
          this.activeWebview.findInPage(this.findText, { forward: false, findNext: true })
        } else {
          this.startFind()
        }
      },
      goToNext () {
        if (this.activeWebview) {
          this.activeWebview.findInPage(this.findText, { findNext: true })
        } else {
          this.startFind()
        }
      },
      keyDown (e) {
        if (e.keyCode === 114) { // F3
          if (this.findText) {
            if (e.shiftKey) {
              this.goToPrevious()
            } else {
              this.goToNext()
            }
          }
        }
      },
      closeFind () {
        if (this.activeWebview) {
          this.activeWebview.stopFindInPage('keepSelection')
          this.activeWebview.focus()
          this.activeWebview = null
        }
        this.$emit('close-find-in-page')
      },
      foundInPage (e) {
        this.haveFoundText = true
        this.matchNumber = e.result.activeMatchOrdinal
        this.matchCount = e.result.matches
      }
    }
  }
</script>

<style scoped>

  .find-in-page-wrapper {
    background-color: #eee;
    height: 34px;
    border-top: 1px solid #ddd;
    font-size: 14px;
    padding: 4px;
  }

  .find-in-page {
    display: flex;
    line-height: 24px;
  }

  .find-button {
    border: inherit;
    background-color: inherit;
    border-radius: 2px;
    display: inline-block;
    padding: 0 10px;
  }

  .find-button:hover,
  .find-button:focus {
    background-color: #ddd;
  }

  .find-button.disabled {
    color: #bbb;
  }

  .find-button.disabled:hover {
    background-color: inherit;
  }

  .find-input {
    flex-grow: 1;
    padding: 0 5px;
    max-width: 280px;
  }

  .find-input > input {
    width: 100%;
  }

  .find-input > input.not-found {
    background-color: pink;
  }

  .find-result {
    color: #888;
    flex-grow: 1;
    padding: 0 5px;
  }

</style>
