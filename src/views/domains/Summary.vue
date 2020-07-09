<template>
  <div>
    <v-alert
    :value="error.length>0"
    type="error"
    >
    {{error}}
    </v-alert>

    <Loading :value="loading" />    

    <v-card 
      class="pa-3"
      :loading="fetching"
    >

      <v-layout row v-if="authRequired">
        <v-flex xs12>
          <v-card tile flat>
              <v-card-text>
                <strong>DNS auth required: </strong>
                <v-btn @click="authPrompt()">Fix</v-btn>
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout row v-if="!authRequired && data.server && data.dns && data.dns.A != data.server.ip">
        <v-flex xs12>
          <v-card tile flat>
              <v-card-text>
                <strong>DNS mismatch: {{data.dns.A}} != {{data.server.ip}}</strong>
                <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs6>
          <v-card tile flat>
              <v-card-text>Disk Usage:</v-card-text>
          </v-card>
          </v-flex>
          <v-flex xs6>
          <v-card tile flat>
              <v-card-text>
                {{ format(data.disk_usage) }}
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      
      <v-divider></v-divider>

      <v-layout row>
        <v-flex xs6>
          <v-card tile flat>
              <v-card-text>FTP host:</v-card-text>
          </v-card>
          </v-flex>
          <v-flex xs6>
          <v-card tile flat>
              <v-card-text>
                {{data.domain}}
              <Copy :val="data.domain" />
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      
      <v-divider></v-divider>

      <v-layout row>
        <v-flex xs6>
          <v-card tile flat>
              <v-card-text>Username:</v-card-text>
          </v-card>
          </v-flex>
          <v-flex xs6>
          <v-card tile flat>
              <v-card-text>
                {{data.domain}}
                <Copy :val="data.domain" />
              </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      
      <v-divider></v-divider>

      <v-expansion-panels>
        <v-expansion-panel
          v-model="passwordPanel"
          expand
        >
          <v-expansion-panel-header class="pa-1">Reset password</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-form
                ref="passwordForm"
                v-model="passwordFormValid"
              >
                <v-card flat>
                  <v-card-text>                                
                    <v-text-field
                    v-model="password"
                    :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                    :rules="[rules.required, rules.min]"
                    :type="showPassword ? 'text' : 'password'"
                    name="ftp_password"
                    label="Password"
                    hint="At least 8 characters"
                    counter
                    @click:append="showPassword = !showPassword"
                    ></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                      <v-btn color="primary" @click="submitPassword">Submit</v-btn>
                  </v-card-actions>
                </v-card>   
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-card>
  </div>  
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'

  export default {
    components: {
      Loading,
      Copy
    },
    data () {
      return {
        domainId: null,
        post: null,
        error: null,
        data: {
          disk_usage: 0,
          server: {},
          app: {}
        },
        details: '',
        loading: false,
        fetching: false,
        passwordPanel: [false],
        passwordFormValid: true,
        showPassword: false,
        password: '',
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        },
        alias: {
          domain: '',
          dns: true
        },
        copyText: 'Copy',
        timer: null,
        authRequired: false
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      format: function(size) {
        if (size === '' || size === -1) {
          return ''
        }

        var si
        for(si = 0; size >= 1024; size /= 1024, si++)

        return '' + Math.round(size) + 'KMGT'.substr(si, 1)
      },
      fetchData () {        
        var self = this
        this.error = ''
        this.domainId = this.$route.params.id
        clearTimeout(self.timer)
        this.fetching = true
 
        api.get('domains/' + this.domainId + '/summary')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Summary' + ' | ' + self.data.domain

          if (self.data.dns.updating) {
            console.log('checking dns')
            self.timer = setTimeout(self.fetchData, 60000)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      submitPassword () {
        var self = this
        this.error = ''

        if (this.$refs.passwordForm.validate()) {
          this.details = ''
          this.fetching = true
          
          api.updateDomain(self.domainId, {password: self.password})
          .then(function (response) {
            console.log(response)
            if (response.data.error) {
              self.error = response.data.error
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function() {
            self.fetching = false
            self.loading = false
            self.passwordPanel = [false]
          })
        }
      },
      fixDomainDns() {
        var self = this
        this.error = ''
        this.loading = true

        api.post('domains/' + self.domainId + '/fixdns', {})
        .then(function (response) {
          console.log(response)

          self.loading = false
          
          if (!response.data.success) {
            if (response.data.error == 'auth') {
              self.authRequired = true
            } else {
              self.error = response.data.error
            }
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      },
      authPrompt() {
        this.authRequired = false
        window.open('https://serverwand.com/account/services/' + this.data.server.dns)
      }
    }
  }
</script>