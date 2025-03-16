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
            <v-btn icon :disabled="fetching" :loading="loading === item.name" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            Server
          </div>

         <v-btn
           icon="mdi:mdi-close"
           variant="text"
           @click="drawer = false"
          ></v-btn>
        </v-card-title>
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
      loading: null,
      id: null,
      error: null,
      data: {
        server: null
      },
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
      this.id = this.$route.params.id;

      api
        .get("teams/" + this.id)
        .then(response => {
          console.log(response);
          this.data = response.data.item;
          document.title = "Servers" + " | " + this.data.name;
        })
        .catch(error => console.log(error))
        .finally(() => this.fetching = false);

      api
        .get("servers/")
        .then(response => {
          console.log(response);

          response.data.items.forEach((element) => {
            this.servers.push({
              title: element.name,
              value: element.id,
            });
          });
        })
        .catch(error => console.log(error))
        .finally(() => this.loading = false);

      api.get("settings/profile").then(response => this.useMasterPassword = response.data.profile.prefs.useMasterPassword);
    },
    addItem() {
      this.data.server = null;
      this.drawer = true;
    },
    saveItem() {
      if (this.data.server) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("teams/" + this.id + '/servers', { server: this.data.server })
          .then(response => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
            } else {
              this.drawer = false;
              this.fetchData();
            }
          })
          .catch(error => {
            console.log(error);
            this.dialog = false;
          })
          .finally(() => this.dialog = false);
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.name)) {
        return;
      }

      this.error = "";
      this.dialog = true;
      this.loading = item.name;

      api
        .post("teams/" + this.id + '/servers', { delete: 1, server: item.id })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch(error => console.log(error))
        .finally(() => {
          this.dialog = false;
          this.loading = null;
        });
    }
  },
};
</script>