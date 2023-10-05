<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-alert v-if="authRequired" class="ma-0">
      <strong>DNS auth required: </strong>
      <v-btn @click="authPrompt()">Fix</v-btn>
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3">

      <v-card max-width="400">

        <v-list lines="two">
          <DNS :server="data.server"></DNS>

          <v-list-item title="Disk Usage" :subtitle="prettyBytes(data.disk_usage * 1024)"></v-list-item>

          <v-list-item title="Data Transfer" :subtitle="prettyBytes(data.transfer * 1024)"></v-list-item>

          <v-list-item title="FTP Host" :subtitle="data.domain">
            <template v-slot:subtitle>
              <Copy :val="data.domain" text />
            </template>
          </v-list-item>

          <v-list-item title="Username" :subtitle="data.domain">
            <template v-slot:subtitle>
              <Copy :val="data.domain" text />
            </template>
          </v-list-item>

          <v-list-item title="Password" subtitle="******">
            <template v-slot:subtitle>
              <Copy :val="data.ftp_password" label="******" text />
            </template>
            <template v-slot:append>
              <Edit :val="data.ftp_password" label="FTP Password" name="password" password
                :path="'sites/' + this.siteId + '/update'" @save="fetchData(true)" hideText />
            </template>
          </v-list-item>

          <v-list-item title="Path">
            <v-list-item-subtitle>
              <Copy :val="path" text />
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-btn icon :to="'/servers/' + data.server?.id + '/Files#' + path">
                <i class="fas fa-folder-open"></i>
              </v-btn>
            </template>
          </v-list-item>

          <div v-if="data.origin">
            <v-list-item>
              <v-list-item-title> Password protection </v-list-item-title>
              <v-list-item-subtitle>
                <v-switch v-model="data.auth.active" label="Active" @change="toggleAuth()"></v-switch>
              </v-list-item-subtitle>
            </v-list-item>
            <v-divider></v-divider>

            <div v-if="data.auth.active">
              <v-list-item>
                <v-list-item-title> Username </v-list-item-title>
                <v-list-item-subtitle>
                  {{ data.auth.username }}
                  <Copy :val="data.auth.username" text />
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title> Password </v-list-item-title>
                <v-list-item-subtitle>
                  {{ data.auth.password }}
                  <Edit :val="data.auth.password" label="Auth Password" name="password" password
                    :path="'sites/' + this.siteId + '/auth'" @save="fetchData(true)" />
                </v-list-item-subtitle>
              </v-list-item>
            </div>
          </div>

          <IPRestrictions :active="data.ip_restrictions.active" :items="data.ip_restrictions.ips"
            :path="'sites/' + this.siteId + '/iprestrictions'" @save="fetchData(true)" />
        </v-list>
      </v-card>

    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import util from "../../services/util";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";
import Edit from "../../components/Edit";
import IPRestrictions from "../../components/IPRestrictions";
import DNS from "../../components/DNS";

export default {
  components: {
    Loading,
    Copy,
    Edit,
    IPRestrictions,
    DNS,
  },
  data() {
    return {
      siteId: null,
      post: null,
      error: null,
      data: {
        disk_usage: 0,
        transfer: 0,
        server: {},
        app: {},
        dns: {},
        auth: {},
        ip_restrictions: {},
      },
      details: "",
      loading: false,
      fetching: false,
      passwordPanel: [false],
      passwordFormValid: true,
      showPassword: false,
      password: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      alias: {
        domain: "",
        dns: true,
      },
      copyText: "Copy",
      timer: null,
      authRequired: false,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  computed: {
    path: function () {
      return '/var/www/vhosts/' + this.data.domain + '/';
    }
  },
  methods: {
    fetchData(clearCacheEntry) {
      var self = this;
      this.error = "";
      this.siteId = this.$route.params.id;
      clearTimeout(self.timer);
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.item) {
            self.data = response.data.item;
          }

          if (self.data.domain) {
            document.title = "Summary" + " | " + self.data.domain;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;

          if (self.data.dns && self.data.dns.updating) {
            console.log("checking dns");
            self.timer = setTimeout(function () {
              self.fetchData(true);
            }, 10000);
          }
        });
    },
    fixDomainDns() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + self.siteId + "/fixdns", {})
        .then(function (response) {
          console.log(response);

          self.loading = false;

          if (!response.data.success) {
            if (response.data.error == "auth") {
              self.authRequired = true;
            } else {
              self.error = response.data.error;
            }
          } else {
            self.fetchData(true);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    authPrompt() {
      this.authRequired = false;
      window.open(
        "https://serverwand.com/account/services/" + this.data.server.dns
      );
    },
    toggleAuth() {
      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/auth", {
          status: this.data.auth.active,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData(true);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
  beforeUnmount() {
      clearTimeout(this.timer);
  },
};
</script>