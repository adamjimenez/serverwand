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
      document.title = 'Server'
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
 
        api.get('servers/' + this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
          }
            
          if (response.data.item) {
            self.data = response.data.item
            document.title = self.data.name
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
