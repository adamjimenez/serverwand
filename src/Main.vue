<template>
  <v-app>
    <v-app-bar app flat>
      <v-app-bar-nav-icon @click.stop="rail = !rail" size="small"></v-app-bar-nav-icon>

      <router-link to="/servers" class="text-decoration-none text-primary" v-if="!mobile">
        <v-list-item class="my-1">
          <template v-slot:prepend>
            <v-icon class="mr-0" size="large" color="primary">fas fa-magic</v-icon>
          </template>
          <template v-slot:title>
            <h2 class="ml-2">ServerWand</h2>
          </template>
        </v-list-item>
      </router-link>

      <Search />
      <UserMenu />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :expand-on-hover="!mobile" disable-route-watcher :rail="rail" permanent>
      <v-list nav>
        <v-list-item base-color="primary" variant="flat" :to="createLink">
          <template v-slot:prepend>
            <v-icon size="small" style="width: 24px; text-align: center;">mdi:mdi-plus</v-icon>
          </template>
          Create
        </v-list-item>

        <v-list-item v-for="item in filtered" :key="item.title" :to="item.to" :active="isActive(item.to)"
          :title="item.title">
          <template v-slot:prepend>
            <v-icon size="small" style="width: 24px; text-align: center;">{{ item.icon }}</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view :restricted="restricted"></router-view>
      </v-container>
    </v-main>

    <v-footer app></v-footer>
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
  </v-app>
</template>

<script>
import Search from "./components/Search";
import UserMenu from "./components/UserMenu";
import api from "./services/api";
import axios from "axios";
import { sha256 } from "js-sha256";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Search,
    UserMenu,
  },
  data() {
    return {
      serverId: 0,
      data: {},
      dark: false,
      drawer: true,
      items: [
        { title: "Servers", to: "/servers", restricted: true, icon: "fas fa-server" },
        { title: "Sites", to: "/sites", restricted: false, icon: "fas fa-sitemap" },
        { title: "Domains", to: "/domains", restricted: false, icon: "fas fa-globe" },
        { title: "Teams", to: "/teams", restricted: true, icon: "fas fa-users" },
        { title: "Users", to: "/users", restricted: true, icon: "fas fa-user" },
      ],
      filtered: [],
      resetKeyDialog: false,
      masterPasswordDialog: false,
      masterPassword: "",
      restricted: false,
      rail: true,
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
  computed: {
    mobile: function () {
      const { mobile } = useDisplay();
      return mobile.value;
    },
    createLink: function () {
      let parts = this.$route.path.split('/');
      parts.shift();

      let section = parts[0];
      if (!['servers', 'sites', 'domains', 'teams', 'users'].includes(parts[0])) {
        section = 'servers';
      }

      return '/' + section + '/create';
    }
  }
};
</script>