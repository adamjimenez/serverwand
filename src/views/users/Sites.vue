<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list>
        <v-list-item v-for="(item, i) in user_sites" :key="`item-${i}`" :title="item.domain">
          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.id" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Site">
        <v-card-text>
          <v-select v-model="data.domain" :items="sites" label="Site">
            <template slot="item" slot-scope="data">
              <v-list-item-title>
                {{ data.item.text }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ servers[data.item.server] }}
              </v-list-item-subtitle>
            </template>
          </v-select>

          <v-btn :disabled="!data.domain" :loading="dialog" color="success" @click="saveItem">
            Save
          </v-btn>
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
      data: {},
      user_sites: [],
      sites: [],
      servers: {},
      dialog: false,
      details: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      domain: {
        name: "",
      },
      drawer: false,
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
        .get("users/" + this.id + "/sites")
        .then(function (response) {
          console.log(response);
          self.user_sites = response.data.sites;
          document.title = 'Sites'
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });

      api
        .get("sites/")
        .then(function (response) {
          console.log(response);

          response.data.items.forEach((element) => {
            self.sites.push({
              title: element.domain,
              value: element.id,
              server: element.server,
            });
          });

          api.get("servers/").then(function (response) {
            response.data.items.forEach((element) => {
              self.servers[element.id] = element.name;
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.loading = false;
        });
    },
    addItem() {
      this.domain.name = "";
      this.drawer = true;
    },
    saveItem() {
      var self = this;

      if (this.data.domain) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/sites", this.data)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.dialog = false;
          })
          .finally(function () {
            self.dialog = false;
          });
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.domain)) {
        return;
      }

      var self = this;
      this.error = "";
      this.dialog = true;
      this.loading = item.id;

      api
        .post("users/" + this.id + "/sites", { delete: 1, domain: item.id })
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
          self.dialog = false;
          self.loading = null;
        });
    },
  },
};
</script>