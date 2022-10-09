<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching" ref="results">

      <v-container fluid>
        <v-row>

          <v-col class="flex-grow-0">
            <v-btn title="Create backup" ref="uploadFolderButton" @click="createBackup()">
              <v-icon>add</v-icon>
            </v-btn>
          </v-col>

          <Upload
            :serverId="serverId"
            :path="path"
            :dropZone="$refs.results"
            @complete="fetchData()"
            @error="handleError"        
          />
        </v-row>
      </v-container>

      <v-list v-if="data.items.length > 0">
        <v-list-item-group>
          <template v-for="(item, i) in data.items">
            <v-list-item
              :key="`item-${i}`"
              :value="item"
              @click="restore(item.name)"
              @click.stop
            >
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ item.date }} -
                    {{ item.size | prettyBytes }}</v-list-item-subtitle
                  >
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon @click="download(item)" @click.stop>
                    <v-icon small>download</v-icon>
                  </v-btn>
                </v-list-item-action>

                <v-list-item-action>
                  <v-btn icon @click="deleteBackup(item.name)" @click.stop>
                    <v-icon small>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>

      <v-card-text v-else> Empty </v-card-text>
    </v-card>

  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Upload from "../../components/Files/Upload";

export default {
  components: {
    Loading,
    Upload,
  },
  data() {
    return {
      path: "/",
      domainId: null,
      post: null,
      error: null,
      data: {
        domain: "",
        items: [],
      },
      loading: false,
      details: "",
      loading: false,
      fetching: false,
      alias: {
        domain: "",
        dns: false,
      },
      timer: null,
      serverId: 0,
      progress: 0,
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
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.domainId = this.$route.params.id;
      clearTimeout(self.timer);

      this.fetching = true;
      this.progress = 0;

      api
        .get("sites/" + this.domainId + "/backups")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data;
          document.title = "Backups" + " | " + self.data.domain;

          self.serverId = self.data.server.id;
          self.path = '/var/www/vhosts/' + self.data.server.ip + '/public/backups';
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    createBackup() {
      var self = this;
      this.fetching = true;
      this.error = '';

      api
        .get("sites/" + this.domainId + "/backups/create")
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
    download(item) {
      console.log("https://" + this.data.server.ip + "/backups/" + item.name);
      window.open("https://" + this.data.server.ip + "/backups/" + item.name);
    },
    deleteBackup(item) {
      this.$confirm("Delete " + item + "?").then((res) => {
        if (!res) {
          return;
        }

        var self = this;
        self.fetching = true;

        api
          .post("sites/" + this.domainId + "/backups", { ids: [item] })
          .then(function () {
            self.fetchData();
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          });
      });
    },
    restore(item) {
      this.$confirm("Restore " + item + "?").then((res) => {
        if (!res) {
          return;
        }

        var self = this;
        self.fetching = true;

        api
          .post("sites/" + this.domainId + "/backups", { restore: item })
          .then(function () {
            self.fetchData();
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          });
      });
    },
    handleError(error) {
      this.error = error;
    },
    handleLoading(loading) {
      this.fetching = loading;
    },
  },
};
</script>
