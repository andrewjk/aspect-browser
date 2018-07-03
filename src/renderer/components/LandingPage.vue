<template>
  <div id="wrapper">
    <main>
      <div class="persona-list-container">
        <persona-list v-bind:personas="personas"></persona-list>
      </div>
      <div class="persona-browser-container">
        <persona-browser v-bind:personas="personas"></persona-browser>
      </div>
    </main>
  </div>
</template>

<script>
  import PersonaList from './LandingPage/PersonaList'
  import PersonaBrowser from './LandingPage/PersonaBrowser'

  const uuid = require('uuid/v4')

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser },
    data () {
      const id1 = 'p1'
      const id2 = 'p2'
      return {
        personas: [
          {
            id: id1,
            name: 'Persona',
            shortName: 'P',
            color: 'LightGreen',
            isActive: true,
            bookmarks: [
              {
                id: uuid(),
                url: 'http://localhost:9080/#/home/',
                title: 'Home2'
              },
              {
                id: uuid(),
                url: 'https://mail.google.com/mail/',
                title: 'Gmail'
              },
              {
                id: uuid(),
                url: 'https://twitter.com/',
                title: 'Twitter'
              }
            ],
            tabs: [
              {
                id: uuid(),
                url: 'home',
                title: 'Home',
                isActive: true,
                history: [],
                forwardHistory: []
              }
            ]
          },
          {
            id: id2,
            name: 'Persona 2',
            shortName: 'P2',
            color: 'Blue',
            isActive: false,
            bookmarks: [
              {
                id: uuid(),
                url: 'https://mail.google.com/mail/',
                title: 'Gmail'
              }
            ],
            tabs: [
              {
                id: uuid(),
                url: 'home',
                title: 'Home',
                isActive: true,
                history: [],
                forwardHistory: []
              },
              {
                id: uuid(),
                url: 'http://blah.com',
                title: 'Blah',
                isActive: false,
                history: [],
                forwardHistory: []
              }
            ]
          }
        ]
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      setActiveIndex (index) {
        this.personas.forEach(function (item, i) {
          item.isActive = (i === index)
        })
      }
    }
  }
</script>

<style>

  *, *:before, *:after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: sans-serif; }

  #wrapper {
    height: 100vh;
    width: 100vw;
  }

  main {
    display: flex;
  }

  .persona-list-container {
    width: 80px;
    height: 100vh;
  }

  .persona-browser-container {
    flex-grow: 1;
    height: 100vh;
  }

</style>
