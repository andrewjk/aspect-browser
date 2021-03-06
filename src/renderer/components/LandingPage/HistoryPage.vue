<template>
  <div class="history-page-wrapper">
    <div class="title">{{ persona.name }} History</div>
    <div v-if="!loading && (!history || !history.length) && !searchText" class="welcome">
      <p>
        This persona's browsing history is empty.
      </p>
    </div>
    <div v-if="history.length || searchText" class="history-search">
      <input type="text" :id="'history-search-text-' + this.persona._id" v-model="searchText" @input="searchHistory" onfocus="this.select();" placeholder="Search history" title="Search this persona's browsing history by title or url">
    </div>
    <div v-if="searchText && searchCompleted" class="history-search">
        Found {{ this.history.length }} search results for '{{ this.searchText }}'
    </div>
    <div v-if="history.length" class="history-edit">
      <label class="history-select-all">
        <input type="checkbox" :checked="selectAll" @change="toggleAll"> {{ showSelectAll ? 'Select all' : 'Select none' }}
      </label>
      <button v-if="showDeleteButton" class="history-delete-button delete-link" @click.stop="deleteSelectedItems" title="Delete the selected history item(s)">
        {{ `Delete the ${selectedCount} selected history ${selectedCount === 1 ? 'item' : 'items'}` }}
      </button>
      <button v-else class="history-delete-button delete-link" @click.stop="clearHistoryAndRelated" title="Clear this persona's history">
        Clear {{ this.persona.name }} history
      </button>
    </div>
    <div class="history-list">
      <div class="history-group" v-for="(gitem) in historyDates" :key="gitem.toLocaleString()">
        <div class="history-group-title">{{ formatDate(gitem) }}</div>
        <div class="history-item" v-for="(item) in history.filter((item) => areDatesEqual(item.dateTime, gitem))" :key="item._id">
          <label class="history-date-time">
            <input type="checkbox" v-model="item.isSelected" @change="selectOne">
            {{ formatTime(item.dateTime) }}
          </label>
          <button class="history-button" @click="openHistory(item, $event)" @auxclick="openHistory(item, $event)" @mousedown="checkMouseButton($event)">
            <div class="history-button-grid">
              <img class="history-icon" :src="item.icon">
              <div class="history-title" :title="item.title">{{ item.title }}</div>
              <div class="history-url" :title="item.url">{{ item.url }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'
  import dateformat from 'dateformat'

  import ConfirmDialog from '../Dialogs/ConfirmDialog'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    data () {
      return {
        loading: true,
        history: [],
        searchText: null,
        focusSearchText: false,
        searchInterval: 0,
        searchCompleted: false,
        selectAll: false,
        showDeleteButton: false,
        showSelectAll: true,
        selectedCount: 0
      }
    },
    computed: {
      historyDates: {
        get () {
          const results = []
          this.history.forEach((item) => {
            const lastResult = results[results.length - 1]
            if (!lastResult || !this.areDatesEqual(lastResult, item.dateTime)) {
              results.push(item.dateTime)
            }
          })
          return results
        }
      }
    },
    async created () {
      const response = await this.loadHistory({ db: this.$hdb, personaId: this.persona._id, limit: 100 })
      this.loading = false
      this.history = response
      this.focusSearchText = true
    },
    updated () {
      if (this.focusSearchText) {
        // Focus the search box when the history items have been loaded
        this.focusSearchText = false
        const box = document.getElementById('history-search-text-' + this.persona._id)
        if (box) box.focus()
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'editHistory',
        'addToHistory',
        'setOpenTabCount'
      ]),
      ...mapActions([
        'openInTab',
        'loadHistory',
        'deleteHistory',
        'clearHistory',
        'clearActivity',
        'clearDownloads'
      ]),
      searchHistory () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(async () => {
          const response = await this.loadHistory({ db: this.$hdb, personaId: this.persona._id, search: this.searchText, limit: 100 })
          this.history = response
          this.searchCompleted = true
        }, 500)
      },
      checkMouseButton (e) {
        // If the middle button was clicked, prevent scrolling from starting so that we can handle opening the url
        if (e.which === 2 || e.which === 4) {
          e.preventDefault()
        }
      },
      openHistory (history, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: history.url, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: history.url })
        this.addToHistory({ tab: activeTab, url: 'aspect://history', title: 'History' })
        this.setOpenTabCount(this.persona)
      },
      areDatesEqual (d1, d2) {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
      },
      formatDate (time) {
        // TODO: Add Today, Yesterday etc
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (this.areDatesEqual(time, today)) {
          return `Today - ${dateformat(time, 'fullDate')}`
        } else if (this.areDatesEqual(time, yesterday)) {
          return `Yesterday - ${dateformat(time, 'fullDate')}`
        } else {
          return dateformat(time, 'fullDate')
        }
      },
      formatTime (time) {
        return dateformat(time, 'shortTime')
      },
      toggleAll () {
        this.checkAll(!this.selectAll)
      },
      checkAll (all) {
        this.history.forEach((item) => {
          item.isSelected = all
        })
        this.showSelectAll = !all
        this.showDeleteButton = all
        this.selectAll = all
        this.selectedCount = all ? this.history.length : 0
      },
      selectOne () {
        this.showDeleteButton = this.history.some((item) => item.isSelected)
        this.selectedCount = this.history.filter((item) => item.isSelected).length
      },
      async deleteSelectedItems () {
        const ids = this.history.filter((item) => item.isSelected).map((item) => item._id)
        await this.deleteHistory({ db: this.$hdb, ids })
        const response = await this.loadHistory({ db: this.$hdb, personaId: this.persona._id, search: this.searchText, limit: 100 })
        this.history = response
        this.showSelectAll = true
        this.showDeleteButton = false
      },
      async clearHistoryAndRelated () {
        const dialog = create(ConfirmDialog)
        const result = await dialog({ content: 'Are you sure you want to clear the browsing history for this persona?' }).transition()
        if (result) {
          this.clearHistory({ db: this.$hdb, personaId: this.persona._id })
          this.clearActivity({ db: this.$adb, personaId: this.persona._id })
          this.clearDownloads({ db: this.$ddb, personaId: this.persona._id })

          const response = await this.loadHistory({ db: this.$hdb, personaId: this.persona._id, limit: 100 })
          this.history = response
        }
      }
    }
  }
</script>

<style scoped>

  .history-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .history-group-title {
    font-size: 18px;
    margin: 15px 0;
  }

  .welcome {
    margin: 40px 0;
  }

  .history-search {
    margin: 20px 0;
  }

  .history-edit {
    color: #888;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    font-size: 13px;
    margin: 10px 0;
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .history-select-all {
    padding: 5px 0;
  }

  .history-delete-button {
    text-align: left;
    width: auto;
    border-radius: 2px;
    padding: 5px 10px;
  }

  .history-delete-button:hover,
  .history-delete-button:focus {
    background-color: #ddd;
  }

  .history-item {
    font-size: 13px;
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .history-date-time {
    color: #888;
  }

  .history-button {
    border-radius: 2px;
    cursor: default;
    padding: 5px;
    text-align: left;
    padding: 10px;
  }

  .history-button:hover,
  .history-button:focus {
    background-color: #eee;
  }

  .history-button-grid {
    display: grid;
    grid-template-columns: auto 1fr 250px;
    grid-column-gap: 20px;
    align-items: center;
  }

  .history-icon {
    height: 16px;
    width: 16px;
    border-radius: 2px;
  }

  .history-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-url {
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
