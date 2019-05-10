<template>
  <div class="widget-body">
    <div class="title">{{ widget.name }}</div>
    <div v-for="item in news" :key="item._id" class="news-item">
      <button class="news-button" @click="openLink(item, $event)" @auxclick="openLink(item, $event)" @mousedown="checkMouseButton($event)">
        <label>{{ item.title }}</label>
      </button>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapActions } from 'vuex'

  import FeedParser from 'feedparser'
  import request from 'request'

  export default {
    props: {
      persona: null,
      tabs: null,
      widget: null
    },
    data () {
      return {
        news: []
      }
    },
    async mounted () {
      // Refresh every 20 minutes
      await this.getNews()
      setInterval(async () => {
        await this.getNews()
      }, 20 * 60 * 1000)
    },
    methods: {
      ...mapMutations([
        'setTabDetails',
        'addToHistory',
        'setOpenTabCount'
      ]),
      ...mapActions([
        'openInTab'
      ]),
      async getNews () {
        const news = []

        const req = request(this.widget.location)
        const feedparser = new FeedParser()

        // req.on('error', function (error) {
        //   // TODO: handle any request errors
        // })

        req.on('response', function (res) {
          var stream = this // `this` is `req`, which is a stream
          if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'))
          } else {
            stream.pipe(feedparser)
          }
        })

        // feedparser.on('error', function (error) {
        //   // TODO: handle errors
        // })

        feedparser.on('readable', function () {
          // This is where the action is!
          const stream = this // `this` is `feedparser`, which is a stream
          // const meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance

          while (news.length < 3) {
            const item = stream.read()
            if (!item) {
              break
            }
            news.push(item)
          }
        })

        this.news = news
      },
      checkMouseButton (e) {
        // If the middle button was clicked, prevent scrolling from starting so that we can handle opening the url
        if (e.which === 2 || e.which === 4) {
          e.preventDefault()
        }
      },
      openLink (link, e) {
        // If the control key is pressed, or the middle button was clicked, open the url in a new tab in the background
        if (e.ctrlKey || e.which === 2 || e.which === 4) {
          this.openInTab({ url: link.link, background: true })
          return
        }

        const activeTab = this.tabs.find((item) => {
          return item.isActive
        })

        this.setTabDetails({ persona: this.persona, tab: activeTab, isLoading: true, url: link.link })
        this.addToHistory({ tab: activeTab, url: 'aspect://home', title: 'Home' })
        this.setOpenTabCount(this.persona)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .widget-body {
    margin: -5px -5px 0;
  }

  .title {
    font-size: 18px;
    margin: 5px;
  }
  
  .news-button {
    background-color: transparent;
    border-radius: 2px;
    color: #777;
    padding: 5px;
    text-align: left;
  }

  .news-button:hover,
  .news-button:focus {
    background-color: rgba(0, 0, 0, 0.15);
    cursor: pointer;
    label {
      cursor: pointer;
    }
  }
</style>
