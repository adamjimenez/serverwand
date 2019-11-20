<template>
  <v-layout row>
    <v-flex>
      <v-alert
        :value="error.length>0"
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
              
              <a v-bind:href="'http://' + data.domain" target="_blank">
                <v-icon right>open_in_new</v-icon>
              </a> 
            </v-list-item-title>
            <v-list-item-subtitle>
              {{data.server.name}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>      

      <v-tabs>
        <v-tab :to="'/domains/' + domainId + '/summary'">Summary</v-tab>
        <v-tab :to="'/domains/' + domainId + '/database'">Database</v-tab>
        <v-tab :to="'/domains/' + domainId + '/aliases'">Aliases</v-tab>
        <v-tab :to="'/domains/' + domainId + '/email'" v-if="data.server.mailserver">Email</v-tab>
        <v-tab :to="'/domains/' + domainId + '/apps'">Apps</v-tab>
        <v-tab :to="'/domains/' + domainId + '/settings'">Settings</v-tab>
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
        loading: false,
        domainId: null,
        post: null,
        error: null,
        data: {
          server: {}
        },
        details: '',
        fetching: true,
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
        this.fetching = true
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId)
        .then(function (response) {
          console.log(response)

          self.data = response.data.item
          document.title = self.data.domain
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
