<template>
  <v-btn
    :disabled="fetching"
    :loading="fetching"
    @click="clearSSHUser"
  >
    Clear SSH user
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
    clearSSHUser() {
      this.$confirm("Clear the default SSH user used for terminal access?").then((res) => {
        if (res) {
          var self = this;
          self.fetching = true;
          api
            .post("servers/" + this.serverId + "/savesshuser", {
              ssh_username: "",
            })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.error = response.data.error;
              } else {
                self.$emit('complete')
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