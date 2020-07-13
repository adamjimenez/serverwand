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
    <v-list>
      <v-list-item-group>
        <template v-for="(item, i) in data.aliases">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
          >
            <template v-slot:default>

              <v-list-item-content>
                <v-list-item-title>
                  {{item.domain}}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action v-if="item.dns.A != data.server.ip">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      @click="fixAliasDns(item.domain)"
                    >
                      <v-icon small>build</v-icon>
                    </v-btn>
                  </template>
                    
                  <span>Fix DNS mismatch ({{item.dns.A}} => {{data.server.ip}})</span>
                </v-tooltip>
              </v-list-item-action>

              <v-list-item-action>
                <v-btn
                  icon
                  :disabled="fetching"
                  :loading="fetching"
                  @click="deleteAlias(item.domain)"
                >
                  <v-icon small>delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>
  </v-card>

    <v-card>
        <div>
            <v-card-title primary-title>
              <v-btn
                  @click="addAlias()"
              >
                  Add domain alias
              </v-btn>
            </v-card-title>
        </div>
    </v-card>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      right
      app
    >
      <v-card>
          <v-card-title>
            Domain alias
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="alias.domain"
              label="Alias"
              required
            ></v-text-field>
            
            <v-checkbox
              v-model="alias.dns"
              label="Configure DNS"
              :disabled="data.server.dns==''"
            ></v-checkbox>
            
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="submitAlias"
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
          disk_usage: 0,
          server: {},
          app: {}
        },
        details: '',
        loading: false,
        fetching: false,
        passwordPanel: [false],
        passwordFormValid: true,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
          emailMatch: () => ('The email and password you entered don\'t match')
        },
        alias: {
          domain: '',
          dns: false
        },
        drawer: false,
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
      fetchData () {        
        var self = this
        this.error = ''
        this.domainId = this.$route.params.id
        clearTimeout(self.timer)

        this.fetching = true
 
        api.get('domains/' + this.domainId + '/aliases')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Aliases' + ' | ' + self.data.domain

          self.data.aliases.forEach(element => {
            if (element.dns.updating) {
              console.log('checking dns')
              self.timer = setTimeout(self.fetchData, 60000)
              return
            }
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addAlias () {
        this.alias.domain = ''
        this.drawer = true
      },
      submitAlias() {
        this.saveAlias();
      },
      saveAlias (noAuthPrompt) {
        var self = this

        if (this.alias.domain) {
          this.details = ''
          this.fetching = true
          this.error = ''

          var child
          if (!noAuthPrompt && this.alias.dns) {
            child = window.open('/loading')
          }

          api.post('domains/' + this.domainId + '/aliases', {alias: this.alias.domain, dns: this.alias.dns})
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              if (response.data.error == 'auth' && !noAuthPrompt) {
                child.location = 'https://serverwand.com/account/services/' + self.data.server.dns

                var interval = setInterval(function() {
                    if (child.closed) {
                        clearInterval(interval)
                        self.saveAlias(true)
                        return
                    }
                }, 500)
              } else {
                self.error = response.data.error
              }
            } else {
              if (child) {
                child.close()
              }
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)              
            self.fetching = false
          })
          .finally(function() {
            self.fetching = false
          })
        }
      },
      deleteAlias (alias) {
        this.$confirm('Delete ' + alias + '?').then(res => {
          if (res) {
            var self = this
            this.fetching = true
            this.error = ''

            api.post('domains/' + this.domainId + '/aliases', {delete: 1, alias: alias})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error;
              } else {
                self.fetchData()
              }
            })
            .catch(function (error) {
              console.log(error)
              self.fetching = false
            })
          }
        })
      },
      
      fixAliasDns(alias, noAuthPrompt) {
        var self = this
        
        this.details = ''
        this.fetching = true
        this.error = ''

        api.post('domains/' + self.domainId + '/fixaliasdns', {alias: alias})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            if (response.data.error == 'auth' && !noAuthPrompt) {
              var child = window.open('https://serverwand.com/account/services/' + self.data.server.dns)
              var interval = setInterval(function() {
                  if (child.closed) {
                      clearInterval(interval)
                      self.fixAliasDns(alias, true)
                      return
                  }
              }, 500)
            } else {
              self.error = response.data.error
            }
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)              
          self.fetching = false
        })
        .finally(function() {
          self.fetching = false
        })
      }
    }
  }
</script>
