<template>
  <div>
    <Loading :value="loading" />

    <v-dialog v-model="authRequired">
      <v-card title="Auth required">
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
    newWindow: false,
    provider: "linode",
    authRequired: false,
  }),
  methods: {
    create(data) {
      this.loading = true;

      api
        .post("sites/create", data)
        .then(response => {
          if (response.data.site_id) {
            this.$router.push("/sites/" + response.data.site_id + "/summary");
          } else if (response.data.error) {
            if (response.data.error === "auth") {
              this.provider = response.data.provider;
              this.authRequired = true;

              let interval = setInterval(() => {
                if (this.newWindow && this.newWindow.closed) {
                  this.newWindow = null;
                  clearInterval(interval);
                  this.create(data);
                  return;
                }
              }, 500);
            } else {
              this.$emit("error", response.data.error);
            }
          }
        })
        .catch(error => console.log(error))
        .finally(() => this.loading = false);
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