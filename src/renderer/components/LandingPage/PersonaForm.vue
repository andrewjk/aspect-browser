<template>
  <form>
    <table>
      <tbody>
        <tr>
          <td>
            <label for="name">Name</label>
          </td>
          <td>
            <input id="name" v-model="persona.name" placeholder="Name" autofocus>
          </td>
        </tr>
        <tr>
          <td>
            <label for="shortName">Initials</label>
          </td>
          <td>
            <input id="shortName" v-model="persona.shortName" placeholder="Initials">
          </td>
        </tr>
        <tr>
          <td>
            <label for="color">Color</label>
          </td>
          <td>
            <input id="color" v-model="persona.color" placeholder="Color">
          </td>
        </tr>
        <tr>
          <td>
            <label for="order">Order</label>
          </td>
          <td>
            <input id="order" v-model="persona.order" placeholder="Order">
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script>
  export default {
    props: {
      persona: {}
    }
  }
</script>
