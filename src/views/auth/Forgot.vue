<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-card-title primary-title>
      <h1 style="text-align: center; width: 100%;">
        ServerWand
      </h1>
    </v-card-title>

    <v-subheader>
      Password reminder
    </v-subheader>

    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
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

    <div style="margin: 0 8px;">
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
  import api from '../../services/api';

  export default {
    data: () => ({
      valid: true,
      data: {
        email: '',
        password: '',
        code: '',
      },
      usernameRules: [
        v => !!v || 'Username is required'
      ],
      passwordRules: [
        v => !!v || 'Password is required'
      ],
      loading: false,
      error: ''
    }),

    created () {
      if(this.$route.query.c) {
        this.data.code = this.$route.query.c
      }
    },

    methods: {
      validate () {
        var self = this

        if (this.$refs.form.validate()) {
          this.loading = true

          api.forgot(this.data)
          .then(function (response) {
            console.log(response)
            if (response.data.success) {
                self.$router.push('/auth/login')
            } else {
                self.error = response.data.error;
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function (error) {
            self.loading = false
          })
        }
      }
    }
  }
</script>