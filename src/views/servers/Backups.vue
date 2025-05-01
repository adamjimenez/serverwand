<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <v-alert v-if="message" type="info" :text="message"></v-alert>

    <Loading :value="loading" />

    <EditFile ref="editFile" :serverId="serverId" :path="path" :selected="selected" action="backups" save="false"
      @complete="list()" @error="handleError" />

    <v-card :loading="fetching">
      <v-container fluid>
        <v-row>
          <v-btn @click="configure" title="Configure S3" icon="mdi:mdi-settings"></v-btn>
          <Snapshot :serverId="serverId" @complete="handleComplete" @error="handleError" v-if="s3.access_key" />
          <Download :serverId="serverId" :path="path" :selected="selected" @complete="handleComplete"
            @error="handleError" />
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
                  <v-icon size="small" icon="mdi:mdi-arrow-up"></v-icon>
                </v-btn>
              </v-col>

              <v-col>
                <v-text-field v-model="path" class="ma-0 pa-0" @change="list" @keydown.enter="list"
                  hide-details></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-data-table :headers="headers" :items="items" :items-per-page="100" class="results" ref="results" mobile-breakpoint="0"
                  v-model="selectedIds"
                  :show-select="display.smAndUp"
                  :page="page"
                  hover
                  :row-props="rowProps"
                  fixed-header
                  style="height: calc(100vh - 370px); overflow: auto;"
                  @click:row="function (event, item) { open(item.item) }"
                  @contextmenu:row="select"
                  @update:page="updatePage"
                >

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
                <v-data-table :headers="backupHeaders" :items="backups" :items-per-page="100" mobile-breakpoint="0"
                  @click:row="function (event, item) { browse(item.item) }" hover fixed-header style="height: calc(100vh - 290px); overflow: auto;">

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
                    <v-btn icon :disabled="loading" :loading="loading === item.name" @click="deleteSnapshot(item.name)" @click.stop>
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
import Download from "../../components/CloudBackups/Download";
import Restore from "../../components/CloudBackups/Restore";
import Snapshot from "../../components/CloudBackups/Snapshot";
import EditFile from "../../components/Files/EditFile";
import util from "../../services/util";
import Confirm from "../../components/ConfirmDialog.vue";
import { useDisplay } from 'vuetify';

export default {
  components: {
    Loading,
    Download,
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
      loading: null,
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
      page: 1,
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

      this.selectedIds.forEach((id) => {
        let item = this.items.find(obj => obj.id === id);
        if (item) {
          selected.push(item)
        }
      });

      return selected;
    }
  },
  created() {
    this.display = this.$vuetify.display;
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.error = "";
      this.message = "";
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups", { path: this.path })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return;
          }

          this.s3 = response.data.s3;
          this.server = response.data.item;

          if (response.data.backups && response.data.backups.length) {
            this.backups = response.data.backups;
          }

          document.title = "Backups | " + this.server.name;

          this.list();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    browse(item) {
      console.log(item)
      this.path = "/" + item.name + '/';
      this.list();
    },
    list() {
      this.error = "";
      this.message = "";
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups?cmd=list", {
          path: this.path,
        })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
            return;
          }

          this.page = 1;
          this.items = [];
          response.data.files.forEach((element) => {
            this.items.push({
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
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
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
      let index = this.path.substr(0, this.path.length - 1).lastIndexOf("/");
      if (index !== -1) {
        this.path = this.path.substr(0, index + 1);

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
      this.fetching = true;

      api
        .post("servers/" + this.serverId + "/backups", this.s3)
        .then(() => {
          this.fetchData();
          this.s3Drawer = false;
        })
        .catch((error) => {
          console.log(error);
          this.fetching = false;
        });
    },
    async deleteSnapshot(name) {
      if (!await this.$refs.confirm.open("Delete " + name + "?")) {
        return;
      }

      this.loading = name;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/backups", {
          cmd: "deleteSnapshot",
          name: name,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
            this.error = response.data.error;
            this.fetching = false;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = null;
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
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/backups", {
          active: this.s3.active,
        })
        .then((response) => {
          console.log(response);

          if (!response.data.success) {
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
        });
    },
    formatDate(value) {
      return util.formatDate(value);
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
    updatePage(page) {
      this.page = page;
    },
    rowProps(data) {
      if (this.selected.find(item => item.id === data.item.id)) {
        return {
            class: 'bg-primary'
        };
      }
    },    
    select(event, item) {
      event.preventDefault();

      let found = -1;
      this.selectedIds.forEach((v, index) => {
        if (item.item.id == v) {
          found = index;
        }
      });

      if (found > -1) {
        this.selectedIds.splice(found, 1);
      } else {
        this.selectedIds.push(item.item.id);
      }
    },
  },
};
</script>