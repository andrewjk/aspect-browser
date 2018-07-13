<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="searchProvider">Search</label>
          </td>
          <td>
            <input id="searchProvider" v-model="settings.searchProvider" placeholder="Search provider">
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
  export default {
    props: {
      settings: {}
    }
  }
</script>
