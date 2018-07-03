<template>
  <div class="persona-list-wrapper">
    <div class="persona-list">
      <div class="search">
        <fa icon="search"/>
      </div>
      <a v-for="(item, index) in personas" v-bind:key="item.id" class="persona" v-on:click="setActiveIndex(index)">
        <div class="persona-icon" v-bind:style="{ backgroundColor: getBackgroundColor(index) }">
          {{ item.shortName }}
        </div>
        <div class="persona-name">{{ item.name }}</div>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      personas: Array
    },
    methods: {
      setActiveIndex (index) {
        // TODO: Emit an event to be handled in LandingPage
        this.personas.forEach(function (item, i) {
          if (item.isActive && i === index) {
            // If it's already the active item, go to the home page
            const activeTab = item.tabs.find(function (titem) {
              return titem.isActive
            })
            if (activeTab) {
              // HACK: We have to store history ourselves because I can't figure out a way to view the HomePage route in a webview
              activeTab.history.push({
                url: activeTab.url,
                title: activeTab.title
              })
              activeTab.forwardHistory = []
              activeTab.url = 'home'
            }
          }

          item.isActive = (i === index)
        })
      },
      getBackgroundColor (index) {
        if (this.personas[index].isActive) {
          return this.personas[index].color
        }
      }
    }
  }
</script>

<style scoped>

  .persona-list-wrapper {
    padding: 0 10px;
    background-color: #aaa;
    height: 100vh;
    text-align: center;
  }

  .search {
    height: 30px;
    line-height: 30px;
    font-size: 11px;
  }

  .persona {
    display: block;
    margin-bottom: 10px;
    cursor: default;
  }

  .persona:hover {
    color: white;
  }

  .persona-icon {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    border: 2px solid white;
    color: white;
    line-height: 60px; 
    margin-bottom: 10px;
    font-size: 18px;
  }

  .persona:hover .persona-icon {
    background-color: #ccc;
  }

  .persona-name {
    font-size: 11px;
  }

</style>
