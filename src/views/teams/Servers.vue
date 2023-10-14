<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>
      <v-list max-width="600">
        <v-list-item v-for="(item, i) in data.servers" :key="`item-${i}`" :title="item.name">
          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="fetching" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="Server">
        <v-card-text>
          <v-select v-model="data.server" :items="servers" label="Server"></v-select>

          <v-btn :disabled="!data.server" :loading="dialog" color="success" @click="saveItem">
            Save
          </v-btn>

          <p v-if="useMasterPassword" style="font-size: 12px;" class="mt-3">
            Note: Server keys shared with other users will not be encrypted with
            your master password
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Confirm
  },
  data() {
    return {
      fetching: false,
      loading: false,
      id: null,
      error: null,
      data: {},
      servers: [],
      dialog: false,
      details: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      server: {
        name: "",
      },
      drawer: false,
      useMasterPassword: false,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.id = this.$route.params.id;
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

      api
        .get("teams/" + this.id)
        .then(response => {
          console.log(response);
          self.data = response.data.item;
          document.title = "Servers" + " | " + self.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => self.fetching = false);

      api
        .get("servers/")
        .then(response => {
          console.log(response);

          response.data.items.forEach((element) => {
            self.servers.push({
              title: element.name,
              value: element.id,
            });
          });
        })
        .catch(error => console.log(error))
        .finally(() => self.loading = false);

      api.get("settings/profile").then(response => self.useMasterPassword = response.data.profile.prefs.useMasterPassword);
    },
    addItem() {
      this.server.name = "";
      this.drawer = true;
    },
    saveItem() {
      var self = this;

      if (this.data.server) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("teams/" + this.id + '/servers', { server: this.data.server })
          .then(response => {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(error => {
            console.log(error);
            self.dialog = false;
          })
          .finally(() => self.dialog = false);
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.name)) {
        return;
      }

      var self = this;
      this.error = "";
      this.dialog = true;
      this.loading = true;

      api
        .post("teams/" + this.id + '/servers', { delete: 1, server: item.id })
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
          } else {
            self.fetchData();
          }
        })
        .catch(error => console.log(error))
        .finally(function () {
          self.dialog = false;
          self.loading = false;
        });
    }
  },
};
</script>