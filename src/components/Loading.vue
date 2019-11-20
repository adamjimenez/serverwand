<template>
<v-layout row justify-center>
  <v-dialog v-model="value" persistent content content-class="centered-dialog">
    <v-container fill-height
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          <v-layout row>
              <i class="fas fa-magic fa-2x faa-horizontal animated"></i>
              <h2 style="margin-left: 10px;">{{message}}</h2>
          </v-layout>              
        </v-card-text>
      </v-card>
    </v-container>
  </v-dialog>
</v-layout>
</template>

<script>
export default {
  name: "Loading",
  data: function() {
    return {}
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: "Summoning..."
    },
  },
}
</script>

<style>
.v-dialog.centered-dialog {
  box-shadow: none;
  border-radius: 0;
  width: auto;
}
</style>