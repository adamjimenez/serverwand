<template>
  <v-layout row>
    <v-flex>
      <v-alert
        :value="error.length>0"
        type="error"
      >
      {{error}}
      </v-alert>

      <Loading :value="fetching" />
      
      <v-subheader v-if="!fetching">
        {{ data.domain }}
                      
        <a v-bind:href="'http://' + data.domain" target="_blank">
          <i class="material-icons">open_in_new</i>
        </a>
      </v-subheader>

      <v-tabs
        value="!fetching"
      >

        <v-tab
          ripple
        >
          Summary 
        </v-tab>

        <v-tab-item>
          <v-card>

            <v-layout row v-if="data.ip != data.server.ip">
              <v-flex xs12>
                <v-card tile flat>
                  <v-card-text>
                    <strong>Warning: Domain does not point to [{{data.server.ip}}] ({{data.dns.error}})</strong>
                    <v-btn v-if="data.dns.not_set" @click="fixDomainDns(data.domain)">Fix</v-btn>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs12>
                <v-card tile flat>
                  <v-card-text>                            
                    {{ data.domain }}
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
            
            <v-divider></v-divider>

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

            <v-form
              ref="passwordForm"
              v-model="passwordFormValid"
            >
              <v-expansion-panel
                v-model="passwordPanel"
                expand
              >
                <v-expansion-panel-content>
                  <v-icon slot="actions" color="primary">$vuetify.icons.expand</v-icon>
                  <div slot="header">Reset password</div>
                  <v-card tile flat>
                    <v-card-text class="grey lighten-3">                                
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
                    <v-card-actions class="grey lighten-3">
                      <v-btn color="primary" flat @click="submitPassword">Submit</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-form>

          </v-card>
        </v-tab-item>

        <v-tab
          ripple
        >
          Database
        </v-tab>

        <v-tab-item>
          <v-card>

            <v-layout row v-if="data.db_name==false">
              <v-flex xs12>
                <v-btn
                  :disabled="loading!=''"
                  :loading="loading=='database'"
                  @click="addDatabase"
                  >
                  Add Database
                </v-btn>
              </v-flex>
            </v-layout>

            <div v-else>
              <v-layout row>
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>DB Name:</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                      {{data.db_name}}
                      <Copy :val="data.db_name" />
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>DB Username:</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs6>
                  <v-card tile flat>
                    <v-card-text>
                      {{data.db_name}}
                      <Copy :val="data.db_name" />
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>

              <v-form
                ref="dbPasswordForm"
                v-model="dbPasswordFormValid"
              >
                <v-expansion-panel
                  v-model="dbPasswordPanel"
                  expand
                >
                  <v-expansion-panel-content>
                    <v-icon slot="actions" color="primary">$vuetify.icons.expand</v-icon>
                    <div slot="header">Reset db password</div>
                    <v-card tile flat>
                      <v-card-text class="grey lighten-3">                                
                        <v-text-field
                          v-model="dbPassword"
                          :append-icon="showDbPassword ? 'visibility_off' : 'visibility'"
                          :rules="[rules.required, rules.min]"
                          :type="showDbPassword ? 'text' : 'password'"
                          name="db_password"
                          label="Password"
                          hint="At least 8 characters"
                          counter
                          @click:append="showDbPassword = !showDbPassword"
                        ></v-text-field>
                      </v-card-text>
                      <v-card-actions class="grey lighten-3">
                        <v-btn color="primary" flat @click="submitDbPassword">Submit</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-form>
            </div>
                  

          </v-card>
        </v-tab-item>


        <v-tab
          ripple
        >
          Aliases
        </v-tab>

        <v-tab-item>
          <v-card>
            <template v-for="(item, index) in data.aliases">
              <div
                :key="index"
              >
                <v-layout row v-if="item.dns.ip != data.server.ip">
                  <v-flex xs12>
                    <v-card tile flat>
                      <v-card-text>
                        <strong>Warning: Domain does not point to [{{data.server.ip}}] ({{item.dns.error}})</strong>
                        <v-btn v-if="item.dns.not_set" @click="fixAliasDns(item.domain)">Fix</v-btn>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>

                <v-layout row
                  
                >
                  <v-flex xs6>
                    <v-card tile flat>
                      <v-card-text>
                        {{item.domain}}
                      </v-card-text>
                    </v-card>
                  </v-flex>            

                  <v-flex xs6>
                    <v-card tile flat>
                      <v-card-text>
                          <v-btn
                            :disabled="dialog"
                            :loading="dialog"
                            @click="deleteAlias(item.domain)"
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
            <div>
                <v-btn
                  @click="addAlias()"
                >
                  Add domain alias
                </v-btn>
            </div>
          </v-card>
        </v-tab-item>

        <v-tab
          ripple
        >
          Apps
        </v-tab>

        <v-tab-item>
          <v-card>

            <v-layout row>
              <v-flex xs6>
                <v-card tile flat>
                  <v-card-text>Wordpress:</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs6>
                <v-card tile flat>
                  <v-card-text>
                    <v-btn
                      v-if="data.wordpress === false"
                      :disabled="loading!=''"
                      :loading="loading=='wordpress'"
                      @click="installWordpress"
                      >
                      Install wordpress
                    </v-btn>

                    <div v-else>
                      {{ data.wordpress }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
            
          </v-card>
        </v-tab-item>
        
        <v-tab
          ripple
        >
          Settings 
        </v-tab>

        <v-tab-item>

          <v-card>
              <div>
                  <v-card-title primary-title>
                      <v-switch
                          v-model="data.ssl"
                          label="SSL"
                          @change="toggleSSL()"
                      ></v-switch>
                  </v-card-title>
              </div>
          </v-card>

          <v-card>
            <v-card-title primary-title>
              <v-btn
                :disabled="dialog"
                :loading="loading=='delete'"
                @click="deleteDomain"
                >
                Delete Domain
              </v-btn>
            </v-card-title>
          </v-card>
        </v-tab-item>

      </v-tabs>
      

    </v-flex>

    <v-dialog
      v-model="dialog"
      hide-overlay
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



    <v-navigation-drawer
      v-model="aliasDrawer"
      absolute
      temporary
      right
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
              :disabled="dialog"
              :loading="dialog"
              color="success"
              @click="submitAlias"
            >
              Save
            </v-btn>
          </v-card-text>
      </v-card>

    </v-navigation-drawer>
  </v-layout>  
</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'
  import Copy from '../components/Copy'

  export default {
    components: {
      Loading,
      Copy
    },
    data () {
      return {
        loading: '',
        domainId: null,
        post: null,
        error: null,
        data: {
          server: {}
        },
        dialog: false,
        details: '',
        fetching: true,
        passwordPanel: [false],
        passwordFormValid: true,
        dbPasswordPanel: [false],
        dbPasswordFormValid: true,
        showPassword: false,
        showDbPassword: false,
        password: '',
        dbPassword: '',
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
        aliasDrawer: false
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
        this.fetching = true
        this.domainId = this.$route.params.id
 
        api.domain(this.domainId)
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.items[0]
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      toggleSSL () { 
        var self = this
        this.error = ''
        this.dialog = true
        this.loading = 'ssl'

        api.setSSL(this.$route.params.id, {status: this.data.ssl})
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            error = response.data.error
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
          self.loading = ''
        })
      },
      addDatabase () { 
        var self = this
        this.error = ''
        this.dialog = true
        self.loading = 'database'

        api.saveDatabase(this.$route.params.id, {})
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
          self.loading = ''
        })
      },
      installWordpress () { 
        var self = this
        this.error = ''
        this.dialog = true
        this.loading = 'wordpress'

        api.installWordpress(this.$route.params.id)
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
          self.loading = ''
        })
      },
      deleteDomain () { 
        this.$confirm('Delete ' + this.data.domain + '?').then(res => {
          if (res) {
            var self = this
            this.error = ''
            this.dialog = true
            this.loading = 'delete'

            api.deleteDomain(this.$route.params.id)
            .then(function (response) {
              console.log(response)
              
              if (response.data.error) {
                self.error = response.data.error
              } else {
                self.$router.push('/domains/')
              }
            })
            .catch(function (error) {
              console.log(error)
            })
            .finally(function() {
              self.dialog = false
              self.loading = ''
            })
          }
        })
      },
      submitPassword () {
        var self = this
        this.error = ''

        if (this.$refs.passwordForm.validate()) {
          this.details = ''
          this.dialog = true
          
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
            self.dialog = false
            self.loading = ''
            self.passwordPanel = [false]
          })
        }
      },
      submitDbPassword () { 
        var self = this
        this.error = ''

        if (this.$refs.dbPasswordForm.validate()) {
          this.details = ''
          this.dialog = true
          
          api.saveDatabase(self.domainId, {password: self.dbPassword})
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
            self.dialog = false
            self.loading = ''
            self.dbPasswordPanel = [false]
          })
        }
      },
      addAlias () {
        this.aliasDrawer = true
      },
      submitAlias() {
        this.saveAlias();
      },
      saveAlias (noAuthPrompt) {
        var self = this

        if (this.alias.domain) {
          this.details = ''
          this.dialog = true
          this.error = ''

          api.saveAlias(this.domainId, {alias: this.alias.domain, dns: this.alias.dns})
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              if (response.data.error == 'auth' && !noAuthPrompt) {
                var child = window.open('https://serverwand.com/account/services/' + self.data.server.dns)
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
              self.aliasDrawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)              
            self.dialog = false
          })
          .finally(function() {
            self.dialog = false
          })
        }
      },
      deleteAlias (alias) {
        this.$confirm('Delete ' + alias + '?').then(res => {
          if (res) {
            var self = this
            this.dialog = true
            this.error = ''

            api.deleteAlias(this.domainId, {alias: alias})
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
            })
            .finally(function() {
              self.dialog = false
            })
          }
        })
      },
      
      fixDomainDns(domain, noAuthPrompt) {
        var self = this

        this.details = ''
        this.dialog = true
        this.error = ''

        api.get('domains/' + self.domainId + '/fixdomaindns')
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            if (response.data.error == 'auth' && !noAuthPrompt) {
              var child = window.open('https://serverwand.com/account/services/' + self.data.server.dns)
              var interval = setInterval(function() {
                  if (child.closed) {
                      clearInterval(interval)
                      self.fixDomainDns(domain, true)
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
          self.dialog = false
        })
        .finally(function() {
          self.dialog = false
        })
      },
      
      fixAliasDns(alias, noAuthPrompt) {
        var self = this
        
        this.details = ''
        this.dialog = true
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
          self.dialog = false
        })
        .finally(function() {
          self.dialog = false
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