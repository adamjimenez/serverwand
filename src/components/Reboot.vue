<template>
  <div>
    <v-btn :disabled="fetching" :loading="fetching" @click="reboot">
      Reboot
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
    reboot: async function () {
      if (!await this.$refs.confirm.open("Reboot server?")) {
        return;
      }
      
      var self = this;
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/reboot")
        .then(response => {
          console.log(response);

          if (response.data.success) {
            this.$router.push("/servers");
          }
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);
    }
  },
};
</script>