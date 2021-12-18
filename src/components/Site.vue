<template>
  <div>
    <v-alert :value="error.length > 0" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-dialog v-model="authRequired">
      <v-card>
        <v-card-title> Auth required </v-card-title>

        <v-card-text>
          <v-btn @click="authPrompt()"> Continue </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";

export default {
  components: {
    Loading,
  },
  name: "Site",
  data: () => ({
    loading: false,
    error: "",
    newWindow: false,
    provider: "linode",
    authRequired: false,
  }),
  methods: {
    create(data) {
      var self = this;
      self.loading = true;

      api
        .post("sites/create", data)
        .then(function (response) {
          if (response.data.site_id) {
            self.$eventHub.emit("itemsChanged");
            self.$router.push("/sites/" + response.data.site_id + "/summary");
          } else if (response.data.error) {
            if (response.data.error === "auth") {
              self.provider = response.data.provider;
              self.authRequired = true;

              var interval = setInterval(function () {
                if (self.newWindow && self.newWindow.closed) {
                  self.newWindow = null;
                  clearInterval(interval);
                  self.create(data);
                  return;
                }
              }, 500);
            } else {
              self.error = response.data.error;
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },

    authPrompt() {
      this.authRequired = false;
      this.newWindow = window.open(
        "https://serverwand.com/account/services/" + this.provider
      );
    },
  },
};
</script>