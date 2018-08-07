<template>
  <div class="history-page-wrapper">
    <div class="title">{{ persona.name }} History</div>
    <div v-if="(!history || !history.length) && !searchText" class="welcome">
      <p>
        This persona's browsing history is empty.
      </p>
    </div>
    <div v-if="(history && history.length) || searchText" class="history-search">
      <input type="text" :id="'history-search-text-' + this.persona._id" v-model="searchText" @input="searchHistory" onfocus="this.select();" placeholder="Search history" title="Search this persona's browsing history by title or url">
    </div>
    <div v-if="searchText && searchCompleted" class="history-search">
        Found {{ this.history.length }} search results for '{{ this.searchText }}'
    </div>
    <div v-if="history && history.length" class="history-edit">
      <label class="history-select-all">
        <input type="checkbox" :checked="selectAll" @change="toggleAll"> {{ showSelectAll ? 'Select all' : 'Select none' }}
      </label>
      <button v-if="showDeleteButton" class="history-delete-button delete-link" @click.stop="deleteSelectedItems" :title="'Delete the selected history items'">
        {{ `Delete the ${selectedCount} selected history ${selectedCount === 1 ? 'item' : 'items'}` }}
      </button>
    </div>
    <div class="history-list">
      <div class="history-item" v-for="(item) in history" :key="item._id">
        <label class="history-date-time">
          <input type="checkbox" v-model="item.isSelected" @change="selectOne">
          {{ formatTime(item.dateTime) }}
        </label>
        <button class="history-button" @click="openHistory(item, $event)">
          <div class="history-button-grid">
            <img class="history-icon" :src="item.icon">
            <div class="history-title" :title="item.title">{{ item.title }}</div>
            <div class="history-url" :title="item.url">{{ item.url }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'

  import dateformat from 'dateformat'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    data () {
      return {
        history: Array,
        searchText: null,
        searchInterval: 0,
        searchCompleted: false,
        selectAll: false,
        showDeleteButton: false,
        showSelectAll: true,
        selectedCount: 0
      }
    },
    created: function () {
      this.loadHistory({ db: this.$hdb, personaId: this.persona._id }).then((response) => {
        this.history = response
      }).catch((error) => {
        alert('ERROR: ' + error)
      })
    },
    mounted: function () {
      // Focus the search box when the history page has been mounted
      const box = document.getElementById('history-search-text-' + this.persona._id)
      box.focus()
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'openInTab',
        'editHistory',
        'addToHistory'
      ]),
      ...mapActions([
        'loadHistory',
        'deleteHistory'
      ]),
      searchHistory () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(() => {
          this.loadHistory({ db: this.$hdb, personaId: this.persona._id, search: this.searchText }).then((response) => {
            this.history = response
            this.searchCompleted = true
          }).catch((error) => {
            alert('ERROR: ' + error)
          })
        }, 500)
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
      deleteSelectedItems () {
        const ids = this.history.filter((item) => item.isSelected).map((item) => item._id)
        this.deleteHistory({ db: this.$hdb, ids }).then((response) => {
          this.loadHistory({ db: this.$hdb, personaId: this.persona._id, search: this.searchText }).then(response => {
            this.history = response
            this.showSelectAll = true
            this.showDeleteButton = false
          })
        }).catch((error) => {
          alert('ERROR: ' + error)
        })
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

  .welcome {
    margin: 40px 0;
  }

  .history-search {
    margin: 20px 0;
  }

  .history-edit {
    color: #aaa;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    font-size: 13px;
    margin: 10px 0;
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-column-gap: 20px;
    align-items: center;
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
    margin: 10px 0;
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    align-items: center;
  }

  .history-date-time {
    color: #aaa;
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
    background-color: #ddd;
  }

  .history-button-grid {
    display: grid;
    grid-template-columns: auto 1fr 200px;
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
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
