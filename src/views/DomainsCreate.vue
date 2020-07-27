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
            v-model="data.dns"
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

    <Domain ref="Domain" />

  </div>
</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'
  import Domain from '../components/Domain'

  export default {
    components: {
      Loading,
      Domain
    },
    data: () => ({
      loading: false,
      valid: true,
      data: {
        domain: '',
        password: '',
        server: '',
        dns: true,
      },
      domainRules: [
        v => !!v || 'Domain is required'
      ],
      passwordRules: [
      ],
      servers: [],
      dnsProviders: {},
      details: "",
      serverId: 0,
      error: '',
      authRequired: false
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
      save () {

        var self = this
        this.error = ''
        this.details = ''
        this.loading = true

        console.log(arguments);

        if (self.domainId) {
          api.post('domains/' + this.domainId + '/update', this.data)
          .then(function (response) {
            console.log(response)
            self.$router.push('/domains/' + self.domainId + '/summary')
          })
          .catch(function (error) {
            console.log(error)
          })
        } else {
          
          self.loading = false
          this.$refs.Domain.create(this.data)

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