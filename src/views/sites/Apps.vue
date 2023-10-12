<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-alert v-if="data.app.public_dir_exists === false" type="error">
      Missing public dir.
      <span v-if="data.app.git_url">
        Add a pubic folder to your Git repository and re-pull.
      </span>
    </v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-text>
        <v-layout v-if="data.origin" row>
          <v-card>
            <v-card-text>
              <v-btn @click="openSync(data.origin)"> Push </v-btn>
              <v-btn @click="openSync(siteId)"> Pull </v-btn>
            </v-card-text>
          </v-card>
        </v-layout>

        <v-container v-if="data.app" fluid>
          <v-row>
            <v-btn @click="gitInfo = true" title="Git info" v-if="data.app.git_url" icon="fab fa-git"></v-btn>
            <v-btn @click="clearLogs" title="Clear logs" v-if="data.app.isNode" icon="block"></v-btn>
            <v-btn @click="showCloneApp = true" title="Copy app" icon="mdi:mdi-content-copy"></v-btn>
            <v-switch v-if="data.app.isNode" v-model="data.app.online" :label="data.app.status" @change="toggleStatus()"
              color="primary" hide-details></v-switch>

            <v-btn v-if="data.app.name === 'wordpress'" @click="openWordpress" title="Open Wordpress"
              icon="fab fa-wordpress"></v-btn>
          </v-row>
        </v-container>

        <div v-if="data.app">
          <div v-if="data.app.name">
            <v-card :title="data.app.name" :subtitle="data.app.version">
              <v-card-actions v-if="data.app.latest && data.app.latest !== data.app.version">
                <v-btn @click="install(data.app.name)" prepend-icon="fas fa-download">
                  Install {{ data.app.latest }}</v-btn>
              </v-card-actions>

              <v-card-text v-if="data.app.isNode">
                <v-textarea label="Ouput log" readonly :value="data.app.output_log"></v-textarea>
                <v-textarea label="Error log" readonly :value="data.app.error_log"></v-textarea>
              </v-card-text>
            </v-card>
          </div>

          <v-card class="pa-3" v-else>
            <v-card-text> Unrecognised application</v-card-text>
          </v-card>
        </div>

        <v-card class="mx-auto" v-else>
          <v-list>
            <v-list group>
              <v-list-item v-for="(item, i) in apps" :key="`item-${i}`" :title="item.label" :value="item"
                @click="install(item.name)">
                <template v-slot:prepend>
                  <v-icon>
                    <i :class="item.icon"></i>
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-list>
        </v-card>
      </v-card-text>
    </v-card>

    <v-navigation-drawer v-model="drawer" temporary right app>
      <v-card title="Git">
        <v-card-text>
          <v-text-field v-model="data.git_url" label="Git URL" hint="e.g. https://github.com/<user>/<repo>.git"
            required></v-text-field>

          <v-checkbox v-model="data.public_dir" label="Clone in public dir"></v-checkbox>

          <v-btn :disabled="!data.git_url || fetching" :loading="fetching" color="success" @click="submitGit()">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-dialog v-model="showCloneApp">
      <v-card title="Clone App">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-card-text>
          <v-text-field v-model="data.stagingDomain" :rules="domainRules" label="Staging Domain" required></v-text-field>

          <v-select v-model="data.server" :items="server_opts" label="Server" required></v-select>

          <v-checkbox v-model="dns" label="Configure DNS" :disabled="dnsProviders[data.server] == ''"></v-checkbox>

          <v-checkbox v-model="substitutions" label="Realtime domain substitution in HTML"
            :disabled="dnsProviders[data.server] == ''"></v-checkbox>

          <v-btn color="primary" @click="cloneApp"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="syncDialog">
      <v-card>
        <v-card-title v-if="target === siteId">
          Copy from live to staging
        </v-card-title>
        <v-card-title v-else> Copy from staging to live </v-card-title>

        <v-card-text>
          <v-checkbox v-model="files" label="Files"></v-checkbox>

          <v-checkbox v-model="database" label="Database"></v-checkbox>

          <div v-if="database">
            <v-radio-group row v-model="fullDb" class="mx-3">
              <v-radio label="Full DB" value="1"></v-radio>
              <v-radio label="Selected tables" value="0"></v-radio>
            </v-radio-group>

            <v-card v-if="fullDb == '0'">
              <v-card-text>
                <v-row>
                  <v-checkbox class="mx-2" label="Select all" @click="selectAll" v-model="allSelected"></v-checkbox>
                </v-row>

                <v-row>
                  <v-checkbox class="mx-2" v-model="tableNames" v-for="table in tables" :key="table" :value="table"
                    :label="table"></v-checkbox>
                </v-row>
              </v-card-text>
            </v-card>
          </div>

          <v-btn color="primary" @click="sync" :disabled="(!files && !database) || (fullDb <= 0 && tableNames.length === 0)
            " class="my-3">
            Continue
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="gitInfo">
      <v-card :loading="fetching" title="Git info">
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col>
                <v-btn @click="gitPull"> Pull </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field v-model="data.app.git_url" label="Git URL" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.git_url" />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field v-model="data.app.ssh_key" label="SSH key"
                  hint="Save to GitHub or Bitbucket in order to push to this repository" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.ssh_key" />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field v-model="data.app.webhook_url" label="Git Pull Webhook"
                  hint="Use this webhook to initiiate a Git Pull" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.webhook_url" />
              </v-col>
            </v-row></v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <Site ref="Site" @error="handleError" />
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";
import Site from "../../components/Site";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Copy,
    Site,
    Confirm,
  },
  data: () => ({
    siteId: null,
    error: null,
    files: false,
    database: false,
    fullDb: "1",
    tableNames: [],
    tables: [],
    data: {
      server: "",
      origin: "",
      app: {},
    },
    dns: true,
    substitutions: false,
    dnsProviders: {},
    domainRules: [(v) => !!v || "Domain is required"],
    loading: false,
    fetching: false,
    drawer: false,
    cloneDialog: false,
    syncDialog: false,
    target: 0,
    apps: [
      {
        name: "git",
        label: "Git repository",
        icon: "fab fa-git",
      },
      {
        name: "wordpress",
        label: "Wordpress",
        icon: "fab fa-wordpress",
      },
      {
        name: "joomla",
        label: "Joomla",
        icon: "fab fa-joomla",
      },
      {
        name: "drupal",
        label: "Drupal",
        icon: "fab fa-drupal",
      },
      {
        name: "magento",
        label: "Magento",
        icon: "fab fa-magento",
      },
      {
        name: "Roundcube",
        label: "Roundcube webmail",
        icon: "fas fa-envelope",
      },
      {
        name: "shiftlib",
        label: "ShiftLib CMS",
        icon: "fas fa-user-edit",
      },
    ],
    server_opts: [],
    selected: [],
    allSelected: false,
    authRequired: false,
    newWindow: false,
    gitInfo: false,
    showCloneApp: false,
  }),
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;
      this.siteId = this.$route.params.id;

      api
        .get("sites/" + this.siteId + "/apps")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data.item;
          document.title = "Apps" + " | " + self.data.domain;

          self.data.stagingDomain = "staging." + self.data.domain;

          api.get("servers/").then(function (response) {
            response.data.items.forEach((element) => {
              self.server_opts.push({
                text: element.name,
                value: element.id,
              });
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    install: async function (app) {
      if (app === "git") {
        this.drawer = true;
        return;
      }

      if (!await this.$refs.confirm.open("Install " + app)) {
        return;
      }

      var self = this;
      this.error = "";
      this.fetching = true;
      this.loading = true;

      api
        .post("sites/" + this.$route.params.id + "/apps", { app: app })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
          self.loading = false;
        });

    },
    clearLogs() {
      var self = this;

      this.fetching = true;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/apps", { flush: true })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
            self.fetching = false;
          } else {
            self.drawer = false;
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        })
        .finally(function () { });
    },
    submitGit() {
      var self = this;

      if (this.data.git_url) {
        this.fetching = true;
        this.error = "";

        api
          .post("sites/" + this.siteId + "/apps", {
            git_url: this.data.git_url,
            public_dir: this.data.public_dir,
          })
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
              self.fetching = false;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          })
          .finally(function () { });
      }
    },
    cloneApp() {
      this.error = "";

      var data = {
        server: this.data.server,
        domain: this.data.stagingDomain,
        origin: this.siteId,
        //needle: this.data.domain,
        dns: this.dns,
      };

      this.$refs.Site.create(data);
    },
    openSync(target) {
      var self = this;
      this.target = target;
      this.syncDialog = true;

      api
        .get("sites/" + target + "/database/tables")
        .then(function (response) {
          console.log(response);
          self.tables = response.data.tables;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () { });
    },
    sync() {
      var self = this;
      this.error = "";
      this.fetching = true;

      var params = {
        files: this.files,
        database: this.database,
        tables: this.tableNames,
      };

      //console.log(params);

      var cmd = this.target === this.siteId ? "pull" : "push";

      api
        .post("sites/" + this.siteId + "/apps/" + cmd, params)
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
          self.syncDialog = false;
        });
    },
    pull() {
      var self = this;
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/apps/pull")
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    selectAll: function () {
      this.tableNames = [];

      if (this.allSelected) {
        for (var table in this.tables) {
          this.tableNames.push(this.tables[table].toString());
        }
      }
    },
    select: function () {
      this.allSelected = false;
    },
    toggleStatus() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.siteId + "/apps/", {
          status: this.data.app.online,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            self.fetching = false;
          } else if (response.data.success) {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        })
        .finally(function () {
          self.loading = false;
        });
    },
    gitPull() {
      var self = this;
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/git/pull")
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    openWordpress() {
      window.open('https://' + this.data.domain + '/wp-admin/');
    },
    handleError(error) {
      this.error = error;
    },
  },
};
</script>