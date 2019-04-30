<template>
  <div class="widget-body">
    <div class="title">{{ widget.name }}</div>
    <div>{{ this.time }}</div>
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
      setInterval(() => {
        this.time = new Date().toLocaleTimeString(locale, { timeZone: this.widget.timezone, hour: '2-digit', minute: '2-digit' }).toUpperCase()
      }, 1000)
    }
  }
</script>

<style scoped>
  .title {
    font-size: 20px;
    margin-bottom: 7px;
  }
</style>
