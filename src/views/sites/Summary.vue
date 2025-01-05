<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card>
      <v-card max-width="400">

        <v-list lines="two">
          <DNS :server="data.server"></DNS>

          <v-list-item title="Disk usage" :subtitle="prettyBytes(data.disk_usage * 1024)"></v-list-item>

          <v-list-item title="Data transfer" :subtitle="prettyBytes(data.transfer * 1024)"></v-list-item>

          <v-list-item title="FTP host" :subtitle="data.domain">
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
              <v-btn icon="fas fa-folder-open" :to="'/servers/' + data.server?.id + '/Files#' + path" size="small"></v-btn>
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
            :path="'sites/' + this.siteId + '/iprestrictions'" @save="fetchData(true)" :remoteAddr="data.remote_addr" />
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
import OAuth from "../../components/OAuth.vue";

export default {
  components: {
    Loading,
    Copy,
    Edit,
    IPRestrictions,
    DNS,
    OAuth,
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
      this.error = "";
      this.siteId = this.$route.params.id;
      clearTimeout(this.timer);
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/summary", {
          clearCacheEntry: clearCacheEntry,
        })
        .then((response) => {
          console.log(response);

          if (response.data.item) {
            this.data = response.data.item;
          }

          if (this.data.domain) {
            document.title = "Summary" + " | " + this.data.domain;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;

          if (this.data.dns && this.data.dns.updating) {
            console.log("checking dns");
            this.timer = setTimeout(function () {
              this.fetchData(true);
            }, 10000);
          }
        });
    },
    fixDomainDns() {
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.siteId + "/fixdns", {})
        .then(async (response) => {
          console.log(response);

          this.loading = false;

          switch (await this.$refs.oauth.check(response.data)) {
            case true:
              return this.fixDomainDns();
            case false:
              return;
          }

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData(true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    toggleAuth() {
      this.fetching = true;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/auth", {
          status: this.data.auth.active,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
          } else {
            this.fetchData(true);
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
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