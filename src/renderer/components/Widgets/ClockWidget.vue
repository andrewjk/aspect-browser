<template>
  <div class="widget-body">
    <div class="title">{{ widget.name }}</div>
    <div>
      <label>{{ this.time }}</label>
    </div>
  </div>
</template>

<script>
  import osLocale from 'os-locale'

  export default {
    props: {
      widget: null
    },
    data () {
      return {
        time: ''
      }
    },
    async mounted () {
      let locale = await osLocale()
      locale = locale.replace('_', '-')
      this.getTime(locale)
      setInterval(() => {
        this.getTime(locale)
      }, 1000)
    },
    methods: {
      getTime (locale) {
        this.time = new Date().toLocaleTimeString(locale, { timeZone: this.widget.location, hour: '2-digit', minute: '2-digit' }).toUpperCase()
      }
    }
  }
</script>

<style scoped>
  .title {
    font-size: 18px;
    margin-bottom: 7px;
  }
</style>
