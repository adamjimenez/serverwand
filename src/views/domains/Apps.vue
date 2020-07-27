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
      <v-layout v-if="data.origin" 
        row
      >

        <v-card>
          <v-card-text>
            
            <v-btn
              @click="openSync(data.origin)"
            >
              Push
            </v-btn>

            <v-btn
              @click="openSync(domainId)"
            >
              Pull
            </v-btn>

          </v-card-text>
        </v-card>

      </v-layout>

      <v-layout v-else-if="data.app" 
        row
      >

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
              <v-flex>
                  <v-card tile flat>
                      <v-card-text>
                        Unrecognised application
                      </v-card-text>
                  </v-card>
              </v-flex>
          </div>

          <v-flex xs12>

            <v-dialog>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                >
                  Clone App
                </v-btn>
              </template>

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

          </v-flex>
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
      v-model="syncDialog"
    >

      <v-card>
        <v-card-title v-if="target === domainId">
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

    <Domain ref="Domain" />

  </div>
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'
  import Copy from '../../components/Copy'
  import Domain from '../../components/Domain'

  export default {
    components: {
      Loading,
      Copy,
      Domain
    },
    data: () => ({
      domainId: null,
      error: null,
      files: false,
      database: false,
      fullDb: '1',
      tableNames: [],
      tables: [],
      data: {
        server: ''
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
      }],
      server_opts: [],
      selected: [],
      allSelected: false,
      authRequired: false,
      newWindow: false
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
        this.domainId = this.$route.params.id
 
        api.get('domains/' + this.domainId + '/apps')
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
      },
      cloneApp () {

        var data = {
          server: this.data.server,
          domain: this.data.stagingDomain,
          origin: this.domainId,
          needle: this.data.domain,
          dns: this.dns
        }

        this.$refs.Domain.create(data)

      },
      openSync (target) {
        var self = this
        this.target = target
        this.syncDialog = true

        api.get('domains/' + target + '/database/tables')
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

        var cmd = (this.target === this.domainId) ? 'pull' : 'push'

        api.post('domains/' + this.domainId + '/apps/' + cmd, params)
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

        api.get('domains/' + this.domainId + '/apps/pull')
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
      }
    }
  }
</script>