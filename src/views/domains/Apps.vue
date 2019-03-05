<template>
  <div>
    <v-alert
    :value="error.length>0"
    type="error"
    >
    {{error}}
    </v-alert>

    <Loading :value="fetching" />
  
    <v-card>
      <v-layout row v-if="data.app && data.app.name">
          <v-card tile flat>
          <v-card-text>
              {{ data.app.name }}
              {{ data.app.version }}
          </v-card-text>
          </v-card>
      </v-layout>

      <div v-else>
          <v-layout row>
            <v-flex xs6>
              <v-card tile flat>
              <v-card-text>Wordpress:</v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs6>
              <v-card tile flat>
              <v-card-text>
                  <v-btn
                      :disabled="loading"
                      :loading="loading"
                      @click="install('wordpress')"
                      >
                      Install Wordpress
                  </v-btn>
              </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>Joomla:</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>
                    <v-btn
                        :disabled="loading"
                        :loading="loading"
                        @click="install('joomla')"
                        >
                        Install Joomla
                    </v-btn>
                </v-card-text>
                </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>Drupal:</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>
                    <v-btn
                        :disabled="loading"
                        :loading="loading"
                        @click="install('drupal')"
                        >
                        Install Drupal
                    </v-btn>
                </v-card-text>
                </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>Magento:</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>
                    <v-btn
                        :disabled="loading"
                        :loading="loading"
                        @click="install('magento')"
                        >
                        Install Magento
                    </v-btn>
                </v-card-text>
                </v-card>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>Roundcubemail:</v-card-text>
                </v-card>
            </v-flex>
            <v-flex xs6>
                <v-card tile flat>
                <v-card-text>
                    <v-btn
                        :disabled="loading"
                        :loading="loading"
                        @click="install('roundcubemail')"
                        >
                        Install Roundcubemail
                    </v-btn>
                </v-card-text>
                </v-card>
            </v-flex>
          </v-layout>

      </div>
    </v-card>
  </div>
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'

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
          disk_usage: 0,
          server: {},
          app: {}
        },
        details: '',
        fetching: true,
        copyText: 'Copy'
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.fetchData()
    },
    watch: {
      // call again the method if the route changes
      '$route': 'fetchData'
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
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId + '/apps')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Apps' + ' | ' + self.data.domain
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      install (app) { 
        var self = this
        this.error = ''
        this.fetching = true
        this.loading = true

        api.get('domains/' + this.$route.params.id + '/install/' + app)
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
            self.fetching = false
            self.loading = false
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
          self.loading = false
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