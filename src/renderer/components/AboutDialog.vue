<template>
  <main>
    <div class="about-dialog-container">
      <div class="about-dialog-logo">
        <img :src="imageSource">
      </div>
      <div class="about-dialog-info">
        <div class="about-dialog-title">
          Aspect
        </div>
        <div class="about-dialog-version">
          Version {{ version }}
        </div>
        <p>
          A multi-persona web browser
        </p>
        <div class="about-dialog-links">
          <a href="#" @click="openWebsite">Website</a> | <a href="#" @click="openSource">Source</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
  import path from 'path'
  import { remote } from 'electron'

  export default {
    name: 'about-dialog',
    computed: {
      imageSource: function () {
        return 'file://' + path.join(__static, '/256x256.png')
      },
      version: function () {
        return remote.app.getVersion()
      }
    },
    methods: {
      openWebsite: function () {
        remote.getCurrentWebContents().emit('openSite', 'https://github.com/andrewjk/aspect-browser')
      },
      openSource: function () {
        remote.getCurrentWebContents().emit('openSite', 'https://github.com/andrewjk/aspect-browser')
      }
    }
  }
</script>

<style scoped>

  .about-dialog-container {
    height: 100vh;
    background-color: #222;
    color: #eee;
    padding: 20px;
    display: grid;
    grid-template-columns: 128px auto;
    grid-column-gap: 20px;
  }

  .about-dialog-logo img {
    height: 128px;
    width: 128px;
  }

  .about-dialog-title {
    font-size: 24px;
  }

  .about-dialog-version {
    margin: 10px 0;
    font-size: 12px;
  }

  a {
    color: inherit;
  }

</style>
