<template>
  <v-layout row>
    <v-flex>
      <v-alert
        v-if="error"
        type="error"
      >
        {{error}}
      </v-alert>

      <v-list two-line v-if="!fetching">
        <v-list-item>
          <v-list-item-avatar>
            <v-icon left>fas fa-server</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ data.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{data.hostname}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-tabs>
        <v-tab :to="'/servers/' + serverId + '/summary'">Summary</v-tab>
        <v-tab :to="'/servers/' + serverId + '/services'">Services</v-tab>
        <v-tab :to="'/servers/' + serverId + '/cronjobs'">Cronjobs</v-tab>
        <v-tab :to="'/servers/' + serverId + '/systemusers'">System users</v-tab>
        <v-tab :to="'/servers/' + serverId + '/firewall'">Firewall</v-tab>
        <v-tab :to="'/servers/' + serverId + '/mail'">Mail</v-tab>
        <v-tab :to="'/servers/' + serverId + '/logs'">Logs</v-tab>
        <v-tab :to="'/servers/' + serverId + '/backups'">Backups</v-tab>
        <v-tab :to="'/servers/' + serverId + '/settings'">Settings</v-tab>
      </v-tabs>
      <router-view></router-view>
    </v-flex>

  </v-layout>
</template>

<script>
  import api from '../services/api'

  export default {
    data () {
      return {
        error: '',
        data: {
          users: {}
        },
        details: '',
        fetching: false
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
      fetchData () {        
        document.title = 'Server'
        var self = this
        this.error = ''
        // this.fetching = true
        this.serverId = this.$route.params.id
 
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
