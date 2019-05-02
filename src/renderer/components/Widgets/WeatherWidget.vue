<template>
  <div class="widget-body">
    <div class="title">{{ widget.name }}</div>
    <div v-if="icon" class="temp">
      <img :src="icon">
    </div>
    <div class="temp">
      <label>Now: {{ this.temperature }}</label>
    </div>
    <div class="temp">
      <label>{{ this.weather }}</label>
    </div>
    <div class="temp">
      <label>{{ this.maxmin }}</label>
    </div>
  </div>
</template>

<script>
  import secrets from '../../../secrets.json'
  import axios from 'axios'

  export default {
    props: {
      widget: null
    },
    data () {
      return {
        temperature: 'Loading...',
        weather: '',
        maxmin: '',
        icon: ''
      }
    },
    async mounted () {
      // Refresh every 20 minutes
      await this.getWeather()
      setInterval(async () => {
        await this.getWeather()
      }, 20 * 60 * 1000)
    },
    methods: {
      async getWeather () {
        const weatherKey = secrets.weatherKey
        const city = this.widget.name
        const units = this.widget.units === 'celsius' ? 'metric' : 'imperial'
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${weatherKey}&units=${units}`
        const result = await axios.get(url)
        this.temperature = `${result.data.main.temp}°${this.widget.units.substring(0, 1).toUpperCase()}`
        this.weather = result.data.weather[0].description.substring(0, 1).toUpperCase() + result.data.weather[0].description.substring(1)
        this.maxmin = `${result.data.main.temp_max} / ${result.data.main.temp_min}`
        this.icon = `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`
      }
    }
  }
</script>

<style scoped>
  .title {
    font-size: 20px;
    margin-bottom: 7px;
  }

  .temp {
    margin: 7px 0;
  }
</style>
