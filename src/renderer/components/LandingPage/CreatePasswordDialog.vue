<template>
  <div class="message-box dialog-mask" @click="$close('')">
    <div class="dialog-content" @click.stop="doNothing">
      <div class="dialog-body">
        <p>{{ content }}</p>
        <input id="dialog-input" type="password" v-model="password" placeholder="Password" @keyup.enter="$close({ password, confirmPassword })" @keyup.esc="$close('')">
        <input id="dialog-input-confirm" type="password" v-model="confirmPassword" placeholder="Confirm Password" @keyup.enter="$close({ password, confirmPassword })" @keyup.esc="$close('')">
      </div>
      <footer>
        <button class="confirm" @click="$close({ password, confirmPassword })">OK</button>
        <button class="cancel" @click="$close('')">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      content: ''
    },
    data () {
      return {
        password: '',
        confirmPassword: ''
      }
    },
    mounted () {
      // HACK: The autofocus attribute doesn't seem to work all the time?
      document.getElementById('dialog-input').focus()
    },
    methods: {
      doNothing () {
        // HACK: This just prevents clicks on the dialog-content bubbling to the dialog-mask. There's probably a better way to do this...
      }
    }
  }
</script>
