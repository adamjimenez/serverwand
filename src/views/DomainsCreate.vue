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
        v-model="data.server"
        :items="servers"
        label="Server"
      ></v-select>

      <v-text-field
        type="password"
        v-model="data.password"
        :rules="passwordRules"
        label="Password"
        required
      ></v-text-field>
      
      <v-checkbox
        v-model="dns"
        label="Configure DNS"
        :disabled="!data.server || dnsProviders[data.server]==''"
      ></v-checkbox>

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
        server: '',
      },
      domainRules: [
        v => !!v || 'Domain is required'
      ],
      passwordRules: [
      ],
      servers: [],
      dnsProviders: {},
      dns: true,
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
            
          response.data.items.forEach(element => {
              self.servers.push({
                  text: element.name,
                  value: element.id
              });

              self.dnsProviders[element.id] = element.dns
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      },
      save (noAuthPrompt) {
        var self = this
        this.error = ''
        this.details = ''
        this.dialog = true

        console.log(arguments);

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
              if (response.data.error == 'auth' && !noAuthPrompt) {
                var child = window.open('https://serverwand.com/account/services/' + self.dnsProviders[self.data.server])
                var interval = setInterval(function() {
                    if (child.closed) {
                        clearInterval(interval)
                        self.validate(true)
                        return
                    }
                }, 500)
              } else {
                self.error = response.data.error
              }
            }
          })
          .catch(function (error) {
            console.log(error)
          }).finally(function () {
            self.dialog = false
          })
        }
      },
      validate () {
        if (this.$refs.form.validate()) {
          this.save();
        }
      }
    }
  }
</script>