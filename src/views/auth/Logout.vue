<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script>
import api from "../../services/api";
import { useRoute } from 'vue-router'

const router = useRoute()

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
      api
        .post("auth/logout")
        .then(response => {
            console.log(response);
            if(response.data.success) {
              router.push("/auth/login");
              return false;
            } else {
              this.error=response.data.error;
            }
          })
        .catch(error => {
            console.log(error);
          })
        .finally(() => {
          this.dialog=false;
          this.loading=false;
        });
    },
  },
};
</script>