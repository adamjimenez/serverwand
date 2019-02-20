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
          <v-icon left>fas fa-server</v-icon>
          <h1>{{ data.name }}</h1>
        </v-subheader>

        <v-subheader v-if="!fetching">
          <p>IP address: {{data.ip}} ({{ data.location }})</p>          
          <p style="margin-left: 20px;">Kernel version: {{ data.kernel }}</p>
        </v-subheader>

        <v-tabs>
          <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
          <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
          <v-tab :to="'/servers/' + serverId + '/systemusers'">System users</v-tab>
          <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
          <v-tab :to="'/servers/' + serverId + '/logs'">Logs</v-tab>
          <v-tab :to="'/servers/' + serverId + '/settings'">Settings</v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-flex>

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
        error: '',
        data: {
          users: {}
        },
        details: '',
        fetching: true
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
          }
            
          if (response.data.items[0]) {
            self.data = response.data.items[0]
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
