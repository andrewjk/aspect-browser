<template>
  <div class="address-input">
    <input type="text" :id="'address-text-' + persona._id" v-model="addressText" onfocus="this.select();" @keypress="keyPressed" @keyup="startFind" @keyup.enter="openResult" @keyup.esc="closeFind" @keyup.up="previousResult" @keyup.down="nextResult" placeholder="Search or enter an address" title="The address bar, where you can type something to search for or enter a Web address">
    <div v-show="showDropDown" class="address-text-dropdown" :id="'address-text-dropdown-' + persona._id">
      <ul class="address-text-list">
        <li v-for="(item, index) in results" :key="item.tid" :class="['address-text-item', item.isActive ? 'active' : '']" @click="openResultAtIndex(index)">
          <div class="address-text-item-grid" :title="item.title">
            <div class="address-text-hint-icon">
              <fa :icon="item.hintIcon"/>
            </div>
            <img v-if="item.icon" class="address-text-icon" :src="item.icon">
            <div v-else>
              &nbsp;
            </div>
            <div class="address-text-text">
              {{ item.text }} <span v-if="item.type !== 'url'" class="address-text-url">- {{ item.url }}</span>
            </div>
            <div class="address-text-hint">
              {{ item.hint }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  export default {
    props: {
      persona: null
    },
    data () {
      return {
        lastAddressText: '',
        results: Array,
        showDropDown: false
      }
    },
    computed: {
      ...mapState({
        activity: state => state.Store.activity,
        systemSettings: state => state.Store.systemSettings
      }),
      ...mapGetters([
        'getActiveTab'
      ]),
      // Computed properties for v-model binding
      addressText: {
        get () {
          return this.getActiveTab.addressText
        },
        set (value) {
          this.setTabDetails({ persona: this.persona, tab: this.getActiveTab, addressText: value })
        }
      }
    },
    mounted: function () {
      this.calculateBoxSize()
      window.addEventListener('resize', (e) => {
        this.calculateBoxSize()
      })
    },
    updated: function () {
      // HACK: Is this a good way to do this?
      if (this.results.length) {
        document.removeEventListener('click', this.closeFind)
        document.addEventListener('click', this.closeFind)
      } else {
        document.removeEventListener('click', this.closeFind)
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addToHistory',
        'goToUrl',
        'goHome',
        'openInTab',
        'setActiveTabIndex'
      ]),
      ...mapActions([
        'loadHistory'
      ]),
      calculateBoxSize () {
        const box = document.getElementById('address-text-' + this.persona._id)
        const dropdown = document.getElementById('address-text-dropdown-' + this.persona._id)
        dropdown.style.width = box.getBoundingClientRect().width + 'px'
      },
      keyPressed (e) {
        // if (e.keyCode === 13) {
        //   let tab = this.getActiveTab
        //   let url = tab.addressText.trim()
        //   if (url) {
        //     this.goToUrl({ tab, url })
        //   } else {
        //     this.goHome(tab)
        //   }
        // }
      },
      startFind (e) {
        // Only want to find if the user pressed backspace, delete or a key that changes the text
        if ((e.ctrlKey || e.metaKey) ||
            (e.keyCode !== 8 && e.keyCode !== 46 && !this.shouldStartFind(e.key))) {
          return
        }

        // Only want to find if the text has changed
        if (this.addressText !== this.lastAddressText) {
          if (!this.addressText || !this.addressText.length) {
            this.results = []
            this.showDropDown = false
            return
          }

          this.lastAddressText = this.addressText
          const results = []

          // Max ten items
          const maxItems = 10

          // 1. Go to URL/search for text...
          if (this.addressText.indexOf('.') !== -1 && this.addressText.indexOf(' ') === -1) {
            // If it has a dot and no spaces, treat it as a URL
            results.push({
              type: 'url',
              text: `Open '${this.addressText}'`,
              url: this.addressText,
              hintIcon: 'globe',
              hint: 'Open URL',
              title: `Open '${this.addressText}'`,
              isActive: false
            })
          } else {
            // Search for whatever was typed in
            results.push({
              type: 'url',
              text: `Search for '${this.addressText}'`,
              url: this.addressText,
              hintIcon: 'search',
              hint: 'Search',
              title: `Search for '${this.addressText}'`,
              isActive: false
            })
          }

          // 2. Tabs that are open (other than this one)
          this.activity[this.persona._id].tabs.forEach((tab, index) => {
            if (!tab.isActive) {
              if (tab.title.toLowerCase().indexOf(this.addressText.toLowerCase()) !== -1 ||
                  tab.url.toLowerCase().indexOf(this.addressText.toLowerCase()) !== -1) {
                if (results.length < maxItems && !results.find((item) => item.url === tab.url)) {
                  results.push({
                    type: 'tab',
                    index: index,
                    icon: tab.icon,
                    text: tab.title,
                    url: tab.url,
                    hintIcon: 'folder',
                    hint: 'Switch to this tab',
                    title: 'Switch to ' + tab.url,
                    isActive: false
                  })
                }
              }
            }
          })

          // 3. History
          if (results.length < maxItems) {
            this.loadHistory({ db: this.$hdb, personaId: this.persona._id, search: this.addressText }).then((response) => {
              response.forEach((history) => {
                if (results.length < maxItems && !results.find((item) => item.url === history.url)) {
                  results.push({
                    type: 'history',
                    id: history._id,
                    icon: history.icon,
                    text: history.title,
                    url: history.url,
                    hintIcon: 'history',
                    hint: 'Open this page',
                    title: 'Open ' + history.url,
                    isActive: false
                  })
                }
              })

              // 4. Bookmarks
              if (results.length < maxItems) {
                this.persona.bookmarks.forEach((bookmark, index) => {
                  if (bookmark.title.toLowerCase().indexOf(this.addressText.toLowerCase()) !== -1 ||
                      bookmark.url.toLowerCase().indexOf(this.addressText.toLowerCase()) !== -1) {
                    if (results.length < maxItems && !results.find((item) => item.url === bookmark.url)) {
                      results.push({
                        type: 'bookmark',
                        id: bookmark._id,
                        icon: bookmark.icon,
                        text: bookmark.title,
                        url: bookmark.url,
                        hintIcon: 'star',
                        hint: 'Open this bookmark',
                        title: 'Open ' + bookmark.url,
                        isActive: false
                      })
                    }
                  }
                })
              }

              if (results.length) {
                results[0].isActive = true
              }
              this.results = results
              this.showDropDown = results.length
            }).catch((error) => {
              alert('ERROR: ' + error)
            })
          }
        }
      },
      shouldStartFind (text) {
        // HACK: This seems to be the best way to detect a printable character, from https://stackoverflow.com/a/40932401
        let shouldInsert = false
        if (text.length === 1) {
          shouldInsert = true
        } else {
          // Check if it's a multi-length character (e.g. a Unicode emoji)
          // TODO: Generate this (and the charCodeAt values) once
          const alphabets = 'AZaz09'
          let notEvenASymbol = false
          for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i)
            if ((charCode >= alphabets.charCodeAt(0) && charCode <= alphabets.charCodeAt(1)) ||
                (charCode >= alphabets.charCodeAt(2) && charCode <= alphabets.charCodeAt(3)) ||
                (charCode >= alphabets.charCodeAt(4) && charCode <= alphabets.charCodeAt(5))) {
              notEvenASymbol = true
              break
            }
          }
          shouldInsert = !notEvenASymbol
        }
        return shouldInsert
      },
      closeFind () {
        this.showDropDown = false
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
          if (r.isActive) {
            this.addressText = r.url
          }
        })
      },
      nextResult () {
        if (this.results.length) {
          this.showDropDown = true
          const index = this.getActiveIndex()
          const newIndex = index < this.results.length - 1 ? index + 1 : 0
          this.setActiveIndex(newIndex)
        }
      },
      previousResult () {
        const index = this.getActiveIndex()
        const newIndex = index > 0 ? index - 1 : this.results.length - 1
        this.setActiveIndex(newIndex)
      },
      openResultAtIndex (index) {
        this.setActiveIndex(index)
        this.openResult()
      },
      openResult (index) {
        this.closeFind()
        const result = this.results.find((r, i) => {
          return r.isActive
        })
        if (result) {
          const activeTab = this.getActiveTab
          if (result.type === 'tab') {
            // Set this tab's text back to its URL, and switch to the selected tab
            this.setTabDetails({ persona: this.persona, tab: activeTab, addressText: activeTab.url })
            this.setActiveTabIndex(result.index)
          } else {
            // Open the entered URL and focus the webview
            let url = this.addressText.trim()
            if (url.indexOf('aspect://') === 0) {
              this.addToHistory({ tab: activeTab, url, title: activeTab.title })
            }
            if (url) {
              this.goToUrl({ tab: activeTab, url })
            } else {
              this.goHome(activeTab)
            }
            if (activeTab.webview) {
              activeTab.webview.focus()
            }
          }
        }
      }
    }
  }
</script>

<style scoped>

  .address-input {
    flex-grow: 1;
    padding: 0 5px;
  }

  .address-input > input {
    width: 100%;
  }

  .address-text-dropdown {
    background-color: white;
    border: 1px solid #ddd;
    position: absolute;
  }

  .address-text-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .address-text-item {
    padding: 6px;
    cursor: default;
  }

  .address-text-item:hover {
    background-color: #eee;
  }

  .address-text-item.active {
    background-color: #338fff;
    color: white;
  }

  .address-text-item-grid {
    display: grid;
    grid-template-columns: auto 16px 1fr auto;
    grid-column-gap: 10px;
    align-items: center;
  }

  .address-text-hint-icon {
    font-size: 13px;
    color: #888;
  }

  .address-text-icon{
    height: 16px;
    width: 16px;
  }

  .address-text-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .address-text-url {
    font-size: 13px;
    color: #888;
  }

  .address-text-hint {
    font-size: 13px;
    color: #888;
  }

  .address-text-item.active .address-text-hint-icon,
  .address-text-item.active .address-text-url,
  .address-text-item.active .address-text-hint {
    color: white;
  }

</style>
