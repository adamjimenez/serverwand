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

    <v-card :loading="fetching" :subtitle="data.app.version">
      <template v-slot:title>
        {{ data.app.name }}
      </template>

      <template v-slot:append>
        <span v-if="data.origin">
          <v-btn @click="openSync(data.origin)"> Push </v-btn>
          <v-btn @click="openSync(siteId)"> Pull </v-btn>
        </span>

        <span v-if="data.app">
          <v-btn @click="clearLogs" title="Clear logs" v-if="data.app.isNode" icon="block"></v-btn>
          <v-btn @click="showCloneApp = true" title="Clone app" icon="mdi:mdi-content-copy"></v-btn>
          <v-switch v-if="data.app.isNode" v-model="data.app.online" :label="data.app.status" @change="toggleStatus()"
            color="primary" hide-details></v-switch>
          <v-btn v-if="data.app.name === 'wordpress'" @click="openWordpress" title="Open Wordpress"
            icon="fab fa-wordpress"></v-btn>
        </span>

        <v-btn @click="install(data.app.name)" prepend-icon="fas fa-download"
          v-if="data.app.latest && data.app.latest !== data.app.version">
          Install {{ data.app.latest }}</v-btn>

        <span v-if="data.app.git_url">
          <v-btn @click="gitPull"> Pull </v-btn>
          <v-btn @click="infoDialog = true"> Info </v-btn>
        </span>

        <v-btn v-else title="Deployment keys" @click="fetchKeys(); keysDialog = true" icon="mdi:mdi-key"> </v-btn>

      </template>

      <v-card-text>
        <div v-if="data.app">

          <div v-if="data.app.name">
            <div v-if="data.app.isNode">
              <v-textarea label="Ouput log" readonly :value="data.app.output_log"></v-textarea>
              <v-textarea label="Error log" readonly :value="data.app.error_log"></v-textarea>
            </div>

            <div v-else-if="data.app.git_url">
              <v-list lines="one">
                <v-list-item v-for="item in data.app?.commits" :title="item.subject" :key="item"
                  :subtitle="item.date + ' by ' + item.author"></v-list-item>
              </v-list>
            </div>
          </div>

          <p v-else> Unrecognised application</p>
        </div>

        <v-list v-else>
          <v-list-item v-for="(item, i) in apps" :key="`item-${i}`" :title="item.label" :value="item"
            @click="install(item.name)">
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
          </v-list-item>
        </v-list>

      </v-card-text>
    </v-card>

    <v-dialog v-model="keysDialog" max-width="600">
      <v-card title="Deployment keys">
        <v-card-text>
          <v-container fluid>
            <v-list v-if="!fetching">
                <v-list-item v-for="(item, i) in keys" :key="`item-${i}`" :title="item.label">
                  <v-list-item-subtitle style="white-space: nowrap;">
                    {{ item.key }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn icon :disabled="fetching" :loading="fetching">
                      <Copy :val="'https://serverwand.com/api/sites/' + siteId + '/deploy?k=' + item.key" title="Copy deployment URL" />
                    </v-btn>
                    <v-btn icon="mdi:mdi-delete" size="small" :disabled="fetching" :loading="loading === item.id" @click.stop="deleteKey(item.id)"></v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-btn @click="addKey" icon="mdi:mdi-plus"></v-btn>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="keyDialog">
      <v-card title="Create key">
        <v-card-text>
          <v-text-field v-model="keyLabel" label="Label"></v-text-field>

          <v-btn :disabled="!keyLabel" :loading="fetching" color="success" @click="saveKey">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="infoDialog" max-width="600">
      <v-card title="Info">
        <v-card-text>
          <v-container fluid>
            <v-row v-if="data.app.git_url">
              <v-col>
                <v-text-field v-model="data.app.git_url" label="Git URL" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.git_url" />
              </v-col>
            </v-row>

            <v-row v-if="data.app.git_url">
              <v-col>
                <v-text-field v-model="data.app.ssh_key" label="SSH key"
                  hint="Save to GitHub or Bitbucket in order to push to this repository" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.ssh_key" />
              </v-col>
            </v-row>

            <v-row v-if="data.app.git_url">
              <v-col>
                <v-text-field v-model="data.app.webhook_url" label="Git Pull Webhook"
                  hint="Use this webhook to initiiate a Git Pull" readonly></v-text-field>
              </v-col>

              <v-col cols="1">
                <Copy :val="data.app.webhook_url" />
              </v-col>
            </v-row>

          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="gitDialog" max-width="600">
      <v-card title="Git">
        <v-card-text>
          <v-text-field v-model="data.git_url" label="Git URL" hint="e.g. https://github.com/<user>/<repo>.git"
            required></v-text-field>

          <v-checkbox v-model="data.public_dir" label="Clone into public dir"></v-checkbox>

          <v-btn :disabled="!data.git_url || fetching" :loading="fetching" color="success" @click="submitGit()">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showCloneApp" max-width="600">
      <v-card title="Clone App">
        <v-alert v-if="error" type="error" :text="error"></v-alert>

        <v-card-text>
          <v-text-field v-model="data.stagingDomain" :rules="domainRules" label="Staging Domain" required></v-text-field>

          <v-select v-model="data.server" :items="server_opts" label="Server" required></v-select>

          <v-checkbox v-model="dns" label="Configure DNS" :disabled="dnsProviders[data.server] == ''"></v-checkbox>

          <v-checkbox v-model="substitutions" label="Realtime domain substitution in HTML"
            :disabled="dnsProviders[data.server] == ''"></v-checkbox>

          <v-btn color="primary" @click="cloneApp" :disabled="!data.server || data.stagingDomain === ''"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="syncDialog" max-width="600">
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
    gitDialog: false,
    infoDialog: false,
    keysDialog: false,
    cloneDialog: false,
    syncDialog: false,
    target: 0,
    apps: [{
      name: "git",
      label: "Git repository",
      icon: "fab fa-git",
    }, {
      name: "wordpress",
      label: "Wordpress",
      icon: "fab fa-wordpress",
    }, {
      name: "joomla",
      label: "Joomla",
      icon: "fab fa-joomla",
    }, {
      name: "drupal",
      label: "Drupal",
      icon: "fab fa-drupal",
    }, {
      name: "magento",
      label: "Magento",
      icon: "fab fa-magento",
    }, {
      name: "Roundcube",
      label: "Roundcube webmail",
      icon: "fas fa-envelope",
    }, {
      name: "shiftlib",
      label: "ShiftLib CMS",
      icon: "fas fa-user-edit",
    }],
    server_opts: [],
    selected: [],
    allSelected: false,
    authRequired: false,
    newWindow: false,
    showCloneApp: false,
    keys: [],
    keyDialog: false,
    keyLabel: '',
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
      this.error = "";
      this.fetching = true;
      this.siteId = this.$route.params.id[0];

      api
        .get("sites/" + this.siteId + "/apps")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.data = response.data.item;
          document.title = "Apps" + " | " + this.data.domain;

          this.data.stagingDomain = "staging." + this.data.domain;

          api.get("servers/").then((response) => {
            response.data.items.forEach((element) => {
              this.server_opts.push({
                title: element.name,
                value: element.id,
              });
            });
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    install: async function (app) {
      if (app === "git") {
        this.gitDialog = true;
        return;
      }

      if (!await this.$refs.confirm.open("Install " + app)) {
        return;
      }

      this.error = "";
      this.fetching = true;
      this.loading = true;

      api
        .post("sites/" + this.$route.params.id + "/apps", { app: app })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
          this.loading = false;
        });

    },
    clearLogs() {
      this.fetching = true;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/apps", { flush: true })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
            this.fetching = false;
          } else {
            this.gitDialog = false;
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
          this.fetching = false;
        });
    },
    submitGit() {
      if (this.data.git_url) {
        this.fetching = true;
        this.error = "";

        api
          .post("sites/" + this.siteId + "/apps", {
            git_url: this.data.git_url,
            public_dir: this.data.public_dir,
          })
          .then((response) => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
              this.fetching = false;
            } else {
              this.gitDialog = false;
              this.fetchData();
            }
          })
          .catch((error) => {
            console.log(error);
            this.fetching = false;
          })
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
      this.target = target;
      this.syncDialog = true;

      api
        .get("sites/" + target + "/database/tables")
        .then((response) => {
          console.log(response);
          this.tables = response.data.tables;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    sync() {
      this.error = "";
      this.fetching = true;

      let params = {
        files: this.files,
        database: this.database,
        tables: this.tableNames,
      };

      //console.log(params);

      let cmd = this.target === this.siteId ? "pull" : "push";

      api
        .post("sites/" + this.siteId + "/apps/" + cmd, params)
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
          this.syncDialog = false;
        });
    },
    pull() {
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/apps/pull")
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
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
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.siteId + "/apps/", {
          status: this.data.app.online,
        })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            this.fetching = false;
          } else if (response.data.success) {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
          this.fetching = false;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    gitPull() {
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/git/pull")
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    openWordpress() {
      window.open('https://' + this.data.domain + '/wp-admin/');
    },
    handleError(error) {
      this.error = error;
    },
    fetchKeys() {
      this.error = "";
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/keys")
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return false;
          }

          this.keys = response.data.keys;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    deleteKey: async function (keyId) {
      if (!await this.$refs.confirm.open("Delete key?")) {
        return;
      }

      this.loading = keyId;
      this.error = "";

      api
        .post(
          "sites/" + this.siteId + "/keys/",
          { delete: keyId }
        )
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.fetching = false;
            this.error = response.data.error;
          } else {
            this.fetchKeys();
          }
        })
        .catch((error) => {
          this.fetching = false;
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
        });
    },
    addKey() {
      this.keyLabel = '';
      this.keyDialog = true;
    },
    saveKey() {
      this.fetching = true;
      this.error = "";

      api
        .post("sites/" + this.siteId + "/keys/", {
          label: this.keyLabel,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.fetching = false;
            this.error = response.data.error;
          } else {
            this.keyDialog = false;
            this.fetchKeys();
          }
        })
        .catch((error) => {
          this.fetching = false;
          console.log(error);
        });
    },
  },
};
</script>