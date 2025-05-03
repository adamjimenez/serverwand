<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card-title primary-title>
      <h1 class="text-center">ServerWand</h1>
    </v-card-title>

    <v-subheader> Register </v-subheader>

    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-card-text>
      <v-text-field v-model="email" :rules="usernameRules" label="Email" required></v-text-field>

      <v-text-field type="password" v-model="password" :rules="passwordRules" label="Password" required></v-text-field>
    </v-card-text>

    <div style="margin: 0 8px">
      <v-btn :disabled="dialog" :loading="dialog" color="success" @click="validate">
        Register
      </v-btn>
    </div>

    <v-subheader>
      <router-link to="/auth/login">Go back to login</router-link>
    </v-subheader>

    <v-dialog v-model="dialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Please stand by
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import api from "../../services/api";

export default {
  data: () => ({
    valid: true,
    email: "",
    password: "",
    usernameRules: [(v) => !!v || "Email is required"],
    passwordRules: [(v) => !!v || "Password is required"],
    dialog: false,
    loading: false,
    error: "",
  }),

  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;

    if (this.serverId) {
      this.fetchData();
    }
  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.dialog = true;

        api
          .post("auth/register", {
            email: this.email,
            password: this.password,
          })
          .then(response => {
            console.log(response);
            if (response.data.success) {
              this.$router.push("/auth/login");
            } else {
              this.error = response.data.error;
            }
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            this.dialog = false;
            this.loading = false;
          });
      }
    },
  },
};
</script>