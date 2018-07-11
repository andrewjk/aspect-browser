<template>
  <div class="tab-list-wrapper">
    <div class="tab-list">
      <a v-for="(item, index) in tabs" :key="item._id" :class="['tab', item.isActive ? 'active' : 'inactive']" @click="setActiveIndex(index)">
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
        <a class="tab-close" @click.stop="closeTab(index)">
          <fa icon="times"/>
        </a>
      </a>
      <a class="tab" @click="openNewTab()">
        <a class="tab-new">
          <fa icon="plus"/>
        </a>
      </a>
    </div>
  </div>
</template>

<script>
  const uuid = require('uuid/v4')

  export default {
    props: {
      persona: null,
      tabs: Array
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
      }
    }
  }
</script>

<style scoped>

  .tab-list-wrapper {
    background-color: #ccc;
    height: 28px;
    font-size: 13px;
  }

  .tab {
    display: inline-block;
    padding: 0 5px;
    border-right: 1px solid #aaa;
    cursor: default;
    line-height: 28px;
  }

  .tab.active {
    background-color: #eee;
  }

  .tab.inactive {
    background-color: #ccc;
  }

  .tab.inactive:hover {
    background-color: #ddd;
  }

  .tab-icon {
    height: 16px;
    width: 16px;
    vertical-align: top;
    margin: 6px 2px;
  }

  .tab-title {
    /* display: inline-block;
    max-width: 120px; */
    overflow: hidden;
    white-space: nowrap;
  }

  .tab-close {
    border-radius: 2px;
    margin-left: 2px;
    padding: 2px 4px;
  }

  .tab-close:hover {
    background-color: #ccc;
  }

  .hidden-button {
    display: none
  }

  .tab-new {
    border-radius: 2px;
    margin-left: 2px;
    padding: 2px 4px;
  }

  .tab-new:hover {
    background-color: #eee;
  }

</style>
