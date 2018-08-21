<template>
  <div class="logins-page-wrapper">
    <div class="title">{{ persona.name }} Logins</div>
    <div v-if="(!logins || !logins.length) && !searchText" class="welcome">
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
        <div class="logins-type" :title="item.host">{{ getLoginType(item) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    data () {
      return {
        logins: Array,
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
      this.loadLogins({ db: this.$ldb, personaId: this.persona._id, limit: 100 }).then((response) => {
        this.logins = response
      }).catch((error) => {
        alert('ERROR: ' + error)
      })
    },
    mounted: function () {
      // Focus the search box when the logins page has been mounted
      const box = document.getElementById('logins-search-text-' + this.persona._id)
      box.focus()
    },
    methods: {
      ...mapActions([
        'loadLogins',
        'deleteLogins'
      ]),
      getLoginType (item) {
        if (item.fields) {
          return 'Details'
        } else if (item.ignore) {
          return 'Ignored'
        }
      },
      searchLogins () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(() => {
          this.loadLogins({ db: this.$ldb, personaId: this.persona._id, search: this.searchText, limit: 100 }).then((response) => {
            this.logins = response
            this.searchCompleted = true
          }).catch((error) => {
            alert('ERROR: ' + error)
          })
        }, 500)
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
      deleteSelectedItems () {
        const ids = this.logins.filter((item) => item.isSelected).map((item) => item._id)
        this.deleteLogins({ db: this.$ldb, ids }).then((response) => {
          this.loadLogins({ db: this.$ldb, personaId: this.persona._id, search: this.searchText, limit: 100 }).then(response => {
            this.logins = response
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
    grid-template-columns: 1fr auto;
    grid-column-gap: 20px;
    align-items: center;
    padding: 8px 0;
  }

  .login-host {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
