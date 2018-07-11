<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="url">URL</label>
          </td>
          <td>
            <input id="url" v-model="bookmark.url" placeholder="URL" autofocus>
          </td>
        </tr>
        <tr>
          <td>
            <label for="title">Title</label>
          </td>
          <td>
            <input id="title" v-model="bookmark.title" placeholder="Title">
          </td>
        </tr>
        <tr>
          <td>
            <label for="order">Order</label>
          </td>
          <td>
            <input id="order" v-model="bookmark.order" placeholder="Order">
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
  export default {
    props: {
      bookmark: {}
    }
  }
</script>
