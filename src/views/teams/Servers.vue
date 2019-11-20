<template>
  <div>
    <Loading :value="fetching" />

<template>
  <v-card
    class="mx-auto"
  >
    <v-list>
      <v-list-item-group>
        <template v-for="(item, i) in data.servers">

          <v-list-item
            :key="`item-${i}`"
            :value="item"
          >
            <template v-slot:default="{ active, toggle }">
              <v-list-item-content>
                <v-list-item-title>
                  {{item.name}}
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn
                :disabled="fetching"
                :loading="fetching"
                @click="deleteItem(item.id)"
                >
                  Delete
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn
          @click="addItem()"
          >
            Add server
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer
        app
        v-model="drawer"
        temporary
        right
    >
      <v-card>
        <v-card-title>
          Server
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="data.server"
            :items="servers"
            label="Server"
          ></v-select>   
          
          <v-btn
            :disabled="dialog"
            :loading="dialog"
            color="success"
            @click="saveItem"
          >
            Save
          </v-btn>          
          
          <p v-if="useMasterPassword" style="font-size: 12px; margin-top: 20px;">
            Note: Server keys shared with other users will not be encrypted with your master password  
          </p>
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
        loading: '',
        id: null,
        error: null,
        data: {
        },
        servers: [],
        dialog: false,
        details: '',
        fetching: true,
        rules: {
          required: value => !!value || 'Required.',
          min: v => v.length >= 8 || 'Min 8 characters',
        },
        server: {
          name: ''
        },
        drawer: false,
        useMasterPassword: false
      }
    },
    created () {
        // fetch the data when the view is created and the data is
        // already being observed      
        this.id = this.$route.params.id
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
 
        api.get('teams/' + this.id)
        .then(function (response) {
          console.log(response)            
          self.data = response.data.item
          document.title = 'Servers' + ' | ' + self.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.fetching = false
        })
 
        api.servers()
        .then(function (response) {
          console.log(response)
            
          response.data.items.forEach(element => {
              self.servers.push({
                  text: element.name,
                  value: element.id
              });
          })
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.loading = false
        })

        api.profile()
        .then(function (response) {
          self.useMasterPassword = response.data.profile.prefs.useMasterPassword
        })
      },
      addItem () {
        this.server.name = ''
        this.drawer = true
      },
      saveItem () {
        var self = this

        if (this.data.server) {
          this.details = ''
          this.dialog = true
          this.error = ''

          api.post('teams/' + this.id + '/servers', this.data)
          .then(function (response) {
            console.log(response)
            
            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.drawer = false
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
      },
      deleteItem (id) { 
        var self = this
        this.error = ''
        this.dialog = true
        this.loading = 'delete'

        api.post('teams/' + this.id + '/servers', {delete: 1, server: id})
        .then(function (response) {
          console.log(response)
          
          if (response.data.error) {
            self.error = response.data.error
          } else {
            self.fetchData()
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function() {
          self.dialog = false
          self.loading = ''
        })
      }
    }
  }
</script>