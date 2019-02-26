<template>
  <div class="page-container">
    <v-app :dark="dark">
      <v-navigation-drawer 
        app
        v-model="drawer"
      >
      <v-layout column fill-height>
        <v-toolbar flat>
          <v-list>
            <v-list-tile>
              <v-list-tile-title class="title">
                <router-link to="/dashboard"> 
                  <v-icon 
                    left
                    color="primary"
                  >fas fa-magic</v-icon>
                  <strong>SERVERWAND</strong>
                </router-link>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-toolbar>

        <v-list dense class="pt-0">
          <v-list-tile
            v-for="item in items"
            :key="item.title"
            :to="item.to"
          >
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-spacer></v-spacer>
        <v-list>
          <v-layout row justify-center>
            <v-flex xs2>
              <p class="text-xs-right" style="margin-top: 18px;">
                Light
              </p>
            </v-flex>
            <v-flex xs3>
              <v-card flat>
                <v-card-text>
                  <p class="text-xs-center">
                    <v-switch
                      v-model="dark"
                    ></v-switch>
                  </p>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs2>
              <p class="text-xs-left" style="margin-top: 18px;">
                Dark
              </p>
            </v-flex>
          </v-layout>
        </v-list>
      </v-layout>
      
      </v-navigation-drawer>
      <v-toolbar app flat>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <CreateMenu />
        <Search />
        <UserMenu />
      </v-toolbar>
      <v-content>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-content>
      <v-footer app></v-footer>
    </v-app>

    <v-dialog v-model="masterPasswordDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Master password required</span>
        </v-card-title>
        <v-card-text>
          
          <v-text-field
              v-model="masterPassword"
              type="password"
              label="Master password"
              required
              browser-autocomplete="new-password"
          ></v-text-field>
        
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="masterPasswordDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="submitMasterPassword()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resetKeyDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Reset key</span>
        </v-card-title>
        <v-card-text>
          
          <v-text-field
            v-model="data.user"
            label="Username"
            required
          ></v-text-field>

          <v-text-field
            type="password"
            v-model="data.pass"
            label="Password"
            required
          ></v-text-field>
        
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="resetKeyDialog = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="submitResetKey()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import Search from './components/Search'
  import CreateMenu from './components/CreateMenu'
  import UserMenu from './components/UserMenu'
  import api from './services/api'
  import axios from 'axios'
  import { sha256, sha224 } from 'js-sha256'

  export default {
    components: {
      Search,
      CreateMenu,
      UserMenu
    },
    data () {
      return {
        serverId: 0,
        data: {},
        dark: false,
        drawer: null,
        items: [
          { title: 'Dashboard', to: '/dashboard' },
          { title: 'Servers', to: '/servers' },
          { title: 'Domains', to: '/domains' },
          { title: 'Teams', to: '/teams' },
        ],
        resetKeyDialog: false,
        masterPasswordDialog: false,
        masterPassword: '',
      }
    },
    created () {
      var self = this

      axios.interceptors.response.use(function (response) {
        if (!response) {
          return false
        }

        if (response.data.error == 'master password') {
          // show password prompt
          self.masterPasswordDialog = true
        } else if (response.data.error == 'missing key') {
          // show password prompt
          self.resetKeyDialog = true
          self.serverId = response.data.server
          return response;
        } else {
          return response;
        }

      }, function (error) {
        const originalRequest = error.config;

        if (!error.response || error.response.status === 401 && !originalRequest._retry) {
          //location.href = 'https://serverwand.com/login'
          return false
        }
      
        return Promise.reject(error);
      })
    },
    mounted() {
      if (localStorage.dark) {
        this.dark = true
      }
    },
    watch: {
      dark(newDark) {
        if (newDark) {
          localStorage.dark = 1
        } else {
          delete localStorage.dark
        }
      }
    },
    methods: {
      submitMasterPassword() {
        var self = this

        api.post('auth/masterpassword', {
          masterPassword: sha256(self.masterPassword)
        })
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
              self.$router.go()
          } else {
              self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function (error) {
          self.dialog = false
          self.loading = false
        })
      },
      resetKey() {
        var self = this

        api.post('servers/' + self.serverId + '/resetkey', {
          username: self.data.user,
          password: self.data.pass
        })
        .then(function (response) {
          console.log(response)
          if (response.data.success) {
              self.$router.go()
          } else {
              self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function (error) {
          self.resetKeyDialog = false
          self.loading = false
        })
      }
    }
  }
</script>

<style>
a {text-decoration: none;}

.v-navigation-drawer .v-list__tile--link {
  border-left-width: 5px;
  border-left-style: solid;
  border-left-color: transparent;
}

.v-navigation-drawer .v-list__tile--active {
  border-left-style: solid;
  border-left-width: 5px;
  border-left-color: inherit;
}

.v-navigation-drawer .v-input--switch {
  margin: 0;
  padding: 0;
}

.v-navigation-drawer .v-input--selection-controls .v-input__control {
  margin-left: 3px;
}
</style>