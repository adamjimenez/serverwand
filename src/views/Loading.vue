<template>
  <div class="page-container">
    <v-app :dark="dark">
      <v-layout>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <Loading value="true" />
          </v-col>
        </v-row>
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
