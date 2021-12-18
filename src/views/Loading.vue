<template>
  <div class="page-container">
    <v-app :dark="dark">
      <v-layout>
        <v-flex xs12 sm6 offset-sm3>
          <Loading value="true" />
        </v-flex>
      </v-layout>
    </v-app>
  </div>
</template>

<script>
import Loading from "../components/Loading";

export default {
  components: {
    Loading,
  },
  data() {
    return {
      dark: false,
    };
  },
};
</script>
