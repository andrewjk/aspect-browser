<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="title">Title</label>
          </td>
          <td>
            <input id="title" v-model="bookmark.title" placeholder="Title">
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
