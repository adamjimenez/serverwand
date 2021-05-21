<template>
  <v-layout row>
    <v-flex>
      <v-alert
        v-if="error"
        type="error"
      >
        {{error}}
      </v-alert>

      <Loading :value="fetching" />      
      
      <v-list two-line v-if="!fetching">
        <v-list-item>
          <v-list-item-avatar>
            <v-icon left>fas fa-globe</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ data.domain }}
              
              <a v-bind:href="'https://' + data.domain" target="_blank" title="Open site in new window">
                <v-icon right>open_in_new</v-icon>
              </a>
              
              <a v-bind:href="data.shiftedit_url" target="_blank" title="Open in ShiftEdit IDE">
                <v-icon right>code</v-icon>
              </a>
            </v-list-item-title>
            <v-list-item-subtitle>
              <router-link :to="'/servers/' + data.server.id + '/summary'">
                {{data.server.name}}
              </router-link>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>      

      <v-tabs>
        <v-tab :to="'/sites/' + domainId + '/summary'">Summary</v-tab>
        <v-tab :to="'/sites/' + domainId + '/database'">Database</v-tab>
        <v-tab :to="'/sites/' + domainId + '/aliases'">Aliases</v-tab>
        <v-tab :to="'/sites/' + domainId + '/email'" v-if="data.server.mailserver">Email</v-tab>
        <v-tab :to="'/sites/' + domainId + '/apps'">Apps</v-tab>
        <v-tab :to="'/sites/' + domainId + '/dns'">DNS</v-tab>
        <v-tab :to="'/sites/' + domainId + '/backups'">Backups</v-tab>
        <v-tab :to="'/sites/' + domainId + '/settings'">Settings</v-tab>
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
        domainId: null,
        post: null,
        error: null,
        data: {
          server: {}
        },
        details: '',
        fetching: false,
        aliasDrawer: false
      }
    },
    created () {
      document.title = 'Domain'
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        // this.fetching = true
        this.domainId = this.$route.params.id
 
        api.get('sites/' + this.domainId)
        .then(function (response) {
          console.log(response)

          if (response.data.item) {
            self.data = response.data.item
          }

          if (response.data.domain) {
            document.title = self.data.domain
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
  .v-list-item__subtitle a {
    color: inherit !important;
  }
</style>