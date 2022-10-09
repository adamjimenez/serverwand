<template>
  <v-btn
    :disabled="fetching"
    :loading="fetching"
    @click="deleteServer"
    color="error"
  >
    Disconnect
  </v-btn>
</template>

<script>
import api from "../services/api";

export default {
  props: {
    serverId: null,
    server: null,
  },

  data() {
    return {
      fetching: false,
    };
  },

  methods: {
    deleteServer() {
      this.$confirm("Disconnect from server " + this.server.name + "?").then(
        (res) => {
          if (res) {
            var self = this;
            this.fetching = true;

            api
              .get("servers/" + this.$route.params.id + "/delete")
              .then(response => {
                  console.log(response);

                  if(response.data.success) {
                    // subscribe to status changes
                    self.$router.push("/servers/");
                  }
                })
              .catch((error) => console.log(error))
              .finally(() => self.fetching = false);
          }
        }
      );
    },
  },
};
</script>