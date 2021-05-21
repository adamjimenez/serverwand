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

  export default {
    data () {
      return {
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
          value: 'mail',
          text: 'Mail',
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
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('servers/' + this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
            return false
          }
          
          self.data = response.data.item
          document.title = 'Logs' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      fetchLog (log) {
        var self = this

        if (log) {
          self.log = log
        } else if (!self.log) {
          return
        }

        this.logContent = 'loading..'

        api.post('servers/' + this.serverId + '/fetchlog', {log: self.log})
        .then(function (response) {
          console.log(response)
          self.logContent = response.data.content
        })
      },
    }
  }
</script>

<style>
  pre {
    overflow: scroll;
  }
</style>
