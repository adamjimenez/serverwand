<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching" ref="results">
      <v-card-actions>
        <v-btn title="Create backup" ref="uploadFolderButton" @click="createBackup()" icon="mdi:mdi-plus"></v-btn>
        <Upload :serverId="serverId" :path="path" :dropZone="$refs.results" @complete="fetchData()"
          @error="handleError" />
      </v-card-actions>
      <v-card-text>

        <v-list v-if="data.items.length > 0" max-width="600">
          <v-list-item v-for="(item, i) in data.items" :key="`item-${i}`" :title="item.name"
            :subtitle="item.date + ' - ' + prettyBytes(item.size)" @click="restore(item)">
            <template v-slot:append>
              <v-btn icon :disabled="fetching" :loading="fetching" @click.stop="download(item)">
                <v-icon size="small">mdi:mdi-download</v-icon>
              </v-btn>
              <v-btn icon :disabled="fetching" :loading="fetching" @click.stop="deleteItem(item)">
                <v-icon size="small">mdi:mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Upload from "../../components/Files/Upload";
import Confirm from "../../components/ConfirmDialog.vue";
import util from "../../services/util";

export default {
  components: {
    Loading,
    Upload,
    Confirm,
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
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.name)) {
        return;
      }

      var self = this;
      self.fetching = true;

      api
        .post("sites/" + this.domainId + "/backups", { ids: [item.name] })
        .then(function () {
          self.fetchData();
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        });
    },
    restore: async function (item) {
      if (!await this.$refs.confirm.open("Restore " + item.name)) {
        return;
      }

      var self = this;
      self.fetching = true;

      api
        .post("sites/" + this.domainId + "/backups", { restore: item.name })
        .then(function () {
          self.fetchData();
        })
        .catch(function (error) {
          console.log(error);
          self.fetching = false;
        });
    },
    handleError(error) {
      this.error = error;
    },
    handleLoading(loading) {
      this.fetching = loading;
    },
    prettyBytes(value) {
      return util.prettyBytes(value);
    },
  },
};
</script>
