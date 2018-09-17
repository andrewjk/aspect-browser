<template>
  <div class="error-page-wrapper">
    <div class="title">An Error Occurred</div>
    <p>
      Something went wrong and we couldn't access the requested site.
    </p>
    <p>
      ({{ this.errorText() }})
    </p>
  </div>
</template>

<script>
  // import { mapMutations, mapActions } from 'vuex'

  export default {
    props: {
      persona: null,
      tabs: Array
    },
    methods: {
      getActiveTab () {
        return this.tabs.find((item) => {
          return item.isActive
        })
      },
      errorText () {
        const tab = this.getActiveTab()
        if (tab) {
          return tab.errorCode + ': ' + tab.errorDescription
        }
        return 'Unknown'
      }
    }
  }
</script>

<style scoped>

  .error-page-wrapper {
    padding: 40px 10px 10px;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: 42px;
    margin-bottom: 10px;
  }

</style>
