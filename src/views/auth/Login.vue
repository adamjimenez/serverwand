<template>
  <div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card-title primary-title>
        <v-icon left color="primary">fas fa-magic</v-icon>
        <strong>SERVERWAND</strong>
      </v-card-title>

      <v-subheader> Sign in </v-subheader>

      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>

      <div style="margin: 0 8px">
        <v-btn
          :disabled="dialog"
          :loading="dialog"
          color="error"
          @click="loginGoogle"
          icon="fa fa-google"
        >
          Google
        </v-btn>
      </div>

      <v-card-text>
        <v-divider></v-divider>

        <v-text-field
          v-model="email"
          :rules="usernameRules"
          label="Email"
          required
        ></v-text-field>

        <v-text-field
          type="password"
          v-model="password"
          :rules="passwordRules"
          label="Password"
          required
        ></v-text-field>
      </v-card-text>

      <div style="margin: 0 8px">
        <v-btn
          :disabled="dialog"
          :loading="dialog"
          color="success"
          @click="validate"
        >
          Login
        </v-btn>
      </div>

      <v-subheader>
        <router-link to="/auth/forgot">Forgot password</router-link>
      </v-subheader>

      <v-subheader>
        <router-link to="/auth/register">Register</router-link>
      </v-subheader>

      <v-dialog v-model="dialog" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Please stand by
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-form>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  data: () => ({
    valid: true,
    email: "",
    password: "",
    usernameRules: [(v) => !!v || "Username is required"],
    passwordRules: [(v) => !!v || "Password is required"],
    dialog: false,
    loading: false,
    error: "",
  }),

  methods: {
    loginGoogle() {
      location.href = "https://serverwand.com/login?provider=google";
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.dialog = true;
        this.error = "";

        api
          .post("auth/login", {
            email: this.email,
            password: this.password,
          })
          .then(response => {
              console.log(response);
              if (response.data.success)
                this.$router.push("/");
              else
                this.error=response.data.error;
            })
          .catch(error => console.log(error))
          .finally(() => {
            this.dialog=false;
            this.loading=false;
          });
      }
    },
  },
};
</script>