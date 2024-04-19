<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card-title primary-title>
      <h1 style="text-align: center; width: 100%">ServerWand</h1>
    </v-card-title>

    <v-subheader> Password reminder </v-subheader>

    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-card-text>
      <v-text-field
        v-if="data.code == ''"
        v-model="data.email"
        :rules="usernameRules"
        label="Email"
        required
      ></v-text-field>

      <v-text-field
        v-if="data.code != ''"
        type="password"
        v-model="data.password"
        :rules="passwordRules"
        label="New password"
        required
      ></v-text-field>
    </v-card-text>

    <div style="margin: 0 8px">
      <v-btn
        :disabled="loading"
        :loading="loading"
        color="success"
        @click="validate"
      >
        Submit
      </v-btn>
    </div>

    <v-subheader>
      <router-link to="/auth/login">Go back to login</router-link>
    </v-subheader>
  </v-form>
</template>

<script>
import api from "../../services/api";

export default {
  data: () => ({
    valid: true,
    data: {
      email: "",
      password: "",
      code: "",
    },
    usernameRules: [(v) => !!v || "Username is required"],
    passwordRules: [(v) => !!v || "Password is required"],
    loading: false,
    error: "",
  }),

  created() {
    if (this.$route.query.c) {
      this.data.code = this.$route.query.c;
    }
  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.loading = true;

        api
          .post("auth/forgot", this.data)
          .then(response => {
              console.log(response);
              if (response.data.success)
                this.$router.push("/auth/login");
              else
                this.error=response.data.error;
            })
          .catch((error) => console.log(error))
          .finally(() => this.loading = false);
      }
    },
  },
};
</script>