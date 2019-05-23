<template>
  <div class="sessions-page-wrapper">
    <div class="title">{{ persona.name }} Sessions</div>
    <div v-if="!loading && (!sessions || !sessions.length) && !searchText" class="welcome">
      <p>
        No sessions have been saved for this persona.
      </p>
    </div>
    <div v-if="sessions.length || searchText" class="sessions-search">
      <input type="text" :id="'sessions-search-text-' + this.persona._id" v-model="searchText" @input="searchSessions" onfocus="this.select();" placeholder="Search sessions" title="Search this persona's browsing sessions by title or url">
    </div>
    <div v-if="searchText && searchCompleted" class="sessions-search">
        Found {{ this.sessions.length }} search results for '{{ this.searchText }}'
    </div>
    <div v-if="sessions.length" class="sessions-edit">
      <label class="sessions-select-all">
        <input type="checkbox" :checked="selectAll" @change="toggleAll"> {{ showSelectAll ? 'Select all' : 'Select none' }}
      </label>
      <button v-if="showDeleteButton" class="sessions-delete-button delete-link" @click.stop="deleteSelectedItems" title="Delete the selected session(s)">
        {{ `Delete the ${selectedCount} selected ${selectedCount === 1 ? 'session' : 'sessions'}` }}
      </button>
      <button v-else class="sessions-delete-button delete-link" @click.stop="clearSessionedItems" title="Clear this persona's sessions">
        Clear {{ this.persona.name }} sessions
      </button>
    </div>
    <div class="sessions-list">
      <div class="sessions-item" v-for="item in sessions" :key="item._id">
        <div class="sessions-item-grid">
          <button class="expander-button" @click="item.isExpanded = !item.isExpanded">
            <fa :icon="item.isExpanded ? 'caret-down' : 'caret-right'"/>
          </button>
          <label class="sessions-date-time">
            <input type="checkbox" v-model="item.isSelected" @change="selectOne">
            Select
          </label>
          <button class="sessions-button" @click="openSession(item)">
            {{ item.name }}
          </button>
        </div>
        <div v-show="item.isExpanded">
          <div class="sessions-site" v-for="site in item.sites" :key="site._id">
            <div class="sessions-site-grid">
              <div>&nbsp;</div>
              <button class="sessions-button" @click="openSite(site, $event)">
                <div class="sessions-button-grid">
                  <img class="sessions-icon" :src="site.icon">
                  <div class="sessions-title" :title="site.title">{{ site.title }}</div>
                  <div class="sessions-url" :title="site.url">{{ site.url }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'
  import { create } from 'vue-modal-dialogs'

  import ConfirmDialog from '../Dialogs/ConfirmDialog'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    data () {
      return {
        loading: true,
        sessions: [],
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
    async created () {
      const response = await this.loadSessions({ db: this.$sdb, personaId: this.persona._id, limit: 100 })
      this.loading = false
      this.sessions = response
      this.focusSearchText = true
    },
    updated () {
      if (this.focusSearchText) {
        // Focus the search box when the sessioned items have been loaded
        this.focusSearchText = false
        const box = document.getElementById('sessions-search-text-' + this.persona._id)
        if (box) box.focus()
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'editSessions',
        'addToHistory',
        'setOpenTabCount'
      ]),
      ...mapActions([
        'openInTab',
        'loadSessions',
        'deleteSessions',
        'clearSessions',
        'restoreSession'
      ]),
      searchSessions () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(async () => {
          const response = await this.loadSessions({ db: this.$sdb, personaId: this.persona._id, search: this.searchText, limit: 100 })
          this.sessions = response
          this.searchCompleted = true
        }, 500)
      },
      toggleAll () {
        this.checkAll(!this.selectAll)
      },
      checkAll (all) {
        this.sessions.forEach((item) => {
          item.isSelected = all
        })
        this.showSelectAll = !all
        this.showDeleteButton = all
        this.selectAll = all
        this.selectedCount = all ? this.sessions.length : 0
      },
      selectOne () {
        this.showDeleteButton = this.sessions.some((item) => item.isSelected)
        this.selectedCount = this.sessions.filter((item) => item.isSelected).length
      },
      async deleteSelectedItems () {
        const ids = this.sessions.filter((item) => item.isSelected).map((item) => item._id)
        await this.deleteSessions({ db: this.$adb, ids })
        const response = await this.loadSessions({ db: this.$sdb, personaId: this.persona._id, search: this.searchText, limit: 100 })
        this.sessions = response
        this.showSelectAll = true
        this.showDeleteButton = false
      },
      async clearSessionedItems () {
        const dialog = create(ConfirmDialog)
        const result = await dialog({ content: 'Are you sure you want to clear the sessions for this persona?' }).transition()
        if (result) {
          this.clearSessions({ db: this.$adb, personaId: this.persona._id })
          const response = await this.loadSessions({ db: this.$sdb, personaId: this.persona._id, limit: 100 })
          this.sessions = response
        }
      },
      openSession (item) {
        this.restoreSession({ adb: this.$adb, sdb: this.$sdb, sessionId: item._id, personaId: this.persona._id })
      },
      openSite (site, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: site.url, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: site.url })
        this.addToHistory({ tab: activeTab, url: 'aspect://sessions', title: 'Sessions' })
        this.setOpenTabCount(this.persona)
      }
    }
  }
</script>

<style scoped>

  .sessions-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .sessions-group-title {
    font-size: 18px;
    margin: 15px 0;
  }

  .welcome {
    margin: 40px 0;
  }

  .sessions-search {
    margin: 20px 0;
  }

  .sessions-edit {
    color: #888;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    font-size: 13px;
    margin: 10px 0;
    display: grid;
    grid-template-columns: 118px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .sessions-select-all {
    padding: 5px 0;
  }

  .sessions-delete-button {
    text-align: left;
    width: auto;
    border-radius: 2px;
    padding: 5px 10px;
  }

  .sessions-delete-button:hover,
  .sessions-delete-button:focus {
    background-color: #ddd;
  }

  .sessions-item {
    font-size: 13px;
  }

  .sessions-item-grid {
    display: grid;
    grid-template-columns: 28px 70px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .expander-button,
  .sessions-button {
    border-radius: 2px;
    cursor: default;
    padding: 5px;
    text-align: left;
    padding: 10px;
  }

  .expander-button:hover,
  .expander-button:focus,
  .sessions-button:hover,
  .sessions-button:focus {
    background-color: #eee;
  }

  .sessions-site-grid {
    display: grid;
    grid-template-columns: 118px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .sessions-button-grid {
    display: grid;
    grid-template-columns: auto 1fr 250px;
    grid-column-gap: 20px;
    align-items: center;
  }

  .sessions-icon {
    height: 16px;
    width: 16px;
    border-radius: 2px;
  }

  .sessions-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sessions-url {
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
