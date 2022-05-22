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
      
      <v-list v-if="!fetching">
        <v-list-item>
          <v-list-item-content>

            <v-container class="mx-0" style="max-width: 100%;">
              <v-row>
                <v-col>
                  <v-list-item class="px-0">
                    <v-list-item-icon>
                      <v-icon v-if="data.app === 'wordpress'">fab fa-wordpress</v-icon>
                      <v-icon v-else-if="data.app === 'git'">fab fa-git</v-icon>
                      <v-icon v-else-if="data.app === 'node'">fab fa-node-js</v-icon>
                      <v-icon v-else-if="data.app === 'joomla'">fab fa-joomla</v-icon>
                      <v-icon v-else-if="data.app === 'drupal'">fab fa-drupal</v-icon>
                      <v-icon v-else-if="data.app === 'magento'">fab fa-magento</v-icon>
                      <v-icon v-else-if="data.app === 'roundcube'">fas fa-envelope</v-icon>
                      <v-icon v-else-if="data.app === 'shiftlib'">fas fa-user-edit</v-icon>
                      <v-icon v-else>fas fa-sitemap</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="py-0">
                      <v-list-item-title>
                        {{ data.domain }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <router-link :to="'/servers/' + data.server.id + '/summary'">
                          {{data.server.name}}
                        </router-link>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
                <v-col align="right">
                  <v-btn
                    v-bind:href="'http://' + data.domain" 
                    target="_blank" 
                    title="Open site in new window"
                    class="mr-3"
                  >
                    <v-icon>open_in_new</v-icon>
                  </v-btn>
                  
                  <v-btn
                    color="success"
                    v-bind:href="data.shiftedit_url"
                    target="_blank"
                    title="Open in ShiftEdit IDE"
                  >
                    <v-icon>code</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>

          </v-list-item-content>
        </v-list-item>
      </v-list>      

      <v-tabs
        show-arrows
      >
        <v-tab :to="'/sites/' + domainId + '/summary'">Summary</v-tab>
        <v-tab :to="'/sites/' + domainId + '/database'">Database</v-tab>
        <v-tab :to="'/sites/' + domainId + '/variables'">Variables</v-tab>
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