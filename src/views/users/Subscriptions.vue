<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-data-table :headers="headers" :items="subscriptions" class="results" mobile-breakpoint="0" @click:row="editItem">

        <template v-slot:item.created="{ item }">
          {{ formatDate(item.created) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon :disabled="fetching" :loading="loading === item.id" @click="deleteItem(item.id)">
            <v-icon size="small">delete</v-icon>
          </v-btn>
        </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Subscription">
        <v-card-text>
          <v-text-field v-model="data.domain" label="Domain" required></v-text-field>

          <v-select v-model="data.product" :items="products" label="Product"></v-select>

          <v-btn :disabled="!data.domain || !data.product" :loading="loading" color="success" @click="saveItem">
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
import util from "../../services/util";

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
      subscriptions: [],
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
      products: [],
      headers: [{
        title: "Domain",
        key: "domain",
      }, {
        title: "Name",
        key: "name",
      }, {
        title: "Created",
        key: "created",
        class: 'd-none d-sm-table-cell',
        cellClass: 'd-none d-sm-table-cell',
      }],
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
        .get("users/" + this.id + "/subscriptions")
        .then((response) => {
          console.log(response);
          this.subscriptions = response.data.subscriptions;
          document.title = 'Subscriptions'
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });

      api
        .get("settings/products")
        .then((response) => {
          console.log(response);

          response.data.products.forEach((element) => {
            this.products.push({
              title: element.name,
              value: element.id,
            });
          });
        })
        .catch((error) => {
          this.error = error;
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.data = {};
      this.drawer = true;
    },
    editItem(item) {
      this.data = JSON.parse(JSON.stringify(item));
      this.drawer = true;
    },
    saveItem() {
      if (this.data.product) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        let url = "users/" + this.id + "/subscriptions";

        if (this.data.id) {
          url += "/" + this.data.id;
        }

        api
          .post(url, this.data)
          .then((response) => {
            console.log(response);

            if (!response.data.success) {
              this.error = response.data.error;
            } else {
              this.data.subscription = "";
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
      if (!await this.$refs.confirm.open("Delete " + item.id)) {
        return;
      }

      this.error = "";
      this.dialog = true;
      this.loading = item.id;

      api
        .post("users/" + this.id + "/subscriptions/" + item.id, { delete: 1 })
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
    formatDate(value) {
      return util.formatDate(value);
    },
  },
};
</script>