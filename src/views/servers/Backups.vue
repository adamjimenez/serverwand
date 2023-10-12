<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-alert v-if="message" type="info" :text="message"></v-alert>

    <Loading :value="loading" />

    <EditFile ref="editFile" :serverId="serverId" :path="path" :selected="selected" action="backups" save="false"
      @complete="list()" @error="handleError" />

    <v-card :loading="fetching" class="pa-3">
      <v-container fluid>
        <v-row>
          <v-btn @click="configure" title="Configure S3" icon="mdi:mdi-settings"></v-btn>
          <Snapshot :serverId="serverId" @complete="handleComplete" @error="handleError" v-if="s3.access_key" />
          <Restore :serverId="serverId" :path="path" :selected="selected" @complete="handleComplete"
            @error="handleError" />
          <v-switch v-model="s3.active" label="Nightly backups" class="my-0" @change="toggleBackups()" hide-details
            color="primary"></v-switch>
        </v-row>

        <div v-if="s3.access_key">
          <div v-if="path !== '/'">
            <v-row>
              <v-col class="flex-grow-0">
                <v-btn icon @click="upLevel()" :disabled="path === '/'">
                  <v-icon size="small">mdi:mdi-arrow-up</v-icon>
                </v-btn>
              </v-col>

              <v-col>
                <v-text-field v-model="path" class="ma-0 pa-0" @change="list" @keydown.enter="list"
                  hide-details></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-data-table :headers="headers" :items="items" class="results" ref="results" mobile-breakpoint="0"
                  @click:row="function (event, item) { open(item.item) }" v-model="selectedIds" show-select>

                  <template v-slot:item.modified="{ item }">
                    {{ formatDate(item.modified) }}
                  </template>

                </v-data-table>
              </v-col>
            </v-row>
          </div>

          <div v-else>
            <v-row>
              <v-col cols="12">
                <v-data-table :headers="backupHeaders" :items="backups" mobile-breakpoint="0"
                  @click:row="function (event, item) { browse(item.item) }">

                  <template v-slot:item.name="{ item }">
                    <span @click="browse(item)">{{ item.name }}</span>
                  </template>

                  <template v-slot:item.timestamp="{ item }">
                    {{ formatDate(item.timestamp) }}
                  </template>

                  <template v-slot:item.complete="{ item }">
                    {{ item.complete ? 'Complete' : 'Incomplete' }}
                  </template>

                  <template v-slot:item.automatic="{ item }">
                    {{ item.automatic ? 'Automatic' : 'Manual' }}
                  </template>

                  <template v-slot:item.duration="{ item }">
                    {{ Math.round(item.duration / 60) }}m
                  </template>

                  <template v-slot:item.size="{ item }">
                    {{ prettyBytes(item.size) }}
                  </template>

                  <template v-slot:item.actions="{ item }">
                    <v-btn icon :disabled="loading" :loading="loading" @click="deleteSnapshot(item.name)" @click.stop>
                      <v-icon size="small">mdi:mdi-delete</v-icon>
                    </v-btn>
                  </template>

                </v-data-table>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-container>

    </v-card>

    <v-navigation-drawer app v-model="s3Drawer" temporary location="right">
      <v-card>
        <v-card-title> S3 Settings </v-card-title>

        <v-card-text>
          <v-select v-model="s3.host" :items="hosts" label="Host"></v-select>

          <v-text-field v-model="s3.access_key" label="Access Key" required></v-text-field>

          <v-text-field v-model="s3.secret_key" label="Secret Key" required></v-text-field>

          <v-text-field v-model="s3.bucket" label="Bucket" required></v-text-field>

          <!--
          <v-checkbox
            v-model="data.weekly_backups"
            :label="`Weekly backups`"
          ></v-checkbox>
          -->

          <v-btn :disabled="fetching" :loading="loading" color="success" @click="save">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Restore from "../../components/CloudBackups/Restore";
