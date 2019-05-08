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
      <label>
        <span class="temp-hot">{{ this.max }}</span> / <span class="temp-cold">{{ this.min }}</span>
      </label>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    props: {
      widget: null
    },
    data () {
      return {
        temperature: 'Loading...',
        weather: '',
        max: '',
        min: '',
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
        const weatherKey = process.env.WEATHER_KEY
        const location = this.widget.location || this.widget.name
        const units = this.widget.units === 'celsius' ? 'metric' : 'imperial'
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=${weatherKey}&units=${units}`
        const result = await axios.get(url)
        const unitsText = this.widget.units.substring(0, 1).toUpperCase()
        this.temperature = `${result.data.main.temp.toFixed(1)}°${unitsText}`
        this.weather = result.data.weather[0].description.substring(0, 1).toUpperCase() + result.data.weather[0].description.substring(1)
        this.max = `${result.data.main.temp_max.toFixed(1)}°${unitsText}`
        this.min = `${result.data.main.temp_min.toFixed(1)}°${unitsText}`
        this.icon = `http://openweathermap.org/img/w/${result.data.weather[0].icon}.png`
      }
    }
  }
</script>

<style lang="scss" scoped>
  .title {
    font-size: 18px;
    margin-bottom: 7px;
  }

  .temp {
    margin: 7px 0;
  }

  .widget-body:hover {
    .temp-hot {
      color: red;
    }

    .temp-cold {
      color: blue;
    }
  }
</style>
