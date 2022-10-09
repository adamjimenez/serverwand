<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script>
import api from "../../services/api";
import router from "../../router";

export default {
  data: () => ({
    valid: true,
    email: "",
    usernameRules: [(v) => !!v || "Username is required"],
    dialog: false,
    loading: false,
    error: "",
  }),

  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.logout();
  },

  methods: {
    logout() {
      var self = this;

      api
        .post("auth/logout")
        .then(response => {
            console.log(response);
            if(response.data.success) {
              router.push("/auth/login");
              return false;
            } else {
              self.error=response.data.error;
            }
          })
        .catch(error => {
            console.log(error);
          })
        .finally(() => {
            self.dialog=false;
            self.loading=false;
          });
    },
  },
};
</script>