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
      
      <v-subheader v-if="!fetching">
        <v-icon left>fas fa-globe</v-icon>

        {{ data.domain }}
                      
        <a v-bind:href="'http://' + data.domain" target="_blank">
          <v-icon right>open_in_new</v-icon>
        </a>
        
      </v-subheader>

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
  import Copy from '../components/Copy'

  export default {
    components: {
      Loading,
      Copy
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
        copyText: 'Copy',
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

<style>
.v-expansion-panel__header {
  padding: 10px 16px;
}
</style>