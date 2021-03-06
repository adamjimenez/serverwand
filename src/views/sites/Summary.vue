<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>

    <v-alert
      v-if="enablingSSL"
      class="ma-0"
    >
      <strong>Enabling SSL</strong>
    </v-alert>

    <v-alert
      v-if="data.dns && data.dns.updating"
      class="ma-0"
    >
      <strong>Checking DNS..</strong>
    </v-alert>

    <v-alert
      v-if="authRequired"
      class="ma-0"
    >
      <strong>DNS auth required: </strong>
      <v-btn @click="authPrompt()">Fix</v-btn>
    </v-alert>

    <Loading :value="loading" />    

    <v-card 
      class="pa-3"
      :loading="fetching"
    >

      <v-list>
        <v-list-item v-if="!authRequired && data.server && data.dns && data.dns.A != data.server.ip">
          <v-list-item-content>
            <v-list-item-title>
              DNS mismatch
            </v-list-item-title>
            <v-list-item-subtitle>
              {{data.dns.A}} != {{data.server.ip}} <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              Disk Usage
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ data.disk_usage * 1024 | prettyBytes }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              FTP Host
            </v-list-item-title>
            <v-list-item-subtitle>
              {{data.domain}}
              <Copy :val="data.domain" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              Username
            </v-list-item-title>
            <v-list-item-subtitle>
              {{data.domain}}
              <Copy :val="data.domain" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              Password
            </v-list-item-title>
            <v-list-item-subtitle>
                {{data.auth.password}}
                <Edit :val="data.ftp_password" label="FTP Password" name="password" password  :path="'sites/' + this.siteId + '/update'" />
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <div v-if="data.origin">
          
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                Password protection
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-switch
                  v-model="data.auth.active"
                  label="Active"
                  @change="toggleAuth()"
                ></v-switch>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                Username
              </v-list-item-title>
              <v-list-item-subtitle>
                {{data.auth.username}}
                <Copy :val="data.auth.username" text />
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                Password
              </v-list-item-title>
              <v-list-item-subtitle>
                  {{data.auth.password}}
                  <Edit :val="data.auth.password" label="Auth Password" name="password" password  :path="'sites/' + this.siteId + '/auth'" />
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>

        </div>
      
      </v-list>

    </v-card>
  </div>  
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'
  import Edit from '../../components/Edit'

  export default {
    components: {
      Loading,
      Copy,
      Edit
    },
    data () {
      return {
        siteId: null,
        post: null,
        error: null,
        data: {
          disk_usage: 0,
          server: {},
          app: {},
          dns: {},
          auth: {}
        },
        details: '',
        loading: false,
        fetching: false,
        enablingSSL: false,
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
      fetchData (clearCacheEntry) {        
        var self = this
        this.error = ''
        this.siteId = this.$route.params.id
        clearTimeout(self.timer)
        this.fetching = true
 
        api.get('sites/' + this.siteId + '/summary', { clearCacheEntry: clearCacheEntry })
        .then(function (response) {
          console.log(response)
          
          if (response.data.item) {
            self.data = response.data.item
          }
          
          if (self.data.domain) {
            document.title = 'Summary' + ' | ' + self.data.domain
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false

          if (self.data.dns && self.data.dns.updating) {
            console.log('checking dns')
            self.timer = setTimeout(function() {self.fetchData(true); }, 10000)
          }/* else if(self.data.dns && self.data.dns.A == self.data.server.ip && !self.data.ssl) {
            self.enableSSL()
          }*/
        })
      },
      enableSSL() {
        var self = this
        this.error = ''
        this.fetching = true
        this.enablingSSL = true
        this.loading = true

        api.post('sites/' + this.$route.params.id  + '/settings', {save: 1, ssl: true})
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
          self.enablingSSL = false
          self.loading = false
        })
      },
      submitPassword () {
        var self = this
        this.error = ''

        if (this.$refs.passwordForm.validate()) {
          this.details = ''
          this.fetching = true
          
          api.post('sites/' + self.siteId + '/update', {password: self.password})
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

        api.post('sites/' + self.siteId + '/fixdns', {})
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
            self.fetchData(true)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      },
      authPrompt() {
        this.authRequired = false
        window.open('https://serverwand.com/account/services/' + this.data.server.dns)
      },
      toggleAuth() {
        var self = this
        this.fetching = true
        this.error = ''

        api.post('sites/' + this.siteId + '/auth', {status: this.data.auth.active})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData(true)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      }
    }
  }
</script>