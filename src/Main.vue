<template>
  <div class="page-container">
    <v-app>
      <v-navigation-drawer 
        app
        v-model="drawer"
      >
        <v-toolbar flat>
          <v-list>
            <v-list-tile>
              <v-list-tile-title class="title">
                <router-link to="/dashboard">              
                <i class="fas fa-magic"></i>
                ServerWand
                </router-link>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-toolbar>

        <v-divider></v-divider>

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
      </v-navigation-drawer>
      <v-toolbar app>
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
        drawer: null,
        items: [
          { title: 'Dashboard', to: '/dashboard' },
          { title: 'Servers', to: '/servers' },
          { title: 'Domains', to: '/domains' },
          //{ title: 'Mail', to: '/mail' },
        ]
      }
    }
  }
</script>

<style>
a {text-decoration: none;}
</style>