<template>
  <v-app>
    <v-app-bar class="d-flex">
      <v-app-bar-nav-icon v-if="!mobile" variant="text" color="grey-lighten-1"
        @click.stop="if (mobile) { drawer = !drawer; } else { rail = !rail }"></v-app-bar-nav-icon>

      <router-link to="/servers" class="text-decoration-none text-primary" v-if="!mobile">
        <v-list-item>
          <template v-slot:prepend>
            <v-icon class="mr-0 pl-3" size="large" color="primary">fas fa-magic</v-icon>
          </template>
          <template v-slot:title>
            <h2>ServerWand</h2>
          </template>
        </v-list-item>
      </router-link>

      <Search @menuToggle="menuToggle" />
      <UserMenu v-if="!mobile" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :expand-on-hover="!mobile" :rail="rail" :permanent="!mobile">
      <v-list nav>
        <v-list-item base-color="primary" variant="flat" :to="createLink" class="text-no-wrap">
          <template v-slot:prepend>
            <v-icon size="small" style="width: 24px; text-align: center;">mdi:mdi-plus</v-icon>
          </template>
          {{ createLabel }}
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
      drawer: true,
      display: {},
      createLink: '',
      createLabel: '',
      mobile: false
    };
  },
  created() {
    this.display = this.$vuetify.display;

    axios.interceptors.response.use(
      (response) => {
        if (!response) {
          return false;
        }

        if (response.data.error == "master password") {
          // show password prompt
          this.masterPasswordDialog = true;
        } else if (response.data.error == "missing key") {
          // show password prompt
          this.resetKeyDialog = true;
          this.serverId = response.data.server;
          return response;
        } else {
          return response;
        }
      },
      (error) => {
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
    const { mobile } = useDisplay();
    this.mobile = mobile;

    if (parseInt(localStorage.dark) !== 0) {
      this.dark = true;
      this.$vuetify.theme.dark = true;
    }

    if (localStorage.rail === 'false') {
      this.rail = false;
    }

    this.updateCreateButton();
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
      this.restricted = this.data.user !== "0";

      this.filtered = this.items.filter((item) => {
        return this.restricted ? !item.restricted : true;
      });
    },
    mobile(mobile) {
      this.rail = !mobile;
      this.drawer = !mobile;
    },
    rail(value) {
      localStorage.rail = value;
    },
    '$route.path': function () {
      this.updateCreateButton();
    }
  },
  methods: {
    fetchData() {
      this.error = "";
      this.loading = true;

      api
        .get("settings/profile")
        .then((response) => {
          console.log(response);
          this.data = response.data.profile;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submitMasterPassword() {
      api
        .post("auth/masterpassword", {
          masterPassword: sha256(this.masterPassword),
        })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            this.$router.go();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.dialog = false;
          this.loading = false;
        });
    },
    resetKey() {
      api
        .post("servers/" + this.serverId + "/resetkey", {
          username: this.data.user,
          password: this.data.pass,
        })
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            this.$router.go();
          } else {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.resetKeyDialog = false;
          this.loading = false;
        });
    },
    isActive(to) {
      return location.pathname.startsWith(to);
    },
    updateCreateButton() {
      let parts = this.$route.path.split('/');
      parts.shift();

      let section = parts[0];
      if (!['servers', 'sites', 'domains', 'teams', 'users'].includes(parts[0])) {
        section = 'servers';
      }

      this.createLink = '/' + section + '/create';

      let label = 'New ';
      label += section.substr(0, section.length - 1);
      this.createLabel = label;
    },
    menuToggle() {
      if (this.mobile) {
        this.drawer = !this.drawer;
      } else {
        this.rail = !this.rail
      }
    }
  },
};
</script>