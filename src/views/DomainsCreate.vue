<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert> 

    <Loading :value="loading" />

    <v-subheader>
      <h1>Domain details</h1>
    </v-subheader>

    <v-form
      v-if="!loading"
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-card>
        <v-card-text>

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
            :rules="[(v) => !!v || 'Server is required']"
            required
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
            :disabled="loading"
            :loading="loading"
            color="success"
            @click="validate"
          >
            Save
          </v-btn>

        </v-card-text>
      </v-card>

    </v-form>

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
      details: "",
      serverId: 0,
      error: ''
    }),

    created () {
      document.title = 'Domain details'
      this.domainId = this.$route.params.id
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = false

        api.get('domains/' + this.domainId)
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
 
        api.get('servers/')
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
        this.loading = true

        console.log(arguments);

        if (self.domainId) {
          api.updateDomain(this.domainId, this.data)
          .then(function (response) {
            console.log(response)
            self.$router.push('/domains/' + self.domainId + '/summary')
          })
          .catch(function (error) {
            console.log(error)
          })
        } else {
          api.createDomain(this.data)
          .then(function (response) {
            console.log(response)
            if (response.data.domain_id) {
              self.$eventHub.$emit('itemsChanged')
              self.$router.push('/domains/' + response.data.domain_id + '/summary')
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
            self.loading = false
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