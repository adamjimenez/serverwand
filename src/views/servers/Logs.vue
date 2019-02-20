<template>
    <div>

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
            <div v-if="log=='serverstatus'" v-html="logContent" class="serverstatus"></div>
            <pre v-else>{{ logContent }}</pre>
            </v-card-text>
        </v-card>

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
        loading: false,
        error: '',
        data: {
          users: {}
        },
        system_user: {
          user: '',
          password: ''
        },
        cronjob: {
          name: '',
          user: '',
          command: '',
          minute: '',
          hour: '',
          dom: '',
          mon: '',
          dow: ''
        },
        cronjobs: [],
        rules: {
          required: value => !!value || 'Required.',
          alpha: v => /^[a-zA-Z]+$/g.test(v) || 'Must contain a-z characters only',
          minute: v => (v=='*' || (v>=0 && v<60) ) || '0-59 or *',
          hour: v => (v=='*' || (v>=0 && v<24) ) || '0-23 or *',
          dom: v => (v=='*' || (v>=1 && v<=31) ) || '1-31 or *',
          mon: v => (v=='*' || (v>=1 && v<12) ) || '1-12 or *',
          dow: v => (v=='*' || (v>=1 && v<7) ) || '1-7 or *',
        },
        details: '',
        fetching: true,
        userDrawer: false,
        cronjobDrawer: false,
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
        }, {
          value: 'serverstatus',
          text: 'Server Status',
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
        this.fetching = true

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
        this.fetching = true
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
          self.dialfetchingog = false
        })
      },
      saveUser () {
        var self = this

        if (this.system_user.user && this.system_user.password) {
          this.details = ''
          this.fetching = true
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
            self.fetching = false
          })
          .finally(function() {
            self.fetching = false
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
      },      
      addCronjob() {
        this.cronjob = {}
        this.cronjobDrawer = true
      },
      editCronjob(cronjob) {
        this.cronjob = cronjob
        this.cronjobDrawer = true
      },
      deleteCronjob(line) {
        var self = this
        this.fetching = true
        this.error = ''

        api.deleteCronjob(this.serverId, {line: line})
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
          self.fetching = false
        })
      },
      saveCronjob() {
        var self = this
        this.error = ''

        if (this.$refs.cronjobForm.validate()) {
          this.fetching = true
          
          api.saveCronjob(self.serverId, this.cronjob)
          .then(function (response) {
            console.log(response)
            if (response.data.error) {
              self.error = response.data.error
            } else {
              self.cronjobDrawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function() {
            self.fetching = false
            self.loading = ''
          })
        }
      }
    }
  }
</script>
