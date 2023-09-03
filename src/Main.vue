<template>
  <div class="page-container">
    <v-app>
      <v-navigation-drawer v-model="drawer">
        <v-list nav>
          <v-list-item>
            <v-list-item-title>
              <router-link to="/servers">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon class="mr-3" size="large">fas fa-magic</v-icon>
                  </template>

                  <v-list-item-title>
                    <h1>SERVERWAND</h1>
                  </v-list-item-title>
                </v-list-item>
              </router-link>
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-for="item in filtered" :key="item.title" :to="item.to" :active="isActive(item.to)">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app flat>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" size="small"></v-app-bar-nav-icon>
        <CreateMenu v-if="!restricted" />
        <Search />
        <UserMenu />
      </v-app-bar>

      <v-main>
        <v-container fluid>
          <router-view :restricted="restricted"></router-view>
        </v-container>
      </v-main>

      <v-footer app></v-footer>
    </v-app>

    <v-dialog v-model="masterPasswordDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Master password required</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="masterPassword" type="password" label="Master password" required
            browser-autocomplete="new-password"></v-text-field>
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
          <v-text-field v-model="data.user" label="Username" required></v-text-field>
          <v-text-field type="password" v-model="data.pass" label="Password" required></v-text-field>
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
import Search from "./components/Search";
import CreateMenu from "./components/CreateMenu";
import UserMenu from "./components/UserMenu";
import api from "./services/api";
import axios from "axios";
import { sha256 } from "js-sha256";

export default {
  components: {
    Search,
    CreateMenu,
    UserMenu,
  },
  data() {
    return {
      serverId: 0,
      data: {},
      dark: false,
      drawer: null,
      items: [
        { title: "Servers", to: "/servers", restricted: true },
        { title: "Sites", to: "/sites", restricted: false },
        { title: "Domains", to: "/domains", restricted: false },
        { title: "Teams", to: "/teams", restricted: true },
        { title: "Users", to: "/users", restricted: true },
      ],
      filtered: [],
      resetKeyDialog: false,
      masterPasswordDialog: false,
      masterPassword: "",
      restricted: false,
    };
  },
  created() {
    var self = this;

    axios.interceptors.response.use(
      function (response) {
        if (!response) {
          return false;
        }

        if (response.data.error == "master password") {
          // show password prompt
          self.masterPasswordDialog = true;
        } else if (response.data.error == "missing key") {
          // show password prompt
          self.resetKeyDialog = true;
          self.serverId = response.data.server;
          return response;
        } else {
          return response;
        }
      },
      function (error) {
        const originalRequest = error.config;

        if (
          !error.response ||
          (error.response.status === 401 && !originalRequest._retry)
        ) {
          //location.href = 'https://serverwand.com/login'
          return false;
        }

        return Promise.reject(error);
      }
    );

    this.fetchData();
  },
  mounted() {
    if (parseInt(localStorage.dark) !== 0) {
      this.dark = true;
      this.$vuetify.theme.dark = true;
    }
  },
  watch: {
    dark(newDark) {
      if (newDark) {
        localStorage.dark = 1;
        this.$vuetify.theme.dark = true;
      } else {
        localStorage.dark = 0;
        this.$vuetify.theme.dark = false;
      }
    },
    data() {
      var self = this;
      this.restricted = self.data.user !== "0";

      this.filtered = this.items.filter(function (item) {
        return self.restricted ? !item.restricted : true;
      });
    },
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .get("settings/profile")
        .then(function (response) {
          console.log(response);
          self.data = response.data.profile;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },
    submitMasterPassword() {
      var self = this;

      api
        .post("auth/masterpassword", {
          masterPassword: sha256(self.masterPassword),
        })
        .then(function (response) {
          console.log(response);
          if (response.data.success) {
            self.$router.go();
          } else {
            self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.dialog = false;
          self.loading = false;
        });
    },
    resetKey() {
      var self = this;

      api
        .post("servers/" + self.serverId + "/resetkey", {
          username: self.data.user,
          password: self.data.pass,
        })
        .then(function (response) {
          console.log(response);
          if (response.data.success) {
            self.$router.go();
          } else {
            self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.resetKeyDialog = false;
          self.loading = false;
        });
    },
    isActive(to) {
      return location.pathname.startsWith(to);
    }
  },
};
</script>

<style>
a {
  text-decoration: none;
  color: #A25C57;
}
</style>