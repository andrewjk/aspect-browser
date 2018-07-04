<template>
  <div id="wrapper">
    <main>
      <div class="persona-list-container">
        <persona-list v-bind:personas="personas" v-on:persona-added="personaAdded"></persona-list>
      </div>
      <div class="persona-browser-container">
        <persona-browser v-bind:personas="personas" v-on:persona-edited="personaEdited" v-on:persona-deleted="personaDeleted"></persona-browser>
      </div>
    </main>
  </div>
</template>

<script>
  import PersonaList from './LandingPage/PersonaList'
  import PersonaBrowser from './LandingPage/PersonaBrowser'

  // NOTE: V4 uses random numbers
  import uuid from 'uuid/v4'

  export default {
    name: 'landing-page',
    components: { PersonaList, PersonaBrowser },
    data () {
      return {
        personas: []
      }
      // const id1 = 'p1'
      // const id2 = 'p2'
      // return {
      //   personas: [
      //     {
      //       id: id1,
      //       name: 'Persona',
      //       shortName: 'P',
      //       color: 'LightGreen',
      //       isActive: true,
      //       bookmarks: [
      //         {
      //           id: uuid(),
      //           url: 'http://localhost:9080/#/home/',
      //           title: 'Home2'
      //         },
      //         {
      //           id: uuid(),
      //           url: 'https://mail.google.com/mail/',
      //           title: 'Gmail'
      //         },
      //         {
      //           id: uuid(),
      //           url: 'https://twitter.com/',
      //           title: 'Twitter'
      //         }
      //       ],
      //       tabs: [
      //         {
      //           id: uuid(),
      //           url: 'home',
      //           title: 'Home',
      //           isActive: true,
      //           history: [],
      //           forwardHistory: []
      //         }
      //       ]
      //     },
      //     {
      //       id: id2,
      //       name: 'Persona 2',
      //       shortName: 'P2',
      //       color: 'Blue',
      //       isActive: false,
      //       bookmarks: [
      //         {
      //           id: uuid(),
      //           url: 'https://mail.google.com/mail/',
      //           title: 'Gmail'
      //         }
      //       ],
      //       tabs: [
      //         {
      //           id: uuid(),
      //           url: 'home',
      //           title: 'Home',
      //           isActive: true,
      //           history: [],
      //           forwardHistory: []
      //         },
      //         {
      //           id: uuid(),
      //           url: 'http://blah.com',
      //           title: 'Blah',
      //           isActive: false,
      //           history: [],
      //           forwardHistory: []
      //         }
      //       ]
      //     }
      //   ]
      // }
    },
    created: function () {
      // Load the personas from the database
      // HACK: Should be some way to bind 'this'...
      const self = this
      this.$db.find({}).sort({ order: 1 }).exec(function (err, dbPersonas) {
        if (err) {
          alert('ERROR: ' + err)
          return
        }

        self.personas = dbPersonas
        self.personas.forEach(function (item, i) {
          item.isActive = (i === 0)
        })

        // If there are no personas, add a default one that the user can edit
        if (!self.personas || !self.personas.length) {
          self.createDefaultPersona()
        }
      })
    },
    methods: {
      setActiveIndex (index) {
        this.personas.forEach(function (item, i) {
          item.isActive = (i === index)
        })
      },
      sortPersonas () {
        this.personas.sort(function (a, b) {
          if (a.order < b.order) {
            return -1
          } else if (a.order > b.order) {
            return 1
          } else {
            return 0
          }
        })
      },
      personaAdded (persona) {
        console.log('persona added')
        this.personas.push(persona)
        this.setActiveIndex(this.personas.length - 1)
        this.sortPersonas()
      },
      personaEdited (persona) {
        console.log('persona edited')
        this.sortPersonas()
      },
      personaDeleted (persona) {
        console.log('persona deleted')
        const index = this.personas.indexOf(persona)
        this.personas.splice(index, 1)
        if (!this.personas.length) {
          this.createDefaultPersona()
        }
        this.setActiveIndex(Math.min(index, this.personas.length - 1))
      },
      createDefaultPersona () {
        const defaultPersona = {
          _id: uuid(),
          name: 'Personal',
          shortName: 'P',
          color: 'lightgreen',
          order: 1,
          isActive: true,
          bookmarks: [],
          tabs: [
            {
              _id: uuid(),
              url: 'home',
              title: 'Home',
              isActive: true,
              history: [],
              forwardHistory: []
            }
          ]
        }
        const self = this
        this.$db.insert(defaultPersona, function (err, dbPersona) {
          if (err) {
            alert('ERROR: ' + err)
            return
          }
          self.personas = [ dbPersona ]
        })
      }
    }
  }
</script>

<style>

  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: sans-serif;
  }

  p {
    line-height: 24px;
  }

  label {
    color: #666;
  }

  input {
    border-radius: 2px;
    border: 1px solid #ddd;
    padding: 4px 6px;
    width: 100%;
  }

  button {
    padding: 4px 10px;
  }

  form table {
    border-spacing: 10px;
    width: 100%;
  }

</style>

<style scoped>

  .persona-list-container {
    width: 80px;
    height: 100vh;
  }

  .persona-browser-container {
    flex-grow: 1;
    height: 100vh;
  }

  #wrapper {
    height: 100vh;
    width: 100vw;
  }

  main {
    display: flex;
  }

</style>
