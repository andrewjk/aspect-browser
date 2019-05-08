<template>
  <div class="edit-dialog dialog-mask">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>Find Bookmark:</h2>
      </header>
      <div class="dialog-body">
        <div class="find-input">
          <input type="text" id="find-bookmark-text" v-model="findText" autofocus onfocus="this.select();" @keyup="startFind" @keyup.enter="openResult" @keyup.esc="closeFind" @keyup.up="previousResult" @keyup.down="nextResult" placeholder="Find a bookmark">
          <div v-show="results.length" id="find-bookmark-dropdown">
            <ul class="find-bookmark-dropdown-list">
              <li v-for="(item, index) in results" :key="item.tid" :class="['find-bookmark-dropdown-item', item.isActive ? 'active' : '']" @mouseenter="setActiveIndex(index)" @click="openResult">
                {{ item.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <footer>
        <button class="cancel" @click="$close(false)">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  export default {
    data () {
      return {
        lastFindText: '',
        findText: '',
        results: []
      }
    },
    computed: {
      ...mapState({
        personas: state => state.Personas.personas
      }),
      ...mapGetters([
        'getActivePersona'
      ])
    },
    mounted () {
      // HACK: The autofocus attribute doesn't seem to work all the time?
      document.getElementById('find-bookmark-text').focus()
    },
    updated () {
      const box = document.getElementById('find-bookmark-text')
      const dropdown = document.getElementById('find-bookmark-dropdown')
      dropdown.style.width = box.getBoundingClientRect().width + 'px'
    },
    methods: {
      ...mapMutations([
        'setActivePersonaIndex',
        'setTabDetails',
        'addToHistory',
        'setOpenTabCount'
      ]),
      ...mapActions([
        'openInTab'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      startFind () {
        if (this.findText !== this.lastFindText) {
          if (!this.findText.length) {
            this.results = []
            return
          }

          this.lastFindText = this.findText
          const results = []
          this.personas.forEach((p, pi) => {
            // If the persona matches, add it to the results
            if (p.name.toLowerCase().indexOf(this.findText.toLowerCase()) !== -1) {
              results.push({
                pid: p._id,
                pindex: pi,
                text: p.name,
                isActive: false
              })
            }
            // If the bookmark matches, add it to the results
            p.bookmarks.forEach((t, ti) => {
              if (p.name.toLowerCase().indexOf(this.findText.toLowerCase()) !== -1 ||
                  t.title.toLowerCase().indexOf(this.findText.toLowerCase()) !== -1) {
                results.push({
                  pid: p._id,
                  pindex: pi,
                  tid: t._id,
                  text: p.name + ': ' + t.title,
                  url: t.url,
                  isActive: false
                })
              }
            })
          })
          if (results.length) {
            results[0].isActive = true
          }
          this.results = results
        }
      },
      getActiveIndex () {
        for (let i = 0; i < this.results.length; i++) {
          if (this.results[i].isActive) {
            return i
          }
        }
        return -1
      },
      setActiveIndex (index) {
        this.results.forEach((r, i) => {
          r.isActive = (i === index)
        })
      },
      nextResult () {
        const index = this.getActiveIndex()
        const newIndex = index < this.results.length - 1 ? index + 1 : 0
        this.setActiveIndex(newIndex)
      },
      previousResult () {
        const index = this.getActiveIndex()
        const newIndex = index > 0 ? index - 1 : this.results.length - 1
        this.setActiveIndex(newIndex)
      },
      openResult () {
        const result = this.results.find((r, i) => {
          return r.isActive
        })
        if (result) {
          this.setActivePersonaIndex(result.pindex)
          if (result.url) {
            const activePersona = this.getActivePersona
            if (activePersona) {
              const tabs = activePersona.tabs
              if (tabs.length === 1 && tabs[0].url.indexOf('aspect://') === 0) {
                const activeTab = tabs[0]
                this.setTabDetails({ persona: activePersona, tab: activeTab, isLoading: true, url: result.url })
                this.addToHistory({ tab: activeTab, url: 'aspect://home', title: 'Home' })
                this.setOpenTabCount(activePersona)
              } else {
                this.openInTab({ url: result.url, background: false })
                this.setOpenTabCount(activePersona)
              }
            }
          }
          this.$emit('close-find-bookmark')
        }
      },
      closeFind () {
        this.$emit('close-find-bookmark')
      }
    }
  }
</script>

<style scoped>

  #find-bookmark-dropdown {
    background-color: white;
    border: 1px solid #ddd;
    position: absolute;
  }

  .find-bookmark-dropdown-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .find-bookmark-dropdown-item {
    padding: 6px;
    cursor: default;
  }

  .find-bookmark-dropdown-item.active {
    background-color: #338fff;
    color: white;
  }

</style>
