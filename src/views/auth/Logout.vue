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
  </v-form>
</template>

<script>
  import api from '../../services/api';

  export default {
    data: () => ({
      valid: true,
      email: '',
      usernameRules: [
        v => !!v || 'Username is required'
      ],
      dialog: false,
      loading: false,
      error: ''
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.logout()
    },

    methods: {
      logout () {
        var self = this

        api.post('api/auth/logout')
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
            location.href = 'https://serverwand.com/login'
            return false
          } else {
            self.error = response.data.error
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.dialog = false
          self.loading = false
        })
      }
    }
  }
</script>