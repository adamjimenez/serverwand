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
          class="mx-auto"
          :loading="fetching"
        >

          <v-layout row v-if="data.server && data.dns && data.dns.MX != data.server.hostname">
            <v-flex xs12>
              <v-card tile flat>
                  <v-card-text>
                    <strong>MX mismatch:  {{data.dns.MX}} != {{data.server.hostname}}</strong>
                    <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
                  </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

          <v-card-title primary-title>
            <v-switch
                v-model="data.email"
                label="Email"
                @change="toggleEmail()"
            ></v-switch>
          </v-card-title>

      </v-card>

      <v-card
          class="mx-auto"
      >
        <v-card-text>
          <p>IMAP server: {{data.server.hostname}}:143</p>
          <p>SMTP server: {{data.server.hostname}}:25</p>
        </v-card-text>
      </v-card>

      <v-card>
          <template v-for="(item, index) in data.emails">
            <div
            :key="index"
            >
              <v-layout
              >
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                      {{item.user}} ({{ format(item.disk_usage) }})
                      <div v-if="item.destination">
                        <v-icon left>fas fa-long-arrow-alt-right</v-icon> {{item.destination}}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-flex>            

                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                      <v-btn
                        :disabled="fetching"
                        :loading="fetching"
                        @click="editEmail(index)"
                      >
                      Edit
                      </v-btn>

                      <v-btn
                        :disabled="fetching"
                        :loading="fetching"
                        @click="deleteEmail(item.user)"
                      >
                      Delete
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>

              <v-divider></v-divider>
            </div>
          </template>
      </v-card>

      <v-card>
        <v-card-text>
          <v-btn
              @click="addEmail()"
          >
            Add email
          </v-btn>
        </v-card-text>
      </v-card>        


      <v-navigation-drawer
        v-model="drawer"
        fixed
        temporary
        right
      >

          <v-card>
            <v-card-title>
              Email account
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="email.user"
                label="Name"
                required
                :readonly="userReadonly"
              ></v-text-field>

              <v-text-field
                type="password"
                v-model="email.password"
                label="Password"
                required
              ></v-text-field>

              <v-text-field
                v-model="email.destination"
                label="Forwarding"
                required
              ></v-text-field>
              
              <v-btn
                :disabled="fetching"
                :loading="fetching"
                color="success"
                @click="saveEmail()"
              >
              Save
              </v-btn>
            </v-card-text>
          </v-card>

      </v-navigation-drawer>
    </div>  
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        domainId: null,
        post: null,
        error: null,
        data: {
          email: false,
          emails: [],
          server: {},
          records: {}
        },
        email: {},
        fetching: false,
        loading: false,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        },
        copyText: 'Copy',
        drawer: false,
        userReadonly: false,
        timer: null
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
        for(si = 0; size >= 1024; size /= 1024, si++) {}

        return '' + Math.round(size) + 'KMGT'.substr(si, 1)
      },
      fetchData () {        
        var self = this
        this.error = ''
        this.domainId = this.$route.params.id 
        clearTimeout(self.timer)
        this.fetching = true

        api.get('domains/' + this.domainId + '/email')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Email' + ' | ' + self.data.domain

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
      toggleEmail () { 
        var self = this
        this.error = ''
        this.loading = true

        api.post('domains/' + this.domainId  + '/email', {update: 1, status: this.data.email})
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
          self.loading = false
        })
      },
      addEmail () {
        this.drawer = true
        this.userReadonly = false
        this.email = {}
      },
      editEmail (index) {
        this.drawer = true
        this.userReadonly = true
        this.email = this.data.emails[index];
      },
      saveEmail () {
        var self = this

        if (this.email.user) {
          this.loading = true
          this.error = ''

          api.post('domains/' + this.domainId + '/email', this.email)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error
              self.loading = false
            } else {
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
            self.loading = false
          })
        }
      },
      deleteEmail (user) {
        this.$confirm('Delete ' + user + '?').then(res => {
          if (res) {
            var self = this
            this.loading = true
            this.error = ''

            api.post('domains/' + this.domainId + '/email', {delete: 1, user: user})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error
                self.loading = false
              } else {
                self.fetchData()
              }
            })
            .catch(function (error) {
              console.log(error)
              self.loading = false
            })
          }
        })
      },
      fixDomainDns(domain, noAuthPrompt) {
        var self = this
        this.error = ''
        this.loading = true

        var child
        if (!noAuthPrompt) {
            child = window.open('/loading')
        }

        api.get('domains/' + self.domainId + '/fixmx')
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            if (response.data.error == 'auth' && !noAuthPrompt) {
              child.location = 'https://serverwand.com/account/services/' + self.data.server.dns

              var interval = setInterval(function() {
                  if (child.closed) {
                      clearInterval(interval)
                      self.fixDomainDns(domain, true)
                      return
                  }
              }, 500)
            } else {
              self.error = response.data.error
              self.loading = false
            }
          } else {
            if (child) {
              child.close()
            }
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      }
    }
  }
</script>

<style>
.v-expansion-panel__header {
  padding: 10px 16px;
}
</style>