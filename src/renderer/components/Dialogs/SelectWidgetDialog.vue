<template>
  <div class="edit-dialog dialog-mask">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <header>
        <h2>Widget Type</h2>
      </header>
      <div class="dialog-body">
        <form>
          <label>
            <input type="radio" id="clock" value="clock" v-model="type">
            Clock
          </label>
          <br/>
          <label>
            <input type="radio" id="todo" value="todo" v-model="type">
            To-do list
          </label>
          <br/>
          <label>
            <input type="radio" id="weather" value="weather" v-model="type">
            Weather
          </label>
        </form>
      </div>
      <footer>
        <button class="confirm" @click="$close(type)">OK</button>
        <button class="cancel" @click="$close(false)">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        type: 'clock'
      }
    },
    methods: {
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      }
    }
  }
</script>

<style scoped>
  input {
    margin: 10px 0;
  }
</style>
