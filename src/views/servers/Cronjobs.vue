<template>
    <div>
        <Loading :value="fetching" />
        
        <template v-for="(item, index) in data.cronjobs">
        <v-card 
            :key="index"
        >
            <v-card-title primary-title>
                {{item.command}}
                
                <div>
                    <v-btn
                    @click="editCronjob(item)"
                    >
                    Edit
                    </v-btn>
                </div>
                <div>
                    <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteCronjob(item.line)"
                    >
                    Delete
                    </v-btn>
                </div>
            </v-card-title>
        </v-card>
        </template>

        <v-card>
            <div>
              <v-card-title primary-title>
                <v-btn
                @click="addCronjob()"
                >
                Add cron job
                </v-btn>
              </v-card-title>
            </div>
        </v-card>

      <v-navigation-drawer
        v-model="cronjobDrawer"
        absolute
        temporary
        right
      >
        <v-card>
          <v-form
            ref="cronjobForm"
          >
            <v-card-title>
              Cronjob
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="cronjob.line"
                label="Line"
                v-show="false"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.command"
                label="Command"
                required
                :rules="[rules.required]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.user"
                label="User"
                required
                :rules="[rules.required, rules.alpha]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.minute"
                label="Minute"
                required
                :rules="[rules.required, rules.minute]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.hour"
                label="Hour"
                required
                :rules="[rules.required, rules.hour]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.dom"
                label="Day of month"
                required
                :rules="[rules.required, rules.dom]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.mon"
                label="Month"
                required
                :rules="[rules.required, rules.mon]"
              ></v-text-field>

              <v-text-field
                v-model="cronjob.dow"
                label="Day of week"
                required
                :rules="[rules.required, rules.dow]"
              ></v-text-field>
              
              <v-btn
                :disabled="dialog"
                :loading="dialog"
                color="success"
                @click="saveCronjob"
              >
                Save
              </v-btn>
            </v-card-text>
          </v-form>
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
        dialog: false,
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
      saveUser () {
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
        this.dialog = true
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
          self.dialog = false
        })
      },
      saveCronjob() {
        var self = this
        this.error = ''

        if (this.$refs.cronjobForm.validate()) {
          this.dialog = true
          
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
            self.dialog = false
            self.loading = ''
          })
        }
      }
    }
  }
</script>
