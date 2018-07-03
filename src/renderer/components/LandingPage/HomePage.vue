<template>
  <div class="home-page-wrapper">
    <div class="title">Home</div>
    <a v-for="(item) in persona.bookmarks" v-bind:key="item.id" class="bookmark" v-on:click="handleBookmarkClick(item)">
      <div class="bookmark-title">{{ item.title }}</div>
    </a>
  </div>
</template>

<script>
  export default {
    props: {
      persona: null
    },
    methods: {
      handleBookmarkClick (bookmark) {
        const activeTab = this.persona.tabs.find(function (item) {
          return item.isActive
        })

        // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
        activeTab.history.push({
          url: 'home',
          title: 'Home'
        })
        activeTab.forwardHistory = []
        activeTab.historyNavigation = true

        activeTab.isLoading = true
        activeTab.initialUrl = bookmark.url
        activeTab.url = bookmark.url
      }
    }
  }
</script>

<style scoped>

  .home-page-wrapper {
    padding: 10px;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

  .bookmark {
    display: block;
    margin-bottom: 10px;
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }

</style>
