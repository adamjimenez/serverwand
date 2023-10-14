<template>
  <div>
    <v-btn :disabled="fetching" :loading="fetching" @click="deleteServer" color="error">
      Disconnect
    </v-btn>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../services/api";
import Confirm from "./ConfirmDialog.vue";

export default {
  components: {
    Confirm,
  },

  props: {
    server: null,
  },

  data() {
    return {
      fetching: false,
    };
  },

  methods: {
    deleteServer: async function () {
      if (!await this.$refs.confirm.open("Disconnect from server " + this.server.name + "?")) {
        return;
      }
      
      this.fetching = true;

      api
        .get("servers/" + this.$route.params.id + "/delete")
        .then(response => {
          console.log(response);

          if (response.data.success) {
            // subscribe to status changes
            this.$router.push("/servers/");
          }
        })
        .catch((error) => console.log(error))
        .finally(() => this.fetching = false);
    }
  },
}
</script>