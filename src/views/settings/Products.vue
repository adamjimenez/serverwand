<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="fetching" />

    <v-card class="mx-auto">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"> </v-btn>
      </v-card-actions>

      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :title="item.name" @click="editItem(item)">
            <template v-slot:append>
              <v-btn :disabled="dialog" :loading="loading === item.id" @click.stop="deleteItem(item.id)" size="small" icon="mdi:mdi-delete"></v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="Product">
        <v-card-text>
          <v-text-field v-model="data.name" label="Name" required autofocus></v-text-field>

          <v-select v-model="data.product_type" :items="product_types" label="Type"></v-select>

          <v-text-field v-model="data.price" label="Price" required></v-text-field>

          <v-select v-model="data.period" :items="periods" label="Period"></v-select>

          <v-btn :disabled="!data.name || !data.product_type || !data.price || !data.period" :loading="fetching"
            color="success" @click="saveItem">
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
    Confirm,
  },
  data() {
    return {
      id: null,
      error: "",
      data: {
        name: "",
      },
      product_types: [{
        title: "Domain renewal",
        value: "domain renewal",
      }, {
        title: "Hosting",
        value: "hosting",
      }, {
        title: "Custom",
        value: "custom",
      }],
      periods: [{
        title: "One off",
        value: "one-off",
      }, {
        title: "Monthly",
        value: "monthly",
      }, {
        title: "Yearly",
        value: "yearly",
      }],
      items: [],
      dialog: false,
      details: "",
      fetching: true,
      loading: null,
      server: {
        name: "",
      },
      provider_token: {},
      drawer: false,
    };
  },
  created() {
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
      this.fetching = true;

      api
        .get("settings/products")
        .then((response) => {
          console.log(response);
          this.items = response.data.products;
          document.title = "Products";
        })
        .catch((error) => {
          this.error = error;
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addItem() {
      this.data.label = "";
      this.data = {};
      this.drawer = true;
    },
    editItem(item) {
      this.data = JSON.parse(JSON.stringify(item));
      this.drawer = true;
    },
    deleteItem: async function (id) {
      if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
        return;
      }

      this.error = "";
      his.loading = id;

      api
        .post("settings/products/" + id, { delete: 1 })
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
          this.loading = null;
        });
    },
    saveItem() {
      let url = "settings/products";

      if (this.data.id) {
        url += "/" + this.data.id;
      }

      api
        .post(url, this.data)
        .then((response) => {
          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.drawer = false;
            this.fetchData();
          }
        })
        .catch((error) => {
          this.error = error;
        });
    },
  },
};
</script>