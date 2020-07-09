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
                
                <v-text-field
                  v-if="system_user.key"
                  v-model="system_user.key"
                  label="SSH key"
                  readonly
                ></v-text-field>

                <v-switch
                    v-model="system_user.sudo"
                    label="sudo"
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
    </div>
</template>

<script>
  import api from '../../services/api'
  import Loading from '../../components/Loading'

  export default {
    components: {
      Loading
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
          sudo: false
        },
        details: '',
        loading: false,
        fetching: false,
        userDrawer: false,
        serverId: 0
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
      }
    }
  }
</script>
