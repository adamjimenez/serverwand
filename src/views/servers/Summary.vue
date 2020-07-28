<template>
  <div>

    <v-alert
      :value="error.length>0"
      type="error"
    >
      {{error}}
    </v-alert>
    
    <v-card class="pa-3" :loading="fetching">
      <v-container class="ma-0">
         <v-layout row wrap>
          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                      <i class="fas fa-microchip"></i>
                    </div>

                    <div class="label">
                      CPU
                    </div>
                  </div>
                  
                  <div class="pt-3" style="clear: both; font-size: 12px;">
                    <div style="font-size: 20px;">{{data.cores}} core<span v-if="data.cores>1">s</span></div>
                    {{data.cpu}}
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>

          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                        <i class="fas fa-memory"></i>
                    </div>

                    <div class="label">
                        Memory Usage
                    </div>
                  </div>
                  
                  <div class="pt-3" style="clear: both;">
                      <v-list-item-title>
                          <v-progress-linear 
                            v-model="data.mem_perc"
                            height="20"
                          ></v-progress-linear>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{data.mem_free * 1024 | prettyBytes }} free of {{data.mem_total * 1024 | prettyBytes }}
                      </v-list-item-subtitle>
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>

          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                        <i class="fas fa-hdd"></i>
                    </div>

                    <div class="label">
                        Disk Usage
                    </div>
                  </div>
                  
                  <div class="pt-3" style="clear: both;">
                      <v-list-item-title>
                          <v-progress-linear 
                            v-model="data.disk_perc"
                            height="20"
                          ></v-progress-linear>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{data.disk_free * 1024 | prettyBytes }} free of {{data.disk_space * 1024 | prettyBytes }}
                      </v-list-item-subtitle>
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>

          <v-flex xs12 sm6 md3>
            <v-card>
              <div class="feature">
                <v-card-text>
                  <div>
                    <div class="icon">
                        <i class="fas fa-clock"></i>
                    </div>

                    <div class="label">
                        Uptime
                    </div>
                  </div>
                  
                  <div class="pt-3" style="clear: both; font-size: 14px;">
                  {{data.uptime}}
                  </div>
                </v-card-text>
              </div>
            </v-card>
          </v-flex>
         </v-layout>
      </v-container>

      <v-layout row class="mx-1">
        <v-flex md6 xs12>
          <v-card>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-html="`Updates`"></v-list-item-title>
                    <v-list-item-subtitle>

                      <div>
                        {{data.updates}} updates, {{data.security_updates}} security updates
                        <span v-if="data.reboot_required">(reboot required)</span>
                      </div>

                      <v-tooltip top v-if="data.updates > 0 || data.security_updates > 0">
                        <template v-slot:activator="{ on }">
                          <v-btn                            
                            v-on="on"
                            icon
                            @click="upgrade()"
                            color="warning"
                          >
                            <v-icon small>fas fa-download</v-icon>
                          </v-btn>
                        </template>
                        <span>Upgrade</span>
                      </v-tooltip>

                    </v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-html="`Hostname`"></v-list-item-title>
                    <v-list-item-subtitle>
                      <Copy :val="data.hostname" text />

                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-on="on"
                            icon
                            @click="drawer=true"
                          >
                            <v-icon small>fas fa-edit</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit</span>
                      </v-tooltip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-html="`IP address`"></v-list-item-title>
                    <v-list-item-subtitle>                                            
                      <Copy :val="data.ip" text />
                    </v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-html="`IPv6 address`"></v-list-item-title>
                    <v-list-item-subtitle>                      
                      <Copy :val="data.ipv6" text />
                    </v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

          </v-card>
        </v-flex>

        <v-flex xs6>
          <v-card>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-html="`Kernel version`"></v-list-item-title>
                    <v-list-item-subtitle>
                      {{ data.kernel }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                  <v-list-item-title v-html="`Apache`"></v-list-item-title>
                  <v-list-item-subtitle v-html="data.apache"></v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                  <v-list-item-title v-html="`PHP`"></v-list-item-title>
                  <v-list-item-subtitle v-html="data.php"></v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list two-line>
              <v-list-item>
                  <v-list-item-content>
                  <v-list-item-title v-html="`MariadDb`"></v-list-item-title>
                  <v-list-item-subtitle v-html="data.mariadb"></v-list-item-subtitle>
                  </v-list-item-content>
              </v-list-item>
            </v-list>
            
          </v-card>
        </v-flex>

      </v-layout>

      <v-container class="ma-0">
         <v-layout row wrap>
          <svg width="100%" viewBox="0 0 1060 300" v-html="data.graph">
          </svg>
         </v-layout>
      </v-container>

    </v-card>

    <v-navigation-drawer
        app
        v-model="drawer"
        temporary
        right
    >
      <v-card>
          <v-card-title>
            Set Hostname
          </v-card-title>

          <v-card-text>
            <v-text-field
                v-model="hostname"
                label="Hostname"
                required
            ></v-text-field>
            
            <v-btn
                :disabled="fetching"
                :loading="fetching"
                color="success"
                @click="save"
            >
                Save
            </v-btn>
          </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-dialog
      app
      scrollable
      persistent
      v-model="showMessage"
    >
      <v-card>
          <v-card-title>
            Response
          </v-card-title>

          <v-card-text id="messageBody">
            
            <v-textarea
              :value="message"
              readonly
              auto-grow
              :loading="messageLoading"
            ></v-textarea>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="showMessage = false"
              :disabled="messageLoading"
            >
              Close
            </v-btn>
          </v-card-actions>

      </v-card>
    </v-dialog>
    
  </div>
</template>

<script>
  import api from '../../services/api'
  import Copy from '../../components/Copy'

  export default {
    components: {
      Copy
    },
    data () {
      return {
        error: '',
        message: '',
        showMessage: false,
        messageLoading: true,
        data: {
          disk_free: 0,
          disk_space: 0,
          disk_perc: 0,
          mem_free: 0,
          mem_total: 0,
          mem_perc: 0,
          graph: ''
        },
        hostname: '',
        details: '',
        fetching: false,
        serverId: 0,
        drawer: false
      }
    },
    created () {
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
        this.fetching = true
        this.serverId = this.$route.params.id
 
        api.get('servers/' + this.serverId + '/summary', { clearCacheEntry: clearCacheEntry })
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          }
            
          if (response.data.item) {
            self.data = response.data.item
          }

          if (self.data.disk_space) {
            self.data.disk_perc = Math.round((1- (self.data.disk_free / self.data.disk_space)) * 100)
          }

          if (self.data.mem_total) {
            self.data.mem_perc = Math.round((1- (self.data.mem_free / self.data.mem_total)) * 100)
          }

          self.hostname = self.data.hostname

          document.title = 'Summary' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      save () {
        var self = this
        this.error = ''
        this.fetching = true
 
        api.post('servers/' + this.serverId + '/hostname', { clearCacheEntry: true })
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
            self.fetching = false
          } else if (response.data.success) {
            self.drawer = false
            self.fetchData();
          }
        })
        .catch(function (error) {
          self.fetching = false
          console.log(error)
        })
      },
      upgrade() {
        var self = this
        this.error = ''
        this.showMessage = true
        this.messageLoading = true
        this.message = ''        

        var source = api.event('servers/' + this.serverId + '/upgrade')
        
        source.addEventListener('message', function(event) {
            var result = JSON.parse(event.data)
            console.log(result)

            if (result.msg) {
              self.message += result.msg + "\n"

              // scroll to bottom
              setTimeout(function() {
                var el = document.getElementById('messageBody')
                el.scrollTop = el.scrollHeight
              }, 10)
            }

            if (result.error) {
              self.error = result.error
            }
        }, false)
    
        source.addEventListener('error', function(event) {
            if (event.eventPhase == 2) {
              if (source) {
                self.messageLoading = false
                source.close()
                self.fetchData(true)
              }
            }
        }, false)

      }
    }
  }
</script>

<style>
  .serverstatus {
    all: initial;
  }

  .feature {
    min-height: 140px;
  }

  .icon {
    font-size: 30px; float: left;
  }
  
  .label {
    float: right;
    font-size: 12px;
  }
</style>