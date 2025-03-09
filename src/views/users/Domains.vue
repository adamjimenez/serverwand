<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list>
        <v-list-item v-for="(item, i) in user_domains" :key="`item-${i}`" :title="item.domain">
          <template v-slot:append>
            <v-btn icon :disabled="fetching" :loading="loading === item.domain" @click="deleteItem(item)" @click.stop>
              <v-icon size="small">mdi:mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Domain">
        <v-card-text>
          <v-select v-model="data.domain" :items="domains" label="Domain">
            <template slot="item" slot-scope="data">
              <v-list-item-title>
                {{ data.item.text }}
              </v-list-item-title>
              <v-list-item-subtitle> </v-list-item-subtitle>
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
      user_domains: [],
      domains: [],
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
      this.error = "";
      this.id = this.$route.params.id;
      this.fetching = true;

      api
        .get("users/" + this.id + "/domains")
        .then((response) => {
          console.log(response);
          this.user_domains = response.data.domains;
          document.title = 'Domains';
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });

      api
        .get("domains/")
        .then((response) => {
          console.log(response);

          response.data.items.forEach((element) => {
            this.domains.push({
              title: element.domain,
              value: element.id,
              server: element.server,
            });
          });

          api.get("servers/");
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addItem() {
      this.domain.name = "";
      this.drawer = true;
    },
    saveItem() {
      if (this.data.domain) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        api
          .post("users/" + this.id + "/domains", this.data)
          .then((response) => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
            } else {
              this.drawer = false;
              this.fetchData();
            }
          })
          .catch((error) => {
            console.log(error);
            this.dialog = false;
          })
          .finally(() => {
            this.dialog = false;
          });
      }
    },
    deleteItem: async function (item) {
      if (!await this.$refs.confirm.open("Delete " + item.domain)) {
        return;
      }

      this.error = "";
      this.dialog = true;
      this.loading = item.domain;

      api
        .post("users/" + this.id + "/domains", { delete: 1, domain: item.id })
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
          this.dialog = false;
          this.loading = null;
        });
    },
  },
};
</script>