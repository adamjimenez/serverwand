<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
    >
      {{error}}
    </v-alert>

    <Loading :value="loading" />
  
    <v-card
      class="pa-3"
      :loading="fetching"
    >
      <v-layout v-if="data.origin" 
        row
      >

        <v-card>
          <v-card-text>
            
            <v-btn @click="openSync(data.origin)">
              Push
            </v-btn>

            <v-btn @click="openSync(siteId)">
              Pull
            </v-btn>

          </v-card-text>
        </v-card>

      </v-layout>

      <v-layout v-else-if="data.app" 
        row
      >

        <div v-if="data.app.name" style="flex: 1">

          <v-card>
            <v-card-title>
              {{ data.app.name }}
            </v-card-title>
            <v-card-subtitle>
              {{ data.app.version }}
            </v-card-subtitle>

            <v-card-text v-if="data.app.isNode">              
              <v-switch
                v-model="data.app.online"
                :label="data.app.status"
                @change="toggleStatus()"
              ></v-switch>

              <v-textarea
                label="Ouput log"
                readonly
                :value="data.app.output_log"
              ></v-textarea>

              <v-textarea
                label="Error log"
                readonly
                :value="data.app.error_log"
              ></v-textarea>
            </v-card-text>
          </v-card>

          <v-container class="ma-0">
            <v-row>
              <v-col>
                <v-btn @click="clearLogs" title="Clear logs" v-if="data.app.isNode">
                  <v-icon>block</v-icon>
                </v-btn>

                <v-btn @click="gitInfo = true" title="Git info" v-if="data.app.git_url">
                  <v-icon>fab fa-git</v-icon>
                </v-btn>

                <v-btn @click="showCloneApp = true" title="Clone app">
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            
          </v-container>

        </div>

        <div v-else>
            <v-flex>
                <v-card tile flat>
                    <v-card-text>
                      Unrecognised application
                    </v-card-text>
                </v-card>
            </v-flex>
        </div>

      </v-layout>

      <div v-else>

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
                  <v-list-item-icon>
                    <i :class="item.icon"></i>                    
                  </v-list-item-icon>
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

    <v-dialog
      v-model="showCloneApp"
    >
      <v-card>
        <v-card-title>
          Clone App
        </v-card-title>

        <v-card-text>

          <v-text-field
            v-model="data.stagingDomain"
            :rules="domainRules"
            label="Staging Domain"
            required
          ></v-text-field>

          <v-select
            v-model="data.server"
            :items="server_opts"
            label="Server"
            required
          ></v-select>

          <v-checkbox
            v-model="dns"
            label="Configure DNS"
            :disabled="dnsProviders[data.server]==''"
          ></v-checkbox>

          <v-btn
            color="primary"
            @click="cloneApp"
          >
            Save
          </v-btn>

        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="syncDialog"
    >

      <v-card>
        <v-card-title v-if="target === siteId">
          Copy from live to staging
        </v-card-title>
        <v-card-title v-else>
          Copy from staging to live
        </v-card-title>

        <v-card-text>

          <v-checkbox
            v-model="files"
            label="Files"
          ></v-checkbox>

          <v-checkbox
            v-model="database"
            label="Database"
          ></v-checkbox>

          <div v-if="database">
            <v-radio-group row v-model="fullDb" 
              class="mx-3" 
            >
              <v-radio
                label="Full DB"
                value="1"
              ></v-radio>
              <v-radio
                label="Selected tables"
                value="0"
              ></v-radio>
            </v-radio-group>

            <v-card v-if="fullDb=='0'">
              <v-card-text>

                <v-row>
                  <v-checkbox class="mx-2" label="Select all" @click="selectAll" v-model="allSelected"></v-checkbox>
                </v-row>

                <div>
                  <v-row>
                    <v-checkbox class="mx-2" v-model="tableNames" v-for="table in tables" :key="table" :value="table" :label="table"></v-checkbox>
                  </v-row>
                </div>

              </v-card-text>
            </v-card>

          </div>

          <v-btn
            color="primary"
            @click="sync"
            :disabled="!files && !database || (fullDb <= 0 && tableNames.length === 0)"
            class="my-3" 
          >
            Continue
          </v-btn>

        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      app
      v-model="gitInfo"
    >
      <v-card
        :loading="fetching"
      >
          <v-card-title>
            Git info
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col>
                <v-btn
                  @click="gitPull"
                >
                  Pull
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="data.app.git_url"
                  label="Git URL"
                  readonly
                ></v-text-field>
              </v-col>

              <v-col>
                <Copy :val="data.app.git_url" />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="data.app.ssh_key"
                  label="SSH key: save to your git host in order to push to this repository"
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
                  label="Git Pull Webhook: use this webhook to initiiate a Git Pull"
                  readonly
                ></v-text-field>
              </v-col>

              <v-col>
                <Copy :val="data.app.webhook_url" />
              </v-col>
            </v-row>
          </v-card-text>
      </v-card>
    </v-dialog>

    <Site ref="Site" />

  </div>
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'
  import Site from '../../components/Site'

  export default {
    components: {
      Loading,
      Copy,
      Site
    },
    data: () => ({
      siteId: null,
      error: null,
      files: false,
      database: false,
      fullDb: '1',
      tableNames: [],
      tables: [],
      data: {
        server: '',
        origin: '',
        app: {}
      },
      dns: true,
      dnsProviders: {},
      domainRules: [
        v => !!v || 'Domain is required'
      ],
      loading: false,
      fetching: false,
      drawer: false,
      cloneDialog: false,
      syncDialog: false,
      target: 0,
      apps: [{
        name: 'git',
        label: 'Git repository',
        icon: 'fab fa-git',
      }, {
        name: 'wordpress',
        label: 'Wordpress',
        icon: 'fab fa-wordpress',
      }, {
        name: 'joomla',
        label: 'Joomla',
        icon: 'fab fa-joomla',
      }, {
        name: 'drupal',
        label: 'Drupal',
        icon: 'fab fa-drupal',
      }, {
        name: 'magento',
        label: 'Magento',
        icon: 'fab fa-magento',
      }, {
        name: 'Roundcube',
        label: 'Roundcube webmail',
        icon: 'fas fa-envelope',
      }],
      server_opts: [],
      selected: [],
      allSelected: false,
      authRequired: false,
      newWindow: false,
      gitInfo: false,
      showCloneApp: false
    }),
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
        this.siteId = this.$route.params.id
 
        api.get('sites/' + this.siteId + '/apps')
        .then(function (response) {
          console.log(response)
            
          self.data = response.data.item
          document.title = 'Apps' + ' | ' + self.data.domain

          self.data.stagingDomain = 'staging.' + self.data.domain

          api.get('servers/')
          .then(function (response) {
            response.data.items.forEach(element => {
                self.server_opts.push({
                    text: element.name,
                    value: element.id
                })
            })
          })
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

            api.post('sites/' + this.$route.params.id + '/apps', {app: app})
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
      clearLogs () {
        var self = this

        this.fetching = true
        this.error = ''

        api.post('sites/' + this.siteId + '/apps', {flush: true})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error
            self.fetching = false
          } else {
            self.drawer = false
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
        })
        .finally(function() {
        })
      },
      submitGit () {
        var self = this

        if (this.data.git_url) {
          this.fetching = true
          this.error = ''

          api.post('sites/' + this.siteId + '/apps', {git_url: this.data.git_url})
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error
              self.fetching = false
            } else {
              self.drawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
          .finally(function() {
          })
        }
      },
      cloneApp () {
        var data = {
          server: this.data.server,
          domain: this.data.stagingDomain,
          origin: this.siteId,
          //needle: this.data.domain,
          dns: this.dns
        }

        this.$refs.Site.create(data)
      },
      openSync (target) {
        var self = this
        this.target = target
        this.syncDialog = true

        api.get('sites/' + target + '/database/tables')
        .then(function (response) {
          console.log(response)
          self.tables = response.data.tables
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
        })

      },
      sync () {
        var self = this
        this.fetching = true

        var params = {
          'files': this.files,
          'database': this.database,
          'tables': this.tableNames
        }

        //console.log(params); 

        var cmd = (this.target === this.siteId) ? 'pull' : 'push'

        api.post('sites/' + this.siteId + '/apps/' + cmd, params)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.fetching = false
          self.syncDialog = false
        })
      },
      pull () {
        var self = this
        this.fetching = true

        api.get('sites/' + this.siteId + '/apps/pull')
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        }).finally(function () {
          self.fetching = false
        })
      },
      selectAll: function() {
          this.tableNames = [];

          if (this.allSelected) {
              for (var table in this.tables) {
                this.tableNames.push(this.tables[table].toString());
              }
          }
      },
      select: function() {
          this.allSelected = false;
      },
      toggleStatus () {
        var self = this
        this.error = ''
        this.loading = true

        api.post('sites/' + this.siteId  + '/apps/', {status: this.data.app.online})
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
            self.fetching = false
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
        })
        .finally(function() {
          self.loading = false
        })
      },
      gitPull () {
        var self = this
        this.fetching = true

        api.get('sites/' + this.siteId + '/git/pull')
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        }).finally(function () {
          self.fetching = false
        })
      },
    }
  }
</script>