<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert>

    <v-subheader>
      <h1>Server details</h1>
    </v-subheader>


    <Loading :value="loading" />

    <v-item-group v-if="!this.$route.params.id">
        <v-subheader>
          Choose a VPS provider below or add your own custom server
        </v-subheader>

        <v-btn-toggle v-model="data.provider">
          <v-btn 
            flat 
            value="linode"                  
            @click="getOptions('linode')"
          >
            <v-icon left dark>fab fa-linode</v-icon>
            Linode
          </v-btn>

          <v-btn 
            flat 
            value="digitalocean"
            @click="getOptions('digitalocean')"
          >
            <v-icon left dark>fab fa-digital-ocean</v-icon>
            Digital Ocean
          </v-btn>

          <v-btn 
            flat 
            value="custom"
          >
            <v-icon left dark>fas fa-server</v-icon>
            Custom Server
          </v-btn>
        </v-btn-toggle>
    </v-item-group>

    <v-form
      v-if="(data.provider!='')"
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-card>
        <v-card-text>
          <p v-if="data.provider=='custom' && !this.$route.params.id">
            Connect to a server which is freshly installed with Ubuntu 18.04 LTS
          </p>

          <p v-if="data.provider=='linode' && !this.$route.params.id">
            Create a new Linode
          </p>

          <p v-if="data.provider=='digitalocean' && !this.$route.params.id">
            Create a new Droplet
          </p>

          <v-text-field
            v-model="data.name"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>

          <div
            v-if="(data.provider!='custom')"
          >

            <v-select
                v-if="!this.$route.params.id"
                v-model="data.region"
                :items="regions"
                label="Region"
            ></v-select>

            <v-select
                v-if="!this.$route.params.id"
                v-model="data.type"
                :items="types"
                label="Type"
            ></v-select>
          </div>

          <div
            v-if="(data.provider=='custom')"
          >
            <v-text-field
              :disabled="serverId>0"
              v-model="data.host"
              :rules="hostRules"
              label="Host name/ IP Address"
              required
            ></v-text-field>

            <v-text-field
              :disabled="serverId>0"
              v-model="data.user"
              label="Username"
              required
            ></v-text-field>

            <v-text-field
              type="password"
              :disabled="serverId>0"
              v-model="data.pass"
              label="Password"
              required
            ></v-text-field>

            <v-text-field
              :disabled="serverId>0"
              v-model="data.port"
              label="Port"
              required
            ></v-text-field>
          </div>

          <v-select
            v-model="data.dns"
            :items="dns"
            label="DNS provider"
            v-if="(data.provider=='custom' || serverId>0)"
          ></v-select>

          <v-checkbox
            v-model="data.webserver"
            label="Webserver"
            readonly
          ></v-checkbox>
          
          <v-checkbox
            v-model="data.mailserver"
            label="Mailserver"
          ></v-checkbox>

          <v-btn
            :disabled="dialog"
            :loading="dialog"
            color="success"
            @click="validate"
          >
            Save
          </v-btn>
        </v-card-text>
      </v-card>
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
          <v-layout row>
              <i class="fas fa-magic fa-2x faa-horizontal animated"></i>
              <h2 style="margin-left: 10px;">Spellcasting...</h2>
          </v-layout>

          <v-progress-linear
            :indeterminate="progress==0"
            v-model="progress"
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
        provider: '',
        name: '',
        host: '',
        user: 'root',
        pass: '',
        port: '22',
        webserver: true,
        mailserver: false
      },
      dns: [{
        text: 'Linode',
        value: 'linode'
      }, {
        text: 'Digital Ocean',
        value: 'digitalocean'
      }, {
        text: 'Other',
        value: ''
      }],
      nameRules: [
        v => !!v || 'Name is required'
      ],
      hostRules: [
        v => !!v || 'IP is required'
      ],
      dialog: false,
      details: "",
      serverId: 0,
      error: '',
      progress: 0,
      provider: '',
      regions: [],
      types: []
    }),

    created () {
      document.title = 'Server details'
      if (this.$route.params.id) {
        this.serverId = this.$route.params.id
      }
      this.fetchData()
    },

    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.loading = true
 
        api.get('servers/' + this.serverId)
        .then(function (response) {
          console.log(response)

          if (self.serverId) {
            self.data = response.data.items[0]
          }
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
          this.error = ''

          function install() {
            self.dialog = true
            self.details = ''

            // subscribe to status changes
            var source = api.event('servers/' + self.serverId + '/install')
            
            var abortFunction = function() {
                if (source)
                    source.close()

                self.dialog = false;

                if (!self.error) {                  
                  self.$router.push('/servers/' + self.serverId + '/summary')
                }
            }
        
            source.addEventListener('message', function(event) {
                var result = JSON.parse(event.data)
                console.log(result)

                if (result.msg) {
                  self.details = result.msg + '...'
                }

                if (result.error) {
                  self.error = result.error
                }

                if (result.progress) {
                  self.progress = result.progress
                }
            }, false)
        
            source.addEventListener('error', function(event) {
                if (event.eventPhase == 2)
                    abortFunction()
            }, false)
          }

          if (self.serverId) {
            api.post('servers/' + self.serverId + '/update', this.data)
            .then(function (response) {
              if (response.data.install) {
                install()
              } else {
                self.$router.push('/servers/' + self.serverId + '/summary')
              }
            })
            .catch(function (error) {
              console.log(error)
            })
          } else {
            api.post('servers/create', this.data)
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error;
                self.dialog = false
              } else if(response.data.id) {
                self.serverId = response.data.id

                if (self.serverId) {
                  install()
                }
              }
            })
            .catch(function (error) {
              console.log(error)              
              self.dialog = false
            })
            .finally(function() {
            })
          }
        }
      },
      getOptions(provider, noAuthPrompt) {
        var self = this
        this.loading = true

        api.post('providers?cmd=options', {provider: provider})
        .then(function (response) {
          console.log(response)

          if (response.data.require_auth && !noAuthPrompt) {
            var child = window.open('https://serverwand.com/account/services/' + provider)

            var interval = setInterval(function() {
                if (child.closed) {
                    clearInterval(interval)
                    self.getOptions(provider, true)
                    return
                }
            }, 500)
          } else if(!response.data.require_auth) {
            self.regions = response.data.options.regions;
            self.types = response.data.options.types;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      }
    }
  }
</script>
