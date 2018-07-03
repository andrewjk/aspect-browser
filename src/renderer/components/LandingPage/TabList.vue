<template>
  <div class="tab-list-wrapper">
    <div class="tab-list">
      <a v-for="(item, index) in persona.tabs" v-bind:key="item.id" v-bind:class="['tab', item.isActive ? 'active' : '']" v-on:click="setActiveIndex(index)">
        <template v-if="item.isLoading">
          <fa icon="spinner" class="tab-icon"/>
        </template>
        <template v-else>
          <fa icon="search" class="tab-icon"/>
        </template>
        <span class="title">{{ item.title }}</span>
      </a>
      <a class="tab" v-on:click="openNewTab()">
        <fa icon="plus"/>
      </a>
    </div>
  </div>
</template>

<script>
  const uuid = require('uuid/v4')

  export default {
    props: {
      persona: null
    },
    methods: {
      getActiveTab () {
        return this.persona.tabs.find(function (item) {
          return item.isActive
        })
      },
      // TODO: Emit these up the heirarchy
      setActiveIndex (index) {
        this.persona.tabs.forEach(function (item, i) {
          item.isActive = (i === index)
        })
      },
      openNewTab () {
        this.persona.tabs.push({ id: uuid(), url: 'home', title: 'New tab' })
        this.setActiveIndex(this.persona.tabs.length - 1)
      }
    }
  }
</script>

<style scoped>

  .tab-list-wrapper {
    background-color: #ccc;
    height: 28px;
  }

  .tab {
    display: inline-block;
    line-height: 28px;
    padding: 0 10px;
    font-size: 13px;
    border-right: 1px solid #aaa;
    cursor: default;
  }

  .tab.active {
    background-color: #eee;
  }

  .tab:hover {
    color: white;
  }

  .tab-icon {
    margin-right: 2px;
  }

</style>
