<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'Aspect'
  }
</script>

<style>

  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: sans-serif;
    overflow: hidden;
  }

  p {
    line-height: 24px;
  }

  label {
    color: #666;
  }

  input[type="text"] {
    border-radius: 2px;
    border: 1px solid #ddd;
    padding: 4px 6px;
    width: 100%;
  }

  form table {
    border-spacing: 0 10px;
    width: 100%;
  }

  a {
    color: #0077cc;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a:focus,
  a:active:focus,
  a.active:focus,
  a.focus,
  a:active.focus,
  a.active.focus {
    outline: 1px dotted;
  }

  button {
    border: none;
    background-color: inherit;
  }

  button:focus,
  button:active:focus,
  button.active:focus,
  button.focus,
  button:active.focus,
  button.active.focus {
    outline: none !important;
  }

  a,
  input[type="submit"],
  input[type="reset"],
  input[type="button"],
  input[type="text"],
  button,
  textarea {
    -webkit-app-region: no-drag;
  }

  .delete-link {
    color: red;
  }
  
  .dialog-custom {
    border-radius: 2px;
  }

  .dialog-custom #swal2-title {
    color: #222;
    font-weight: normal;
  }
  
  .dialog-custom #swal2-content {
    color: #666;
    font-size: 15px;
    line-height: 20px;
  }

  .dialog-custom .swal2-input {
    font-size: 18px;
    border-radius: 2px;
    border: 1px solid #ddd;
    padding: 6px;
    height: auto;
  }

  .dialog-custom .swal2-input:focus {
    border: 1px solid #ddd;
    box-shadow: none;
  }

</style>
