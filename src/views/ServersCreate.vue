<template>
  <div>
    <v-alert
      :value="error.length>0"
      type="error"
    >
    {{error}}
    </v-alert>

    <v-subheader>
      Server details
    </v-subheader>
    <Loading :value="loading" />

    <v-item-group>
      <v-container grid-list-md>
        <v-layout wrap>
          <v-flex xs12 sm6 class="py-2">
              <p>Provider</p>
              <v-btn-toggle v-model="data.provider">
                <v-btn 
                  flat 
                  value="linode"                  
                  @click="getOptions('linode', true)"
                >
                  <span><i class="fab fa-linode"></i></span>
                  <span>Linode</span>
                </v-btn>
                <v-btn flat value="digitalocean">
                  <span><i class="fab fa-digital-ocean"></i></span>
                  <span>Digital Ocean</span>
                </v-btn>
                <v-btn flat value="custom">
                  <span><i class="fas fa-server"></i></span>
                  <span>Custom Server</span>
                </v-btn>
              </v-btn-toggle>
            </v-flex>
        </v-layout>
      </v-container>
    </v-item-group>

    <v-form
      v-if="(data.provider!='')"
      ref="form"
      v-model="valid"
      lazy-validation
    >

      <v-subheader v-if="serverId==0">
        Connect to a server which is freshly installed with Ubuntu 18.04.1 LTS.
      </v-subheader>

      <v-text-field
        v-model="data.name"
        :rules="nameRules"
        label="Name"
        required
      ></v-text-field>

      <div
        v-if="(provider!='custom')"
      >

        <v-select
            v-if="serverId==0"
            v-model="data.region"
            :items="regions"
            label="Region"
        ></v-select>

        <v-select
            v-if="serverId==0"
            v-model="data.type"
            :items="types"
            label="Type"
        ></v-select>
      </div>

      <div
        v-if="(provider=='custom')"
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

      <!--
      <v-checkbox
        label="Webserver"
        v-model="data.webserver"
      ></v-checkbox>
      -->

      <v-select
        v-model="data.dns"
        :items="dns"
        label="DNS provider"
      ></v-select>


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
        mailserver: true
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
      webserverInstalled: false,
      progress: 0,
      provider: '',
      regions: [],
      types: []
    }),

    created () {
      // fetch the data when the view is created and the data is
      // already being observed
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
 
        api.server(this.serverId)
        .then(function (response) {
          console.log(response)

          if (self.serverId) {
            self.data = response.data.items[0]
            self.webserverInstalled = self.data.webserver
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

          function installWebserver() {
            self.dialog = true
            self.details = ''

            // subscribe to status changes
            var source = api.event('servers/' + self.serverId + '/install')
            
            var abortFunction = function() {
                if (source)
                    source.close()

                self.dialog = false;

                if (!self.error) {                  
                  self.$router.push('/servers/' + self.serverId)
                }
            }
        
            source.addEventListener('message', function(event) {
                var result = JSON.parse(event.data)
                console.log(result)

                if (result.msg) {
                  self.details += result.msg + "\n<br>"
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
            api.post('servers/' + self.serverId + '/update', {
              name: this.data.name,
              dns: this.data.dns
            })
            .then(function (response) {
              self.$router.push('/servers/' + self.serverId + '/summary')
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

                if (self.data.webserver) {
                  installWebserver()
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
      getOptions(provider, authPrompt) {
        var self = this

        api.post('providers?cmd=options', {provider: provider})
        .then(function (response) {
          console.log(response)
          //self.items = response.data.items

          if (response.data.require_auth && authPrompt) {
            //$(window).on('authorized', getOptions);
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
            /*
            $( "#region" ).children('option').remove();
            $( "#region" ).append( '<option value=""></option>' );
            
            items = data.options.regions;
            items.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} ); 
            $.each(items, function( index, item ) {
              var selected = item.selected ? 'selected' : '';
              $( "#region" ).append( '<option value="'+item.value+'" '+selected+'>'+item.name+'</option>' );
            });
      
            $( "#image" ).children('option').remove();
            $( "#image" ).append( '<option value=""></option>' );
            
            items = data.options.images;
            items.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} ); 
            $.each(items, function( index, item ) {
              var selected = item.selected ? 'selected' : '';
              $( "#image" ).append( '<option value="'+item.value+'" '+selected+'>'+item.name+'</option>' );
            });
            */
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