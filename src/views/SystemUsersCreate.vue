<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert> 

    <v-subheader>
      Domain details
    </v-subheader>

    <Loading :value="loading" />

    <v-form
      v-if="!loading"
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-text-field
        :disabled="domainId>0"
        v-model="data.domain"
        :rules="domainRules"
        label="Domain"
        required
      ></v-text-field>

      <v-select
        :disabled="domainId>0"
        v-model="data.webserver"
        :items="webservers"
        label="Web Server"
      ></v-select>

      <v-text-field
        type="password"
        v-model="data.password"
        :rules="passwordRules"
        label="Password"
        required
      ></v-text-field>

      <!--
      <v-select
        v-model="data.mailserver"
        :items="mailservers"
        label="Mail Server"
      ></v-select>
      -->

      <v-btn
        :disabled="dialog"
        :loading="dialog"
        color="success"
        @click="validate"
      >
        Save
      </v-btn>
    </v-form>

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

          <div v-html="details"></div>
              
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'

  export default {
    components: {
      Loading
    },
    data: () => ({
      loading: false,
      valid: true,
      data: {
        domain: '',
        password: '',
        webserver: '',
        mailserver: '',
      },
      domainRules: [
        v => !!v || 'Domain is required'
      ],
      passwordRules: [
      ],
      webservers: [],
      mailservers: [],
      dialog: false,
      details: "",
      serverId: 0,
      error: ''
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.domainId = this.$route.params.id
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = true

        api.domain(this.domainId)
        .then(function (response) {
          console.log(response)

          if (self.domainId) {
            self.data = response.data.items[0]
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
 
        api.servers()
        .then(function (response) {
          console.log(response)

          if (response.data.logged_out)
            location.href = 'https://serverwand.com/login'
            
          response.data.items.forEach(element => {
              self.webservers.push({
                  text: element.name,
                  value: element.id
              });
          })
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
          this.details = ''
          this.dialog = true
          
          if (self.domainId) {
            api.updateDomain(this.domainId, this.data)
            .then(function (response) {
              console.log(response)
              self.$router.push('/domains/' + self.domainId)
            })
            .catch(function (error) {
              console.log(error)
            })
          } else {
            api.createDomain(this.data)
            .then(function (response) {
              console.log(response)
              if (response.data.domain_id) {
                self.$router.push('/domains/' + response.data.domain_id)
              } else if (response.data.error) {
                self.error = response.data.error
              }
            })
            .catch(function (error) {
              console.log(error)
            }).finally(function () {
              self.dialog = false
            })
          }

        }
      }
    }
  }
</script>