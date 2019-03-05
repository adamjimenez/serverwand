<template>
  <div>
      <v-alert
        :value="error.length>0"
        type="error"
      >
      {{error}}
      </v-alert>
      
      <Loading :value="fetching" />

      <v-card>
        <v-container
        >
          <v-layout>
            <v-flex xs12 sm3>
              <div class="feature">
                  <div>
                  <div class="icon">
                      <i class="fas fa-microchip"></i>
                  </div>

                  <div class="label">
                      CPU
                  </div>
                  </div>
                  
                  <div style="clear: both; font-size: 12px;">
                  <div style="font-size: 20px;">{{data.cores}} core<span v-if="data.cores>1">s</span></div>
                  {{data.cpu}}
                  </div>
              </div>
            </v-flex>

            <v-flex xs12 sm3>              
              <div class="feature">
                  <div>
                  <div class="icon">
                      <i class="fas fa-memory"></i>
                  </div>

                  <div class="label">
                      Memory Usage
                  </div>
                  </div>
                  
                  <div style="clear: both;">
                      <v-list-tile-title>
                          <v-progress-linear 
                          v-model="data.mem_perc"
                          height="20"
                          ></v-progress-linear>
                      </v-list-tile-title>
                      <v-list-tile-sub-title v-html="format(data.mem_free)+'  free of '+format(data.mem_total)"></v-list-tile-sub-title>
                  </div>
              </div>
            </v-flex>

            <v-flex xs12 sm3>              
              <div class="feature">
                  <div>
                  <div class="icon">
                      <i class="fas fa-hdd"></i>
                  </div>

                  <div class="label">
                      Disk Usage
                  </div>
                  </div>
                  
                  <div style="clear: both;">
                      <v-list-tile-title>
                          <v-progress-linear 
                          v-model="data.disk_perc"
                          height="20"
                          ></v-progress-linear>
                      </v-list-tile-title>
                      <v-list-tile-sub-title v-html="format(data.disk_free)+'  free of '+format(data.disk_space)"></v-list-tile-sub-title>
                  </div>
              </div>
            </v-flex>

            <v-flex xs12 sm3>              
              <div class="feature" style="border-right: 0;">
                  <div>
                  <div class="icon">
                      <i class="fas fa-clock"></i>
                  </div>

                  <div class="label">
                      Uptime
                  </div>
                  </div>
                  
                  <div style="clear: both; font-size: 14px;">
                  {{data.uptime}}
                  </div>
              </div>
            </v-flex>

          </v-layout>
        </v-container>

        <v-list two-line>                
          <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-html="`IP address`"></v-list-tile-title>
                <v-list-tile-sub-title>
                  {{data.ip}} <Copy :val="data.ip" />
                </v-list-tile-sub-title>
              </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list two-line>                
          <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-html="`Kernel version`"></v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ data.kernel }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list two-line>                
          <v-list-tile>
              <v-list-tile-content>
              <v-list-tile-title v-html="`Apache`"></v-list-tile-title>
              <v-list-tile-sub-title v-html="data.apache"></v-list-tile-sub-title>
              </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list two-line>                
          <v-list-tile>
              <v-list-tile-content>
              <v-list-tile-title v-html="`PHP`"></v-list-tile-title>
              <v-list-tile-sub-title v-html="data.php"></v-list-tile-sub-title>
              </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list two-line>                
          <v-list-tile>
              <v-list-tile-content>
              <v-list-tile-title v-html="`MariadDb`"></v-list-tile-title>
              <v-list-tile-sub-title v-html="data.mariadb"></v-list-tile-sub-title>
              </v-list-tile-content>
          </v-list-tile>
        </v-list>
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
        loading: false,
        error: '',
        data: {
          disk_free: 0,
          disk_space: 0,
          disk_perc: 0,
          mem_free: 0,
          mem_total: 0,
          mem_perc: 0
        },
        details: '',
        fetching: true,
        serverId: 0
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
 
        api.get('servers/' + this.serverId + '/summary')
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

<style>
.serverstatus {
  all: initial;
}

.feature {
  margin: 0 5px;
  padding: 15px 15px;
  min-height: 140px;
  border-right: 1px solid #ccc;
}
.icon {
  font-size: 30px; float: left;
}
.label {
  float: right;
  font-size: 12px;
}
</style>