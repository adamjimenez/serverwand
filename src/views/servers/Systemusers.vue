<template>
    <div>
        <Loading :value="fetching" />

        <template v-for="(item, index) in data.users">
        <v-card 
            :key="index"
        >
            <v-card-title primary-title>
                {{item.name}}
                
                <div>
                    <v-btn
                    @click="editUser(item.name)"
                    >
                    Edit
                    </v-btn>
                </div>
                <div>
                    <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteUser(item.name)"
                    >
                    Delete
                    </v-btn>
                </div>
            </v-card-title>
        </v-card>
        </template>

        <v-card>
            <div>
              <v-card-title primary-title>
                <v-btn
                @click="addUser()"
                >
                Add system user
                </v-btn>
              </v-card-title>
            </div>
        </v-card>

        <v-navigation-drawer
            v-model="userDrawer"
            absolute
            temporary
            right
        >
            <v-card>
                <v-card-title>
                System user
                </v-card-title>

                <v-card-text>
                <v-text-field
                    v-model="system_user.user"
                    label="User"
                    required
                ></v-text-field>
                
                <v-text-field              
                    v-model="system_user.password"
                    type="password"
                    label="Password"
                    required
                    browser-autocomplete="new-password"
                ></v-text-field>
                
                <v-btn
                    :disabled="dialog"
                    :loading="dialog"
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
        loading: false,
        error: '',
        data: {
          users: {}
        },
        system_user: {
          user: '',
          password: ''
        },
        dialog: false,
        details: '',
        fetching: true,
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
 
        api.server(this.serverId)
        .then(function (response) {
          console.log(response)

          if (response.data.error) {
            self.error = response.data.error

            if (response.data.expired) {
              location.href = 'https://serverwand.com/pricing'
            }

            return false
          }
            
          self.data = response.data.items[0]
          self.data.disk_perc = Math.round((1- (self.data.disk_free / self.data.disk_space)) * 100)
          self.data.mem_perc = Math.round((1- (self.data.mem_free / self.data.mem_total)) * 100)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
      },
      addUser() {
        this.userDrawer = true
      },
      editUser(user) {
        this.system_user.user = user
        this.userDrawer = true
      },
      deleteUser(user) {
        var self = this
        this.dialog = true
        this.error = ''

        api.deleteSystemUser(this.serverId, {user: user})
        .then(function (response) {
          console.log(response)
          
          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
        })
      },
      saveUser () {
        var self = this

        if (this.system_user.user && this.system_user.password) {
          this.details = ''
          this.dialog = true
          this.error = ''

          api.saveSystemUser(this.serverId, this.system_user)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.userDrawer = false
              self.fetchData()
            }
          })
          .catch(function (error) {
            console.log(error)              
            self.dialog = false
          })
          .finally(function() {
            self.dialog = false
          })
        }
      }
    }
  }
</script>
