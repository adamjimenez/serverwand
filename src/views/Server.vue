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

      <v-list two-line v-if="!fetching">
        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon left>fas fa-server</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ data.name }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{data.hostname}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-tabs>
        <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
        <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
        <v-tab :to="'/servers/' + serverId + '/systemusers'">System users</v-tab>
        <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
        <v-tab :to="'/servers/' + serverId + '/mail'" v-if="data.mailserver">Mail</v-tab>
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
