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

    <v-subheader v-if="serverId==0">
      Connect to a server which is freshly installed with Ubuntu 18.04.1 LTS.
    </v-subheader>

    <Loading :value="loading" />

    <v-form
      v-if="!loading"
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-text-field
        v-model="data.name"
        :rules="nameRules"
        label="Name"
        required
      ></v-text-field>

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

      <v-checkbox
        label="Webserver"
        v-model="data.webserver"
      ></v-checkbox>

      <!--
      <v-checkbox
        label="Mailserver"
        v-model="data.mailserver"
      ></v-checkbox>
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
        name: '',
        host: '',
        user: 'root',
        pass: '',
        port: '22',
        webserver: true,
        mailserver: true
      },
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
      progress: 0
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
            var source = api.installWebserver(self.serverId)
            
            var abortFunction = function() {
                if (source)
                    source.close()

                self.dialog = false;
                self.$router.push('/servers/' + self.serverId)
            }
        
            source.addEventListener('message', function(event) {
                var result = JSON.parse(event.data)
                console.log(result)
                self.details += result.msg + "\n<br>"

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
            api.updateServer(this.serverId, {
              name: this.data.name
            })
            .then(function (response) {
              console.log(response)

              if(self.data.webserver && !self.webserverInstalled) {
                installWebserver()
              } else {
                self.$router.push('/servers/' + self.serverId)
              }
            })
            .catch(function (error) {
              console.log(error)
            })
          } else {
            api.createServer(this.data)
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error;
                self.dialog = false
              } else if(response.data.server_id) {
                self.serverId = response.data.server_id

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
      }
    }
  }
</script>