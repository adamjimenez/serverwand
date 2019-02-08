<template>
    <v-layout>
      <v-flex>
        <v-alert
          :value="error.length>0"
          type="error"
        >
        {{error}}
        </v-alert> 

        <Loading :value="fetching" />
      
        <v-subheader v-if="!fetching">
          <h1>{{ data.name }}</h1>
        </v-subheader>

        <v-subheader v-if="!fetching">
          <p>IP address: ({{ data.location }})</p>
        </v-subheader>

        <v-subheader v-if="!fetching">
          <p>Kernel version: {{ data.kernel }}</p>
        </v-subheader>

        <v-tabs
          value="!fetching"
          dark
        >

          <v-tab
            ripple
          >
            Summary 
          </v-tab>

          <v-tab-item>
            <v-card>
              <v-list two-line>
                
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="`Webserver`"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.webserver ? 'Installed' : 'Not installed'"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>
                
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <i class="fas fa-microchip"></i>
                      CPU
                    </v-list-tile-title>
                    <v-list-tile-sub-title v-if="data.cpu">{{data.cores}} core<span v-if="data.cores>1">s</span>, {{data.cpu}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>
                
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <i class="fas fa-hdd"></i>
                      Disk Usage
                    </v-list-tile-title>
                    <v-list-tile-title>
                        <v-progress-linear v-model="data.disk_perc"></v-progress-linear>
                    </v-list-tile-title>
                    <v-list-tile-sub-title v-html="format(data.disk_free)+'  free of '+format(data.disk_space)"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>
                
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <i class="fas fa-memory"></i>
                      Memory Usage
                    </v-list-tile-title>
                    <v-list-tile-title>
                        <v-progress-linear v-model="data.mem_perc"></v-progress-linear>
                    </v-list-tile-title>
                    <v-list-tile-sub-title v-html="format(data.mem_free)+'  free of '+format(data.mem_total)"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>

                <v-divider></v-divider>
                
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <i class="fas fa-clock"></i> 
                      Uptime
                    </v-list-tile-title>
                    <v-list-tile-sub-title v-html="data.uptime"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-tab-item>
          
          <v-tab
            ripple
          >
            System users 
          </v-tab>

          <v-tab-item>
              <template v-for="(item, index) in data.users">
                <v-card 
                  :key="index"
                >
                  <v-card-title primary-title>
                      {{item.name}}
                      
                      <div>
                          <v-btn
                            @click="editUser(item.name)"
                            >
                            Edit
                          </v-btn>
                      </div>
                      <div>
                          <v-btn
                            :disabled="dialog"
                            :loading="dialog"
                            @click="deleteUser(item.name)"
                            >
                            Delete
                          </v-btn>
                      </div>
                  </v-card-title>
                </v-card>
              </template>

            <v-card>
              <div>
                  <v-btn
                    @click="addUser()"
                  >
                    Add system user
                  </v-btn>
              </div>
            </v-card>
          </v-tab-item>
          
          <v-tab
            ripple
          >
            Settings 
          </v-tab>

          <v-tab-item>
            <v-card>
              <v-card-title primary-title>
                <div>
                    <v-btn
                      @click="editServer"
                      >
                      Edit
                    </v-btn>
                </div>
                <div>
                    <v-btn
                      :disabled="dialog"
                      :loading="dialog"
                      @click="deleteServer"
                      >
                      Disconnect
                    </v-btn>
                </div>
              </v-card-title>
            </v-card>
          </v-tab-item>
          
          <v-tab
            ripple
          >
            Logs
          </v-tab>

          <v-tab-item>
            <v-card>
              <v-card-title primary-title>
                <v-select
                  :items="logs"
                  label="Log"
                  @change="fetchLog"
                ></v-select>
                
                <v-btn
                  @click="fetchLog()"                  
                  :disabled="!log"
                  >
                  <i class="fas fa-redo-alt"></i>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <pre>{{ logContent }}</pre>
              </v-card-text>
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
        v-model="userDrawer"
        absolute
        temporary
        right
      >

        <v-card>
            <v-card-title>
              System user
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="system_user.user"
                label="User"
                required
              ></v-text-field>
              
              <v-text-field              
                v-model="system_user.password"
                type="password"
                label="Password"
                required
                browser-autocomplete="new-password"
              ></v-text-field>
              
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

      </v-navigation-drawer>

    </v-layout>

</template>

<script>
  import api from '../services/api'
  import Loading from '../components/Loading'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        loading: false,
        error: '',
        data: {
          users: {}
        },
        system_user: {
          user: '',
          password: ''
        },
        dialog: false,
        details: '',
        fetching: true,
        userDrawer: false,        
        serverId: 0,
        logs: [{
          value: 'journal',
          text: 'Journal',
        }, {
          value: 'auth',
          text: 'Auth',
        }, {
          value: 'apache_access',
          text: 'Apache Access',
        }, {
          value: 'apache_error',
          text: 'Apache Error',
        }, {
          value: 'mysql',
          text: 'MySQL',
        }, {
          value: 'fail2ban',
          text: 'Fail2ban',
        }, {
          value: 'letsencrypt',
          text: 'Letsencrypt',
        }],
        log: '',        
        logContent: ''
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.serverId = this.$route.params.id
      this.fetchData()
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
 
        api.server(this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            if (response.data.expired) {
              location.href = 'https://serverwand.com/pricing'
            }

            return false
          }
            
          self.data = response.data.items[0]
          self.data.disk_perc = Math.round((1- (self.data.disk_free / self.data.disk_space)) * 100)
          self.data.mem_perc = Math.round((1- (self.data.mem_free / self.data.mem_total)) * 100)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      editServer () { 
        this.$router.push('/servers/' + this.$route.params.id + '/edit')
      },
      deleteServer () {
        var self = this
        this.dialog = true

        api.deleteServer(this.$route.params.id)
        .then(function (response) {
          console.log(response)

          if (response.data.success) {
            // subscribe to status changes
            self.$router.push('/servers/')
          }
        })
        .catch(function (error) {
          console.log(error)
        })
      },
      addUser() {
        this.userDrawer = true
      },
      editUser(user) {
        this.system_user.user = user
        this.userDrawer = true
      },
      deleteUser(user) {
        var self = this
        this.dialog = true
        this.error = ''

        api.deleteSystemUser(this.serverId, {user: user})
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
      },
      validate () {
        var self = this

        if (this.system_user.user && this.system_user.password) {
          this.details = ''
          this.dialog = true
          this.error = ''

          api.saveSystemUser(this.serverId, this.system_user)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.userDrawer = false
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
      fetchLog (log) {
        var self = this

        if (log) {
          self.log = log
        } else if (!self.log) {
          return
        }

        this.logContent = 'loading..'

        api.fetchLog(this.serverId, {log: self.log})
        .then(function (response) {
          console.log(response)
          self.logContent = response.data.content
        })
      }
    }
  }
</script>