import Snapshot from "../../components/CloudBackups/Snapshot";
import EditFile from "../../components/Files/EditFile";
import util from "../../services/util";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Restore,
    Snapshot,
    EditFile,
    Confirm
  },
  data() {
    return {
      path: "/",
      error: "",
      message: "",
      backups: [],
      items: [],
      data: {},
      details: "",
      loading: false,
      fetching: false,
      serverId: 0,
      s3Drawer: false,
      s3: {
        access_key: "",
        active: false,
      },
      selectedIds: [],
      hosts: [{
        title: "AWS",
        value: "",
      },
      {
        title: "Linode (Atlanta, GA)",
        value: "https://us-southeast-1.linodeobjects.com",
      },
      {
        title: "Linode (Frankfurt, DE)",
        value: "https://eu-central-1.linodeobjects.com",
      },
      {
        title: "Linode (Newark, NJ)",
        value: "https://us-east-1.linodeobjects.com",
      },
      {
        title: "Linode (Singapore, SG)",
        value: "https://ap-south-1.linodeobjects.com",
      },
      {
        title: "Digital Ocean (NYC3)",
        value: "https://nyc3.digitaloceanspaces.com",
      },
      {
        title: "Digital Ocean (SFO3)",
        value: "https://sfo3.digitaloceanspaces.com",
      },
      {
        title: "Digital Ocean (AMS3)",
        value: "https://ams3.digitaloceanspaces.com",
      },
      {
        title: "Digital Ocean (SGP1)",
        value: "https://sgp1.digitaloceanspaces.com",
      },
      {
        title: "Digital Ocean (FRA1)",
        value: "https://fra1.digitaloceanspaces.com",
      },
      {
        title: "Vultr",
        value: "https://ewr1.vultrobjects.com",
      }],

      headers: [{
        title: "Name ",
        key: "name",
      },
      {
        title: "Size ",
        key: "size",
      },
      {
        title: "Last modified ",
        key: "modified",
      }],

      backupHeaders: [{
        title: "Name",
        key: "name",
      },
      {
        title: "Date",
        key: "date",
      },
      {
        title: "Status",
        key: "complete",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      },
      {
        title: "Type",
        key: "automatic",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      },
      {
        title: "Duration",
        key: "duration",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      },
      {
        title: "Size",
        key: "size",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      },
      {
        title: " ",
        key: "action",
      }],
    };
  },
  computed: {
    dir: function () {
      let path = this.path;

      if (!path.endsWith('/')) {
        let pos = path.lastIndexOf('/');
        if (pos !== -1) {
          path = path.substr(0, pos);
        }
      }

      return path;
    },
    selected: function () {
      let selected = [];

      var self = this;
      this.selectedIds.forEach(function (id) {
        var item = self.items.find(obj => obj.id === id);
        if (item) {
          selected.push(item)
        }
      });

      return selected;
    }
  },
  created() {
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.message = "";
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups", { path: this.path })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return;
          }

          self.s3 = response.data.s3;
          self.server = response.data.item;

          if (response.data.backups && response.data.backups.length) {
            self.backups = response.data.backups;
          }

          document.title = "Backups | " + self.server.name;

          self.list();
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    browse(item) {
      console.log(item)
      this.path = "/" + item.name;
      this.list();
    },
    list() {
      var self = this;
      this.error = "";
      this.message = "";
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups?cmd=list", {
          path: this.path,
        })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return;
          }

          self.items = [];
          response.data.files.forEach((element) => {
            self.items.push({
              id: element.id,
              name: element.name,
              size: element.size ? element.size : 0,
              type: element.type,
              modified: element.modified,
              perms: element.perms,
              permsn: element.permsn,
              owner: element.owner,
              group: element.group,
              selected: false,
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
    open(item) {
      if (item.type === "folder" || item.type === "link") {
        this.path = item.id;
        this.list();
      } else if (item.type === "file") {
        // load file
        this.$refs.editFile.open(item);
      }
    },
    upLevel() {
      console.log(this.path);
      var index = this.path.lastIndexOf("/");
      if (index !== -1) {
        this.path = this.path.substr(0, index);

        if (!this.path) {
          this.path = "/";
        }
      }

      this.list();
    },
    configure() {
      this.s3Drawer = true;
    },
    save() {
      var self = this;

      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups", this.s3)
        .then(function () {
          self.fetchData();
          self.s3Drawer = false;
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        });
    },
    async deleteSnapshot(name) {
      if (!await this.$refs.confirm.open("Delete " + name + "?")) {
        return;
      }

      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/backups", {
          cmd: "deleteSnapshot",
          name: name,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
            self.fetching = false;
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        });

      return false;
    },
    handleError(error) {
      this.error = error;
    },
    handleComplete(message) {
      console.log(message);
      this.message = message;
      //this.list();
    },
    toggleBackups() {
      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/backups", {
          active: this.s3.active,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
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
        });
    },
    formatDate(value) {
      return util.formatDate(value);
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>