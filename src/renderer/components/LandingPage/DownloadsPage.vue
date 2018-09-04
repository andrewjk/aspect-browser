<template>
  <div class="downloads-page-wrapper">
    <div class="title">{{ persona.name }} Downloads</div>
    <div v-if="(!downloads || !downloads.length) && !searchText" class="welcome">
      <p>
        No files have been downloaded for this persona.
      </p>
    </div>
    <div v-if="downloads.length || searchText" class="downloads-search">
      <input type="text" :id="'downloads-search-text-' + this.persona._id" v-model="searchText" @input="searchDownloads" onfocus="this.select();" placeholder="Search downloads" title="Search this persona's browsing downloads by title or url">
    </div>
    <div v-if="searchText && searchCompleted" class="downloads-search">
        Found {{ this.downloads.length }} search results for '{{ this.searchText }}'
    </div>
    <div v-if="downloads.length" class="downloads-edit">
      <label class="downloads-select-all">
        <input type="checkbox" :checked="selectAll" @change="toggleAll"> {{ showSelectAll ? 'Select all' : 'Select none' }}
      </label>
      <button v-if="showDeleteButton" class="downloads-delete-button delete-link" @click.stop="deleteSelectedItems" :title="'Delete the selected downloads items'">
        {{ `Delete the ${selectedCount} selected downloads ${selectedCount === 1 ? 'item' : 'items'}` }}
      </button>
    </div>
    <div class="downloads-list">
      <div class="downloads-group" v-for="(gitem) in downloadsDates" :key="gitem.toLocaleString()">
        <div class="downloads-group-title">{{ formatDate(gitem) }}</div>
        <div class="downloads-item" v-for="(item) in downloads.filter((item) => areDatesEqual(item.dateTime, gitem))" :key="item._id">
          <label class="downloads-date-time">
            <input type="checkbox" v-model="item.isSelected" @change="selectOne">
            {{ formatTime(item.dateTime) }}
          </label>
          <button class="downloads-button" @click="openDownloads(item, $event)">
            <div class="downloads-button-grid">
              <img class="downloads-icon" :src="item.icon">
              <div class="downloads-title" :title="item.title">{{ item.title }}</div>
              <div class="downloads-url" :title="item.url">{{ item.url }}</div>
            </div>
          </button>
        </div>
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
        downloads: [],
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
      downloadsDates: {
        get () {
          const results = []
          this.downloads.forEach((item) => {
            const lastResult = results[results.length - 1]
            if (!lastResult || !this.areDatesEqual(lastResult, item.dateTime)) {
              results.push(item.dateTime)
            }
          })
          return results
        }
      }
    },
    created () {
      this.loadDownloads({ db: this.$ddb, personaId: this.persona._id, limit: 100 }).then((response) => {
        this.downloads = response
        this.focusSearchText = true
      }).catch((err) => {
        alert('ERROR: ' + err)
      })
    },
    updated () {
      if (this.focusSearchText) {
        // Focus the search box when the downloads items have been loaded
        this.focusSearchText = false
        const box = document.getElementById('downloads-search-text-' + this.persona._id)
        if (box) box.focus()
      }
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'openInTab',
        'editDownloads',
        'addToDownloads'
      ]),
      ...mapActions([
        'loadDownloads',
        'deleteDownloads'
      ]),
      searchDownloads () {
        this.checkAll(false)
        this.searchCompleted = false
        if (this.searchInterval) {
          clearTimeout(this.searchInterval)
        }
        this.searchInterval = setTimeout(() => {
          this.loadDownloads({ db: this.$ddb, personaId: this.persona._id, search: this.searchText, limit: 100 }).then((response) => {
            this.downloads = response
            this.searchCompleted = true
          }).catch((err) => {
            alert('ERROR: ' + err)
          })
        }, 500)
      },
      openDownloads (downloads, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: downloads.url, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: downloads.url })
        this.addToDownloads({ tab: activeTab, url: 'aspect://downloads', title: 'Downloads' })
      },
      areDatesEqual (d1, d2) {
        if (!d1.getFullYear) console.log(d1)
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
        this.downloads.forEach((item) => {
          item.isSelected = all
        })
        this.showSelectAll = !all
        this.showDeleteButton = all
        this.selectAll = all
        this.selectedCount = all ? this.downloads.length : 0
      },
      selectOne () {
        this.showDeleteButton = this.downloads.some((item) => item.isSelected)
        this.selectedCount = this.downloads.filter((item) => item.isSelected).length
      },
      deleteSelectedItems () {
        const ids = this.downloads.filter((item) => item.isSelected).map((item) => item._id)
        this.deleteDownloads({ db: this.$ddb, ids }).then((response) => {
          this.loadDownloads({ db: this.$ddb, personaId: this.persona._id, search: this.searchText, limit: 100 }).then(response => {
            this.downloads = response
            this.showSelectAll = true
            this.showDeleteButton = false
          })
        }).catch((err) => {
          alert('ERROR: ' + err)
        })
      }
    }
  }
</script>

<style scoped>

  .downloads-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .downloads-group-title {
    font-size: 18px;
    margin: 15px 0;
  }

  .welcome {
    margin: 40px 0;
  }

  .downloads-search {
    margin: 20px 0;
  }

  .downloads-edit {
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

  .downloads-select-all {
    padding: 5px 0;
  }

  .downloads-delete-button {
    text-align: left;
    width: auto;
    border-radius: 2px;
    padding: 5px 10px;
  }

  .downloads-delete-button:hover,
  .downloads-delete-button:focus {
    background-color: #ddd;
  }

  .downloads-item {
    font-size: 13px;
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-column-gap: 20px;
    align-items: center;
  }

  .downloads-date-time {
    color: #888;
  }

  .downloads-button {
    border-radius: 2px;
    cursor: default;
    padding: 5px;
    text-align: left;
    padding: 10px;
  }

  .downloads-button:hover,
  .downloads-button:focus {
    background-color: #eee;
  }

  .downloads-button-grid {
    display: grid;
    grid-template-columns: auto 1fr 250px;
    grid-column-gap: 20px;
    align-items: center;
  }

  .downloads-icon {
    height: 16px;
    width: 16px;
    border-radius: 2px;
  }

  .downloads-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .downloads-url {
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

</style>
