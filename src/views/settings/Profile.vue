<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert>

    <v-text-field
      v-model="data.edition"
      label="Edition"
      disabled
      readonly
    ></v-text-field>

    <v-text-field
      v-model="data.email"
      :rules="usernameRules"
      label="Email"
      disabled
      required
    ></v-text-field>

    <v-text-field
      type="password"
      v-model="data.password"
      :rules="passwordRules"
      label="Password"
      required
    ></v-text-field>

    <v-btn
      :disabled="dialog"
      :loading="dialog"
      color="success"
      @click="validate"
    >
      Save
    </v-btn>

    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
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
</template>

<script>
  import api from '../../services/api';

  export default {
    data: () => ({
      valid: true,
      data: {
        edition: '',
        email: '',
        password: '',
      },
      usernameRules: [
        v => !!v || 'Email is required'
      ],
      passwordRules: [
      ],
      dialog: false,
      loading: false,
      error: ''
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = true
 
        api.profile()
        .then(function (response) {
          console.log(response)
          self.data = response.data.profile
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      validate () {
        var self = this

        if (this.$refs.form.validate()) {
          this.dialog = true

          api.update(this.data)
          .then(function (response) {
            console.log(response)
            if (response.data.success) {
                self.$router.push('/')
            } else {
                self.error = response.data.error;
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function (error) {
            self.dialog = false
            self.loading = false
          })
        }
      }
    }
  }
</script>