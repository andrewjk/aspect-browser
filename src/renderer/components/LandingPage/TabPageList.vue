<template>
  <div class="tab-page-list-wrapper">
      <div v-for="(item, index) in tabs" :key="item._id" class="tab-page-list-item" :style="{ zIndex: getZIndex(index) }">
        <template v-if="!item.url">
          <home-page :persona="persona" :tabs="tabs" :show-welcome="showWelcome"></home-page>
        </template>
        <template v-else>
          <tab-page :persona="persona" :tab="item"></tab-page>
        </template>
      </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import HomePage from './HomePage'
  import TabPage from './TabPage'

  export default {
    components: { HomePage, TabPage },
    props: {
      persona: null,
      showWelcome: false
    },
    data () {
      return {
        tabs: this.$store.state.Store.activity[this.persona._id].tabs
      }
    },
    computed: mapState({
      activity: state => state.Store.activity
    }),
    methods: {
      getZIndex: function (index) {
        return this.tabs[index].isActive ? 99 : -99
      }
    }
  }
</script>

<style scoped>

  .tab-page-list-wrapper {
    position: relative;
  }

  .tab-page-list-item {
    background-color: white;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

</style>
