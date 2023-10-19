<template>
  <v-dialog v-model="show" persistent width="600">
    <v-alert :title="message" color="primary">
      <template v-slot:prepend>
        <v-icon icon="fas fa-magic fa-2x faa-horizontal animated"></v-icon>
      </template>
    </v-alert>
  </v-dialog>
</template>

<script>
export default {
  name: "Loading",
  data: () => {
    return {
      show: false
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "Summoning...",
    },
  },
  watch: {
    value: function (newVal) {
      this.show = newVal;
    }
  }
};
</script>

<style>
.v-dialog.centered-dialog {
  box-shadow: none;
  border-radius: 0;
  width: auto;
}
</style>