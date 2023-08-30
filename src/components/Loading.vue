<template>
  <v-dialog v-model="show" persistent content content-class="centered-dialog">
    <v-container fill-height>
      <v-card color="primary">
        <v-card-text>
          <v-layout row>
            <i class="fas fa-magic fa-2x faa-horizontal animated"></i>
            <h2 class="ml-2">{{ message }}</h2>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-container>
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