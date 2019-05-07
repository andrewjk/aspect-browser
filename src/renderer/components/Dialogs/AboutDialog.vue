<template>
  <div class="message-box dialog-mask" @click="$close(false)">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <div class="dialog-body">
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
            <div class="about-dialog-blurb">
              A multi-persona web browser
            </div>
            <div class="about-dialog-links">
              <a href="#" @click="openWebsite">Website</a> | <a href="#" @click="openSource">Source</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'
  import path from 'path'
  import { remote } from 'electron'

  export default {
    name: 'about-dialog',
    computed: {
      imageSource () {
        return 'file://' + path.join(__static, '/256x256.png')
      },
      version () {
        return remote.app.getVersion()
      }
    },
    methods: {
      ...mapActions([
        'openInTab'
      ]),
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      },
      openWebsite () {
        this.openInTab({ url: 'https://github.com/andrewjk/aspect-browser', background: false })
        this.$close()
      },
      openSource () {
        this.openInTab({ url: 'https://github.com/andrewjk/aspect-browser', background: false })
        this.$close()
      }
    }
  }
</script>

<style scoped>

  .about-dialog-container {
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

  .about-dialog-blurb {
    margin: 20px 0;
  }

  a {
    color: inherit;
  }

</style>
