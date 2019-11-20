<template>
  <v-layout row>
    <v-flex>
      <v-alert
        :value="error.length>0"
        type="error"
      >
      {{error}}
      </v-alert> 

      <Loading :value="loading" />

      <v-card>
        
        <v-card-title primary-title>
          <div class="headline">Dashboard</div>
        </v-card-title>

        <v-layout row class="mx-1">
          <v-flex xs6>
            <v-card>

              <v-card-title>
                Servers
              </v-card-title>

              <v-list two-line v-if="servers.length" class="results">
                <template v-for="(item) in servers">
                  <v-list-item
                    :key="item.name"
                  >
                    <v-list-item-avatar>
                      <v-icon>fas fa-server</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <router-link :to="'/servers/' + item.id + '/summary'"> 
                        <v-list-item-title>{{item.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{item.hostname}}</v-list-item-subtitle>
                      </router-link>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>

              <v-list v-else>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <router-link to="/servers/create">
                          Add a server
                      </router-link>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>

            </v-card>
          </v-flex>

          <v-flex xs6>
            <v-card>

              <v-card-title>
                Domains
              </v-card-title>

              <v-list two-line v-if="domains.length" class="results">
                <template v-for="(item, index) in domains">
                  <v-divider
                    v-if="item.divider"
                    :inset="item.inset"
                    :key="index"
                  ></v-divider>

                  <v-list-item
                    v-else
                    :key="item.name"
                  >
                    <v-list-item-avatar>
                      <v-icon>fas fa-globe</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <router-link :to="'/domains/' + item.id + '/summary'"> 
                        <v-list-item-title v-html="item.domain"></v-list-item-title>
                        <v-list-item-subtitle>{{serverOptions[item.server]}}</v-list-item-subtitle>
                      </router-link>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>

              <v-list v-else>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <router-link to="/domains/create">
                          Add a domain
                      </router-link>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>


            </v-card>
          </v-flex>
        </v-layout>

      </v-card>

    </v-flex>
  </v-layout>
</template>

<script>
  import api from '../services/api';
  import Loading from '../components/Loading'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        loading: true,
        post: null,
        error: '',
        servers: [],
        domains: [],
        serverOptions: {}
      }
    },
    created () {
      document.title = 'ServerWand'
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
        this.loading = true
 
        api.summary()
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            if (response.data.expired) {
              location.href = 'https://serverwand.com/pricing'
            }

            return false
          }

          self.domains = response.data.domains

          api.get('servers/')
          .then(function (response) {
              self.servers = response.data.items

              response.data.items.forEach(element => {
                  self.$set(self.serverOptions, element.id, element.name)
              })
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })
      }
    }
  }
</script>

<style>
.results a {
  color: inherit;
}
</style>