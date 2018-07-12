<template>
  <div :id="'tab-list-wrapper-' + persona._id" class="tab-list-wrapper">
    <button class="tab-nav" v-show="showTabNavigation" @click="scrollTabsLeft()">
      <button :class="['tab-nav-button', canScrollLeft ? '' : 'disabled']">
        <fa icon="chevron-left"/>
      </button>
    </button>
    <div :id="'tab-list-' + persona._id" class="tab-list" :style="{ maxWidth: maxTabListWidth }">
      <button v-for="(item, index) in tabs" :key="item._id" :class="['tab', item.isActive ? 'active' : 'inactive']" :style="{ width: tabWidth + 'px' }" @click="setActiveIndex(index)" :title="item.title">
        <template v-if="item.url === 'home'">
          <fa icon="home" class="tab-icon"/>
        </template>
        <template v-else-if="item.isLoading">
          <fa icon="spinner" class="tab-icon" spin/>
        </template>
        <template v-else-if="item.icon">
          <img class="tab-icon" :src="item.icon">
        </template>
        <span class="tab-title">{{ item.title }}</span>
        <button class="tab-close" @click.stop="closeTab(index)">
          <fa icon="times"/>
        </button>
      </button>
      <button class="tab-nav" @click="openNewTab()">
        <button class="tab-nav-button">
          <fa icon="plus"/>
        </button>
      </button>
      <!-- <button class="tab-dragger">
        &nbsp;
      </button> -->
    </div>
    <button class="tab-nav" v-show="showTabNavigation" @click="scrollTabsRight()">
      <button :class="['tab-nav-button', canScrollRight ? '' : 'disabled']">
        <fa icon="chevron-right"/>
      </button>
    </button>
    <window-buttons></window-buttons>
  </div>
</template>

<script>
  import WindowButtons from './WindowButtons'

  import uuid from 'uuid/v4'

  export default {
    components: { WindowButtons },
    props: {
      persona: null,
      activity: null
    },
    data () {
      return {
        canScrollLeft: true,
        canScrollRight: false,
        tabs: this.activity[this.persona._id].tabs
      }
    },
    computed: {
      showTabNavigation () {
        if (this.tabs.length > 1) {
          const el = document.getElementById('tab-list-' + this.persona._id)
          const width = el.getBoundingClientRect().width - 40 // For the plus button
          const minWidth = this.tabs.length * 64 // TODO: factor out that magic number
          return width < minWidth
        }
      },
      tabWidth () {
        if (this.tabs.length > 1) {
          const el = document.getElementById('tab-list-' + this.persona._id)
          const width = el.getBoundingClientRect().width - 40 // For the plus button
          const tabWidth = width / this.tabs.length
          return tabWidth
        } else {
          return 200 // TODO: factor out that magic number
        }
      },
      maxTabListWidth () {
        if (this.tabs.length > 1) {
          const el = document.getElementById('tab-list-wrapper-' + this.persona._id)
          const width = el.getBoundingClientRect().width - 80 // For the navigation buttons
          return width
        }
      }
    },
    methods: {
      getActiveTab () {
        return this.tabs.find(function (item) {
          return item.isActive
        })
      },
      // TODO: Emit these up the heirarchy
      setActiveIndex (index) {
        this.tabs.forEach(function (item, i) {
          item.isActive = (i === index)
          // When changing the active tab, set the addresstext back to the url so that it's not confusing when it's returned to
          item.addressText = item.url
        })
      },
      closeTab (index) {
        const isActiveTab = this.tabs[index].isActive
        this.tabs.splice(index, 1)
        if (!this.tabs.length) {
          this.tabs.push({
            _id: uuid(),
            url: 'home',
            addressText: 'home',
            title: 'Home',
            icon: null,
            isActive: true,
            isLoading: false,
            backHistory: [],
            forwardHistory: []
          })
        }
        if (isActiveTab) {
          this.setActiveIndex(Math.min(index, this.tabs.length - 1))
        }
      },
      openNewTab () {
        this.tabs.push({
          _id: uuid(),
          url: 'home',
          addressText: 'home',
          title: 'New tab',
          icon: null,
          isActive: true,
          isLoading: false,
          backHistory: [],
          forwardHistory: []
        })
        this.setActiveIndex(this.tabs.length - 1)
        const box = document.getElementById('address-text-' + this.persona._id)
        box.focus()
        box.select()
      },
      scrollTabsLeft () {
        const el = document.getElementById('tab-list-' + this.persona._id)
        const scrollDistance = el.getBoundingClientRect().width / 4
        const scrollTo = el.scrollLeft - scrollDistance
        el.scrollLeft = Math.max(0, scrollTo)
        this.canScrollLeft = scrollTo > 0
        this.canScrollRight = true
      },
      scrollTabsRight () {
        const el = document.getElementById('tab-list-' + this.persona._id)
        const width = el.getBoundingClientRect().width
        const scrollDistance = width / 4
        const scrollTo = el.scrollLeft + scrollDistance
        el.scrollLeft = Math.min(width, scrollTo)
        this.canScrollLeft = true
        this.canScrollRight = scrollTo < width
      }
    }
  }
</script>

<style scoped>

  .tab-list-wrapper {
    display: flex;
    background-color: #ccc;
    font-size: 13px;
  }

  .tab-list {
    display: flex;
    height: 28px;
    flex: 1 0 0;
    overflow: hidden;
    scroll-behavior: smooth;
  }

  .tab {
    display: inline-flex;
    min-width: 64px;
    max-width: 200px;
    padding: 5px;
    border-right: 1px solid #aaa;
    line-height: 18px;
    height: 28px;
    vertical-align: top;
    text-align: left;
    -webkit-app-region: nodrag;
  }

  .tab-nav {
    display: inline-block;
    line-height: 18px;
    height: 28px;
    vertical-align: top;
    text-align: left;
  }

  /* HACK: the element with -webkit-app-region: drag; only seems to get calculated on load, which is no good for us as we want a dynamic width! */
  /* Apart from that, putting this in the tab-list works nicely */
  .tab-dragger {
    background-color: green;
    display: inline-block;
    line-height: 18px;
    height: 28px;
    min-width: 30px;
    vertical-align: top;
    text-align: left;
    flex: 1;
    border-right: 1px solid #aaa;
    -ms-overflow-style: scrollbar;
    -webkit-app-region: drag;
  }

  .tab.active {
    background-color: #eee;
  }

  .tab.inactive {
    background-color: #ccc;
  }

  .tab.inactive:hover,
  .tab.inactive:focus {
    background-color: #ddd;
  }

  .tab-icon {
    height: 16px;
    width: 16px;
    margin: 1px 5px 1px 0;
  }

  .tab-title {
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;
    flex: 1;
  }

  .tab-close {
    border-radius: 2px;
    height: 18px;
    width: 18px;
    vertical-align: top;
    margin-left: 3px;
    padding: 2px 4px;
  }

  .tab-close:hover,
  .tab-close:focus {
    background-color: #ccc;
  }

  .hidden-button {
    display: none
  }

  .tab-nav-button {
    border-radius: 2px;
    height: 18px;
    width: 18px;
    vertical-align: top;
    padding: 2px 4px;
  }

  .tab-nav-button:hover,
  .tab-nav-button:focus {
    background-color: #eee;
  }

  .tab-nav-button.disabled {
    color: #bbb;
  }

  .tab-nav-button.disabled:hover,
  .tab-nav-button.disabled:focus {
    background-color: inherit;
  }

</style>
