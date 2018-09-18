<template>
  <div :id="'tab-list-wrapper-' + persona._id" class="tab-list-wrapper">
    <button class="tab-nav" v-show="showTabNavigation" @click="scrollTabsLeft()">
      <button :class="['tab-nav-button', canScrollLeft ? '' : 'disabled']">
        <fa icon="chevron-left"/>
      </button>
    </button>
    <div :id="'tab-list-' + persona._id" class="tab-list" :style="{ maxWidth: maxTabListWidth }">
      <button v-for="(item, index) in tabs" :key="item._id" :class="['tab', item.isActive ? 'active' : 'inactive']" :style="{ width: tabWidth + 'px' }" @click.left="setActiveTabIndex(index)" @click.middle="closeTabAndRemoveActivity(index)" :title="item.title">
        <template v-if="item.url === 'aspect://home'">
          <fa icon="home" class="tab-icon"/>
        </template>
        <template v-else-if="item.url === 'aspect://history'">
          <fa :icon="['far', 'clock']" class="tab-icon"/>
        </template>
        <template v-else-if="item.url === 'aspect://downloads'">
          <fa :icon="['far', 'file']" class="tab-icon"/>
        </template>
        <template v-else-if="item.url === 'aspect://logins'">
          <fa icon="key" class="tab-icon"/>
        </template>
        <template v-else-if="item.url === 'aspect://error'">
          <fa icon="exclamation-triangle" class="tab-icon"/>
        </template>
        <template v-else-if="item.isLoading">
          <fa icon="spinner" class="tab-icon" spin/>
        </template>
        <template v-else-if="item.icon">
          <img class="tab-icon" :src="item.icon">
        </template>
        <span class="tab-title">{{ item.title }}</span>
        <button class="tab-close" @click.stop="closeTabAndRemoveActivity(index)">
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
  import { mapActions } from 'vuex'

  import WindowButtons from './WindowButtons'

  export default {
    components: { WindowButtons },
    props: {
      persona: null
    },
    data () {
      return {
        canScrollLeft: true,
        canScrollRight: false,
        tabs: this.persona.tabs
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
      ...mapActions([
        'setActiveTabIndex',
        'openNewTab',
        'closeTab',
        'removeFromActivity'
      ]),
      getActiveTab () {
        return this.tabs.find((item) => {
          return item.isActive
        })
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
      },
      closeTabAndRemoveActivity (index) {
        const tab = this.tabs[index]
        this.closeTab(index)
        this.removeFromActivity({ db: this.$adb, activityId: tab.activityId })
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
