<template>
  <div class="find-bookmark-wrapper">
    <div class="find-bookmark">
      <div class="find-input">
        <input type="text" id="find-bookmark-text" v-model="findText" onfocus="this.select();" @keyup="startFind" @keyup.enter="openResult" @keyup.esc="closeFind" @keyup.up="previousResult" @keyup.down="nextResult" placeholder="Find a bookmark">
        <div v-show="results.length" id="find-bookmark-dropdown">
          <ul class="find-bookmark-dropdown-list">
            <li v-for="(item, index) in results" :key="item.tid" :class="['find-bookmark-dropdown-item', item.isActive ? 'active' : '']" @mouseenter="setActiveIndex(index)" @click="openResult">
              {{ item.text }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations } from 'vuex'

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
        personas: state => state.Store.personas,
        activity: state => state.Store.activity
      }),
      ...mapGetters([
        'getActivePersona'
      ])
    },
    mounted: function () {
      const box = document.getElementById('find-bookmark-text')
      const dropdown = document.getElementById('find-bookmark-dropdown')
      dropdown.style.width = box.getBoundingClientRect().width + 'px'
    },
    methods: {
      ...mapMutations([
        'setActivePersonaIndex',
        'setActiveTabIndex',
        'setTabDetails',
        'openInTab',
        'addToHistory'
      ]),
      startFind () {
        if (this.findText !== this.lastFindText) {
          if (this.findText.length < 2) {
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
              const tabs = this.activity[activePersona._id].tabs
              if (tabs.length === 1 && !tabs[0].url) {
                const activeTab = tabs[0]
                this.setTabDetails({ persona: activePersona, tab: activeTab, isLoading: true, url: result.url })
                this.addToHistory({ tab: activeTab, url: null, title: 'Home' })
              } else {
                this.openInTab({ url: result.url, background: false })
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

  .find-bookmark-wrapper {
    font-size: 16px;
    padding: 4px;
  }

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
