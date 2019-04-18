<template>
  <div class="logins-page-wrapper">
    <div class="title">{{ persona.name }} Logins</div>
    <div v-if="!loading && (!logins || !logins.length) && !searchText" class="welcome">
      <p>
        No login details have been stored for this persona.
      </p>
    </div>
    <div v-if="(logins && logins.length) || searchText" class="logins-search">
      <input type="text" :id="'logins-search-text-' + this.persona._id" v-model="searchText" @input="searchLogins" onfocus="this.select();" placeholder="Search logins" title="Search this persona's browsing logins by title or url">
    </div>
    <div v-if="searchText && searchCompleted" class="logins-search">
        Found {{ this.logins.length }} search results for '{{ this.searchText }}'
    </div>
    <div v-if="logins && logins.length" class="logins-edit">
      <label class="logins-select-all">
        <input type="checkbox" :checked="selectAll" @change="toggleAll"> {{ showSelectAll ? 'Select all' : 'Select none' }}
      </label>
      <button v-if="showDeleteButton" class="logins-delete-button delete-link" @click.stop="deleteSelectedItems" :title="'Delete the selected login details'">
        {{ `Delete the ${selectedCount} selected login${selectedCount === 1 ? '\'s details' : 's\' details'}` }}
      </button>
    </div>
    <div class="logins-list">
      <div class="login-details" v-for="(item) in logins" :key="item._id">
        <label class="login-host">
          <input type="checkbox" v-model="item.isSelected" @change="selectOne">
          {{ item.host }}
        </label>
        <button class="login-button" @click="openLogin(item, $event)">
          <div class="login-button-grid">
            <img class="login-icon" :src="item.icon">
            <div class="login-title" :title="item.title">{{ item.title }}</div>
            <div class="logins-type">{{ getLoginType(item) }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    data () {
      return {
        loading: true,
        logins: [],
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
      const response = await this.loadLogins({ db: this.$ldb, personaId: this.persona._id, limit: 100 })
      this.loading = false
      this.logins = response
      this.focusSearchText = true
    },
    updated () {
      if (this.focusSearchText) {
        // Focus the search box when the logins have been loaded
        this.focusSearchText = false
        const box = document.getElementById('logins-search-text-' + this.persona._id)
        if (box) box.focus()
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addToHistory',
        'setHasOpenTab'
      ]),
      ...mapActions([
        'loadLogins',
        'deleteLogins',
        'saveLoginDetails',
        'openInTab'
      ]),
      getLoginType (item) {
        if (item.fields) {
          return 'Saved'
        } else if (item.ignore) {
          return 'Ignored'
        }
      },
      async searchLogins () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(async () => {
          const response = await this.loadLogins({ db: this.$ldb, personaId: this.persona._id, search: this.searchText, limit: 100 })
          this.logins = response
          this.searchCompleted = true
        }, 500)
      },
      openLogin (login, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: login.url, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: login.url })
        this.addToHistory({ tab: activeTab, url: 'aspect://logins', title: 'Logins' })
        this.setHasOpenTab(this.persona)
      },
      toggleAll () {
        this.checkAll(!this.selectAll)
      },
      checkAll (all) {
        this.logins.forEach((item) => {
          item.isSelected = all
        })
        this.showSelectAll = !all
        this.showDeleteButton = all
        this.selectAll = all
        this.selectedCount = all ? this.logins.length : 0
      },
      selectOne () {
        this.showDeleteButton = this.logins.some((item) => item.isSelected)
        this.selectedCount = this.logins.filter((item) => item.isSelected).length
      },
      async deleteSelectedItems () {
        const ids = this.logins.filter((item) => item.isSelected).map((item) => item._id)
        await this.deleteLogins({ db: this.$ldb, ids })
        const response = await this.loadLogins({ db: this.$ldb, personaId: this.persona._id, search: this.searchText, limit: 100 })
        this.logins = response
        this.showSelectAll = true
        this.showDeleteButton = false
      }
    }
  }
</script>

<style scoped>

  .logins-page-wrapper {
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

  .logins-search {
    margin: 20px 0;
  }

  .logins-edit {
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

  .logins-select-all {
    padding: 8px 0;
  }

  .logins-delete-button {
    text-align: left;
    width: auto;
    border-radius: 2px;
    padding: 5px 10px;
  }

  .logins-delete-button:hover,
  .logins-delete-button:focus {
    background-color: #ddd;
  }

  .login-details {
    font-size: 13px;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .login-host {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .login-button {
    border-radius: 2px;
    cursor: default;
    padding: 5px;
    text-align: left;
    padding: 10px;
  }

  .login-button:hover,
  .login-button:focus {
    background-color: #eee;
  }

  .login-button-grid {
    display: grid;
    grid-template-columns: auto 1fr 50px;
    grid-column-gap: 20px;
    align-items: center;
  }

  .login-icon {
    height: 16px;
    width: 16px;
    border-radius: 2px;
  }

  .login-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .login-url {
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
