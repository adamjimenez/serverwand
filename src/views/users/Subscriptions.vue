<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-data-table :headers="headers" :items="subscriptions" class="results">
        <template v-slot:body="prop">
          <tbody>
            <tr v-for="item in prop.items" :key="item.id">
              <td class="text-start" @click="editItem(item)">
                {{ item.domain }}
              </td>
              <td class="text-start">
                {{ item.name }}
              </td>
              <td class="text-start">
                {{ item.created }}
              </td>
              <td class="text-start">
                <v-btn
                  icon
                  :disabled="fetching"
                  :loading="fetching"
                  @click="deleteItem(item.id)"
                >
                  <v-icon small>delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add subscription </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-card-title> Subscription </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="data.domain"
            label="Domain"
            required
          ></v-text-field>

          <v-select
            v-model="data.product"
            :items="products"
            label="Product"
          ></v-select>

          <v-btn
            :disabled="dialog"
            :loading="loading"
            color="success"
            @click="saveItem"
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

export default {
  components: {
    Loading,
  },
  data() {
    return {
      fetching: false,
      loading: false,
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
      headers: [
        {
          text: "Domain ",
          value: "domain",
        },
        {
          text: "Name ",
          value: "name",
        },
        {
          text: "Created ",
          value: "created",
        },
      ],
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
        .get("users/" + this.id + "/subscriptions")
        .then(function (response) {
          console.log(response);
          self.subscriptions = response.data.subscriptions;
          document.title = 'Subscriptions'
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });

      api
        .get("settings/products")
        .then(function (response) {
          console.log(response);

          response.data.products.forEach((element) => {
            self.products.push({
              text: element.name,
              value: element.id,
            });
          });
        })
        .catch(function (error) {
          self.error = error;
        })
        .finally(function () {
          self.fetching = false;
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
      var self = this;

      if (this.data.product) {
        this.details = "";
        this.dialog = true;
        this.error = "";

        var url = "users/" + this.id + "/subscriptions";

        if (this.data.id) {
          url += "/" + this.data.id;
        }

        api
          .post(url, this.data)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              self.error = response.data.error;
            } else {
              self.data.subscription = "";
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
    deleteItem(id) {
      this.$confirm("Delete subscription?").then((res) => {
        if (!res) {
          return;
        }

        var self = this;
        this.error = "";
        this.dialog = true;
        this.loading = true;

        api
          .post("users/" + this.id + "/subscriptions/" + id, { delete: 1 })
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
            self.loading = false;
          });
      });
    },
  },
};
</script>