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
              <v-btn :disabled="dialog" :loading="dialog" @click.stop="deleteItem(item.id)">
                <v-icon size="small">mdi:mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="Product">
        <v-card-text>
          <v-text-field v-model="data.name" label="Name" required></v-text-field>

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
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("settings/products")
        .then(function (response) {
          console.log(response);
          self.items = response.data.products;
          document.title = "Products";
        })
        .catch(function (error) {
          self.error = error;
        })
        .finally(function () {
          self.fetching = false;
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

      var self = this;
      this.error = "";

      api
        .post("settings/products/" + id, { delete: 1 })
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
        });
    },
    saveItem() {
      var self = this;
      var url = "settings/products";

      if (this.data.id) {
        url += "/" + this.data.id;
      }

      api
        .post(url, this.data)
        .then(function (response) {
          if (response.data.error) {
            self.error = response.data.error;
          } else {
            self.drawer = false;
            self.fetchData();
          }
        })
        .catch(function (error) {
          self.error = error;
        });
    },
  },
};
</script>