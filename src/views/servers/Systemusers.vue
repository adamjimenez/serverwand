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
    <v-list>
      <v-list-item-group>
        <template v-for="(item, i) in data.users">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
            @click="editItem(item)"
          >
            <template v-slot:default>
              <v-list-item-content>
                <v-list-item-title>
                  {{item.name}}
                  <v-icon x-small right v-if="item.sudo">fas fa-crown</v-icon>
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                  icon
                  :disabled="loading"
                  :loading="loading"
                  @click="openKeys(item)"
                  @click.stop
                  title="Authorized keys"
                >
                  <v-icon small>vpn_key</v-icon>
                </v-btn>
              </v-list-item-action>

              <v-list-item-action>
                <v-btn
                  icon
                  :disabled="loading"
                  :loading="loading"
                  @click="deleteItem(item.name)"
                  @click.stop
                >
                  <v-icon small>delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>
  </v-card>

      <v-card>
          <div>
            <v-card-title primary-title>
              <v-btn
                @click="addItem()"
              >
                Add system user
              </v-btn>
            </v-card-title>
          </div>
      </v-card>

      <v-navigation-drawer
        app
        v-model="userDrawer"
        temporary
        right
      >
        <v-card>
            <v-card-title>
              System user
            </v-card-title>

            <v-card-text>
              <v-text-field
                v-model="system_user.name"
                label="User"
                required
              ></v-text-field>
              
              <v-text-field              
                v-model="system_user.password"
                type="password"
                label="Password"
                required
                autocomplete="new-password"
              ></v-text-field>

              <v-switch
                v-model="system_user.sudo"
                label="sudo"
              ></v-switch>

              <v-switch
                :disabled="!system_user.sudo"
                v-model="system_user.sudo_without_password"
                label="sudo without password"
              ></v-switch>
              
              <v-btn
                :disabled="fetching"
                :loading="loading"
                color="success"
                @click="saveUser"
              >
                Save
              </v-btn>
            </v-card-text>
        </v-card>
      </v-navigation-drawer>

      <v-navigation-drawer
        app
        v-model="keyDrawer"
        temporary
        right
      >
        <v-card>
            <v-card-title>
              Add key for {{user.name}}
            </v-card-title>

            <v-card-text>
                
              <v-text-field
                v-model="key"
                label="key"
              ></v-text-field>
              
              <v-btn
                :disabled="fetching"
                :loading="loading"
                color="success"
                @click="saveKey"
              >
                Save
              </v-btn>
            </v-card-text>
        </v-card>
      </v-navigation-drawer>

      <v-dialog
        v-model="showKeys"
      >
        <v-card
          :loading="fetching"
        >
            <v-card-title>
                Keys for {{user.name}}
            </v-card-title>

            <v-card-text>

              <div>
                Public SSH key
              </div>

              <v-list>
                <v-list-item-group>
                  <v-list-item>
                      <v-list-item-content>
                        <v-list-item-subtitle>
                          {{user.key}}
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action>
                        <v-btn
                          icon
                          :disabled="fetching"
                          :loading="fetching"
                        >
                          <Copy :val="user.key" />
                        </v-btn>
                      </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
              
              <div>
                Authorized keys
              </div>

              <v-list v-if="!fetching">
                <v-list-item-group>
                  <template v-for="(item, i) in keys">

                    <v-list-item
                      :key="`item-${i}`"
                      :value="item"
                    >
                      <template v-slot:default>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{item.name}}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{item.key}}
                          </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-btn
                            icon
                            :disabled="fetching"
                            :loading="fetching"
                            @click="deleteKey(item.line)"
                            @click.stop
                          >
                            <v-icon small>delete</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>

          </v-card-text>

          <v-card-text v-if="!keys.length">
            No keys
          </v-card-text>

        </v-card>

        <v-card>
            <div>
              <v-card-title primary-title>
                <v-btn
                  @click="addKey()"
                >
                  Add Key
                </v-btn>
              </v-card-title>
            </div>
        </v-card>


      </v-dialog>

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
        error: '',
        data: {
          users: {}
        },
        system_user: {
          user: '',
          password: '',
          key: '',
          sudo: false,
          sudo_without_password: false
        },
        details: '',
        loading: false,
        fetching: false,
        userDrawer: false,
        keyDrawer: false,
        serverId: 0,
        user: '',
        showKeys: false,
        keys: [],
        key: ''
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      this.serverId = this.$route.params.id
      this.fetchData()
    },
    methods: {
      fetchData () {        
        var self = this
        this.error = ''
        this.fetching = true
 
        api.get('servers/' + this.serverId + '/systemusers')
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error
            return false
          }
            
          self.data = response.data.item
          document.title = 'System users' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addItem() {
        this.system_user.name = ''
        this.system_user.password = ''
        this.system_user.key = ''
        this.system_user.sudo = false
        this.userDrawer = true
      },
      editItem(user) {
        this.system_user = user
        this.userDrawer = true
      },
      deleteItem(user) {
        this.$confirm('Delete ' + user + '?').then(res => {
          if (res) {
            var self = this
            this.fetching = true
            this.error = ''

            api.post('servers/' + this.serverId + '/systemusers', {user: user})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.error = response.data.error;
                self.fetching = false
              } else {
                self.fetchData()
              }
            })
            .catch(function (error) {
              console.log(error)
              self.fetching = false
            })
          }
        })

        return false
      },
      saveUser () {
        var self = this

        if (this.system_user.name) {
          this.details = ''
          this.fetching = true
          this.error = ''

          api.post('servers/' + this.serverId + '/systemusers', this.system_user)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error;
              self.fetching = false
            } else {
              self.userDrawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)
            self.fetching = false
          })
        }
      },
      openKeys (user) {
        var self = this
        this.user = user
        this.showKeys = true
        this.fetching = true

        api.get('servers/' + this.serverId + '/systemusers/' + this.user.name)
        .then(function (response) {
          console.log(response)
          self.keys = response.data.keys
          self.fetching = false
        })
        .catch(function (error) {
          console.log(error)
          self.fetching = false
        })
      },
      deleteKey(line) {
        this.$confirm('Delete key?').then(res => {
          if (res) {
            var self = this
            this.fetching = true
            this.error = ''

            api.post('servers/' + this.serverId + '/systemusers/' + this.user.name, {line: line})
            .then(function (response) {
              console.log(response)
              
              if (!response.data.success) {
                self.fetching = false
                self.error = response.data.error;
              } else {
                self.openKeys (self.user)
              }
            })
            .catch(function (error) {
              self.fetching = false
              console.log(error)
            })
          }
        })
      },
      addKey() {        
        this.showKeys = false
        this.keyDrawer = true
      },
      saveKey() {
        var self = this
        this.fetching = true
        this.error = ''

        api.post('servers/' + this.serverId + '/systemusers/' + this.user.name, {key: self.key})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.fetching = false
            self.error = response.data.error;
          } else {
            self.keyDrawer = true
            self.openKeys (self.user)
          }
        })
        .catch(function (error) {
          self.fetching = false
          console.log(error)
        })
      }
    }
  }
</script>
