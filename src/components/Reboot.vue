<template>
    <v-btn :disabled="fetching" :loading="fetching" @click="reboot">
        Reboot
    </v-btn>
</template>

<script>
import api from "../services/api";

export default {
  props: {
    serverId: null,
  }, 
  
  data() {
    return {
      fetching: false
    };
  },

  methods: {
    reboot() {
      this.$confirm("Reboot server?").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;

          api
            .get("servers/" + this.serverId + "/reboot")
            .then(function (response) {
              console.log(response);

              if (response.data.success) {
                this.$router.push("/servers");
              }
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.fetching = false;
            });
        }
      });
    },
  },
};
</script>