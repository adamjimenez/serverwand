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
      <v-layout row v-if="data.app">
          <v-card tile flat>
            <v-card-text>
                <div v-if="data.app.name">
                  <h2>{{ data.app.name }}</h2>
                  <p>{{ data.app.version }}</p>

                  <div v-if="data.app.name=='git'">
                    <v-layout row>
                      <v-flex xs6>
                        <v-text-field
                          v-model="data.app.ssh_key"
                          label="SSH key"
                          readonly
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <Copy :val="data.app.ssh_key" />
                      </v-flex>
                    </v-layout>
                  </div>

                  <div v-if="data.app.name=='git'">
                    <v-layout row>
                      <v-flex xs6>
                        <v-text-field
                          v-model="data.app.webhook_url"
                          label="web hook url"
                          readonly
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6>
                        <Copy :val="data.app.webhook_url" />
                      </v-flex>
                    </v-layout>
                  </div>
                </div>
                <div v-else>
                  <v-subheader>
                    Directory contains files
                  </v-subheader>
                </div>

                <v-btn
                  @click="download()"
                >
                  Download site
                </v-btn>
            </v-card-text>
          </v-card>
      </v-layout>

      <div v-else>

          <v-layout row>
            <v-flex xs6>
              <v-card tile flat>
                <v-card-text>Git:</v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs6>
              <v-card tile flat>
              <v-card-text>
                  <v-btn
                      :disabled="loading"
                      :loading="loading"
                      @click="install('git')"
                      >
                      Install Git Repo
                  </v-btn>
              </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

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

    <v-navigation-drawer
      v-model="drawer"
      temporary
      right
      app
    >
      <v-card>
          <v-card-title>
            Git
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="data.git_url"
              label="Git URL"
              required
            ></v-text-field>
                        
            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="submitGit()"
            >
              Save
            </v-btn>
          </v-card-text>
      </v-card>
    </v-navigation-drawer>

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
        error: null,
        data: {},
        fetching: true,
        drawer: false
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
        if (app === 'git') {
          this.drawer = true
          return
        }

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
      },
      submitGit () {
        var self = this

        if (this.data.git_url) {
          this.fetching = true
          this.error = ''

          api.post('domains/' + this.domainId + '/install', {git_url: this.data.git_url})
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error
            } else {
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
          })
          .finally(function() {
            self.fetching = false
          })
        }
      },
      download() {
        var self = this
        this.fetching = true
        
        api.get('domains/' + this.domainId + '/download')
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error
          } else {
            window.open(response.data.download_url)
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
.v-expansion-panel__header {
  padding: 10px 16px;
}
</style>