<template>
  <div>
    <v-btn :disabled="fetching" :loading="fetching" @click="clearSSHUser">
      Clear SSH user
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
    serverId: null,
  },

  data() {
    return {
      fetching: false
    };
  },

  methods: {
    clearSSHUser: async function() {      
      if (
        await this.$refs.confirm.open(
          "Confirm",
          "Clear the default SSH user used for terminal access?"
        )
      ) {
        var self = this;
        self.fetching = true;
        api
          .post("servers/" + this.serverId + "/savesshuser", {
            ssh_username: "",
          })
          .then(response => {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.$emit('complete');
            }
          })
          .catch(error => console.log(error))
          .finally(() => self.fetching = false);
      }
    },
  },
};
</script>