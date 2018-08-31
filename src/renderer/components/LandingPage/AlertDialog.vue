<template>
  <div class="message-box dialog-mask" @click="$close">
    <div class="dialog-content" @click.stop="doNothing" @keyup.enter="$close(true)" @keyup.esc="$close(false)">
      <div class="dialog-body">
        <p>{{ content }}</p>
      </div>
      <footer>
        <button id="dialog-confirm" class="confirm" @click="$close">OK</button>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      content: ''
    },
    mounted () {
      // HACK: The autofocus attribute doesn't seem to work all the time?
      document.getElementById('dialog-confirm').focus()
    },
    methods: {
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      }
    }
  }
</script>
