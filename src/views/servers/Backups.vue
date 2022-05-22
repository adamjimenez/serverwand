<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <v-alert v-if="message" type="info">
      {{ message }}
    </v-alert>

    <Loading :value="loading" />

    <EditFile
      ref="editFile"
      :serverId="serverId"
      :path="path"
      :selected="selected"
      action="backups"
      save="false"
      @complete="list()"
      @error="handleError"
    />

    <v-card class="pa-3">
      <v-row>
        <v-col class="flex-grow-0">
          <v-btn @click="configure" title="Configure S3">
            <v-icon>settings</v-icon>
          </v-btn>
        </v-col>
        <v-col class="flex-grow-0" v-if="s3.access_key">
          <Snapshot
            :serverId="serverId"
            @complete="handleComplete"
            @error="handleError"
          />
        </v-col>
        <v-col class="flex-grow-0" v-if="s3.access_key">
          <v-btn @click="fetchData()">
            <v-icon>refresh</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-switch
            v-model="s3.active"
            label="Nightly backups"
            class="my-0"
            @change="toggleBackups()"
          ></v-switch>
        </v-col>
      </v-row>
    </v-card>

    <v-card :loading="fetching">
      <v-container>
        <v-row>
          <v-col class="flex-grow-0">
            <Restore
              :serverId="serverId"
              :path="path"
              :selected="selected"
              @complete="handleComplete"
              @error="handleError"
            />
          </v-col>
        </v-row>
      </v-container>

      <div v-if="s3.access_key">
        <div v-if="path !== '/'">
          <v-container>
            <v-row>
              <v-col class="flex-grow-0">
                <v-btn icon @click="upLevel()" :disabled="path === '/'">
                  <v-icon small>arrow_upward</v-icon>
                </v-btn>
              </v-col>

              <v-col>
                <v-text-field
                  v-model="path"
                  class="ma-0 pa-0"
                  @change="list"
                  @keydown.enter="list"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-data-table
            :headers="headers"
            :items="items"
            class="results"
            ref="results"
          >
            <template v-slot:body="prop">
              <tbody>
                <tr v-for="item in prop.items" :key="item.name">
                  <td class="text-start">
                    <v-list-item>
                      <v-checkbox v-model="item.selected"></v-checkbox>
                    </v-list-item>
                  </td>
                  <td
                    class="text-start"
                    @click="open(item)"
                    style="cursor: pointer"
                  >
                    {{ item.name }}
                  </td>
                  <td class="text-start">
                    {{ item.size | prettyBytes }}
                  </td>
                  <td class="text-start">
                    {{ item.modified | formatDate }}
                  </td>
                  <td class="text-start">
                    {{ item.perms }}
                  </td>
                  <td class="text-start">
                    {{ item.owner }}
                    {{ item.group }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
        </div>

        <div v-else>
          <v-data-table :headers="backupHeaders" :items="backups">
            <template v-slot:body="prop">
              <tbody>
                <tr v-for="item in prop.items" :key="item.name">
                  <td
                    class="text-start"
                    @click="browse(item)"
                    style="cursor: pointer"
                  >
                    {{ item.name }}
                  </td>
                  <td class="text-start">
                    {{ item.timestamp | formatDate }}
                  </td>
                  <td class="text-start">
                    {{ item.complete ? 'Complete' : 'Incomplete' }}
                  </td>
                  <td class="text-start">
                    {{ item.automatic ? 'Automatic' : 'Manual' }}
                  </td>
                  <td class="text-start">
                    {{ Math.round(item.duration / 60) }}m
                  </td>
                  <td class="text-start">
                    {{ item.size | prettyBytes }}
                  </td>
                  <td class="text-start">
                    <v-btn
                      v-if="item.automatic !== true"
                      icon
                      :disabled="loading"
                      :loading="loading"
                      @click="deleteSnapshot(item.name)"
                      @click.stop
                    >
                      <v-icon small>delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
        </div>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="s3Drawer" temporary right>
      <v-card>
        <v-card-title> S3 Settings </v-card-title>

        <v-card-text>
          <v-select v-model="s3.host" :items="hosts" label="Host"></v-select>

          <v-text-field
            v-model="s3.access_key"
            label="Access Key"
            required
          ></v-text-field>

          <v-text-field
            v-model="s3.secret_key"
            label="Secret Key"
            required
          ></v-text-field>

          <v-text-field
            v-model="s3.bucket"
            label="Bucket"
            required
          ></v-text-field>

          <v-btn
            :disabled="fetching"
            :loading="loading"
            color="success"
            @click="save"
          >
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Restore from "../../components/CloudBackups/Restore";
import Snapshot from "../../components/CloudBackups/Snapshot";
import EditFile from "../../components/Files/EditFile";

export default {
  components: {
    Loading,
    Restore,
    Snapshot,
    EditFile,
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
      selected: [],
      hosts: [
        {
          text: "AWS",
          value: "",
        },
        {
          text: "Linode (Atlanta, GA)",
          value: "https://us-southeast-1.linodeobjects.com",
        },
        {
          text: "Linode (Frankfurt, DE)",
          value: "https://eu-central-1.linodeobjects.com",
        },
        {
          text: "Linode (Newark, NJ)",
          value: "https://us-east-1.linodeobjects.com",
        },
        {
          text: "Linode (Singapore, SG)",
          value: "https://ap-south-1.linodeobjects.com",
        },
        {
          text: "Digital Ocean (NYC3)",
          value: "https://nyc3.digitaloceanspaces.com",
        },
        {
          text: "Digital Ocean (SFO3)",
          value: "https://sfo3.digitaloceanspaces.com",
        },
        {
          text: "Digital Ocean (AMS3)",
          value: "https://ams3.digitaloceanspaces.com",
        },
        {
          text: "Digital Ocean (SGP1)",
          value: "https://sgp1.digitaloceanspaces.com",
        },
        {
          text: "Digital Ocean (FRA1)",
          value: "https://fra1.digitaloceanspaces.com",
        },
        {
          text: "Vultr",
          value: "https://ewr1.vultrobjects.com",
        },
      ],

      headers: [
        {
          text: "",
          value: "",
        },
        {
          text: "Name ",
          value: "name",
        },
        {
          text: "Size ",
          value: "size",
        },
        {
          text: "Last modified ",
          value: "modified",
        },
      ],

      backupHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Date",
          value: "date",
        },
        {
          text: "Status",
          value: "complete",
        },
        {
          text: "Type",
          value: "automatic",
        },
        {
          text: "Duration",
          value: "duration",
        },
        {
          text: "Size",
          value: "size",
        },
        {
          text: "",
          value: "",
        },
      ],
    };
  },
  watch: {
    items: {
      handler: function (newItems) {
        this.selected = [];

        for (var i = 0; i < newItems.length; i++) {
          if (newItems[i].selected) {
            this.selected.push(newItems[i]);
          }
        }
      },
      deep: true,
    },
    path: {
      handler: function (newValue) {
        window.ssh_path = newValue;
      },
    },
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
    deleteSnapshot(name) {
      this.$confirm("Delete " + name + "?").then((res) => {
        if (res) {
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
        }
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
  },
};
</script>
