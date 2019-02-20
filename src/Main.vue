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
              <v-card flat>
                <v-card-text>Light</v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs2>
              <v-card flat>
                <v-card-text>
                  <v-switch
                    v-model="dark"
                  ></v-switch>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs2>
              <v-card flat>
                <v-card-text>Dark</v-card-text>
              </v-card>
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
  </div>
</template>

<script>
  import Search from './components/Search'
  import CreateMenu from './components/CreateMenu'
  import UserMenu from './components/UserMenu'

  export default {
    components: {
      Search,
      CreateMenu,
      UserMenu
    },
    data () {
      return {
        dark: false,
        drawer: null,
        items: [
          { title: 'Dashboard', to: '/dashboard' },
          { title: 'Servers', to: '/servers' },
          { title: 'Domains', to: '/domains' },
          { title: 'Teams', to: '/teams' },
        ]
      }
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
</style>