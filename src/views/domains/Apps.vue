<template>
  <div>
    <v-alert
    :value="error.length>0"
    type="error"
    >
    {{error}}
    </v-alert>

    <Loading :value="loading" />
  
    <v-card
      class="pa-3"
      :loading="fetching"
    >
      <v-layout v-if="data.app">
          <div v-if="data.app.name" style="flex: 1">
            <v-list-item-content class="ma-3">
              <v-list-item-title>
                <h2>{{ data.app.name }}</h2>
                <p>{{ data.app.version }}</p>
              </v-list-item-title>
            </v-list-item-content>

            <div v-if="data.app.name=='git'">
              <v-container class="ma-0">
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="data.app.ssh_key"
                      label="SSH key"
                      readonly
                    ></v-text-field>
                  </v-col>

                  <v-col>
                    <Copy :val="data.app.ssh_key" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>                      
                    <v-text-field
                      v-model="data.app.webhook_url"
                      label="web hook url"
                      readonly
                    ></v-text-field>
                  </v-col>

                  <v-col>
                    <Copy :val="data.app.webhook_url" />
                  </v-col>
                </v-row>
                
              </v-container>
            </div>
          </div>
          <div v-else>
            <v-subheader>
              Directory contains files
            </v-subheader>
          </div>
      </v-layout>

      <div v-else>

<template>
  <v-card
    class="mx-auto"
  >
    <v-list>
      <v-list-item-group>

        <template v-for="(item, i) in apps">
          <v-list-item
            :key="`item-${i}`"
            :value="item"
            @click="install(item.name)"
          >
              <v-list-item-content>
                <v-list-item-title>
                  {{item.label}}
                </v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </template>

      </v-list-item-group>
    </v-list>
  </v-card>
</template>

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
        domainId: null,
        error: null,
        data: {},
        loading: false,
        fetching: false,
        drawer: false,
        apps: [{
          name: 'git',
          label: 'Git repo'
        }, {
          name: 'wordpress',
          label: 'Wordpress'
        }, {
          name: 'joomla',
          label: 'Joomla'
        }, {
          name: 'drupal',
          label: 'Drupal'
        }, {
          name: 'magento',
          label: 'Magento'
        }, {
          name: 'Roundcubemail',
          label: 'Roundcube mail'
        }]
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

        this.$confirm('Install ' + app + '?').then(res => {
          if (res) {
            var self = this
            this.error = ''
            this.fetching = true
            this.loading = true

            api.post('domains/' + this.$route.params.id + '/apps', {app: app})
            .then(function (response) {
              console.log(response)
              
              if (response.data.error) {
                self.error = response.data.error
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              console.log(error)
            })
            .finally(function() {
              self.fetching = false
              self.loading = false
            })
          }
        })
      },
      submitGit () {
        var self = this

        if (this.data.git_url) {
          this.fetching = true
          this.error = ''

          api.post('domains/' + this.domainId + '/apps', {git_url: this.data.git_url})
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
      }
    }
  }
</script>

<style>
.v-expansion-panel__header {
  padding: 10px 16px;
}
</style>