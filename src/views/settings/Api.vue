<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="fetching" />

    <v-card class="mx-auto">
      <v-card-actions>
        <v-btn @click="addItem()" icon="mdi:mdi-plus"></v-btn>
      </v-card-actions>

      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :value="item" :title="item.label" :subtitle="item.api_key">
            <template v-slot:append>
              <v-btn :disabled="dialog" :loading="loading === item.id" @click.stop="deleteItem(item.id)" size="small" icon="mdi:mdi-delete"></v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-dialog v-model="drawer" max-width="600">
      <v-card title="API Key">
        <v-card-text>
          <v-text-field v-model="data.label" label="Label" autofocus></v-text-field>
          <v-btn :disabled="data.label.length === 0" :loading="dialog" color="success" @click="saveItem">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" width="600">
      <v-card color="primary">
        <v-card-text>
          Api key: {{ details }}
          <Copy :val="details" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <Confirm ref="confirm" />

  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";
import Confirm from "../../components/ConfirmDialog.vue";

export default {
  components: {
    Loading,
    Copy,
    Confirm,
  },
  data() {
    return {
      error: null,
      data: {
        label: '',
      },
      items: [],
      dialog: false,
      details: "",
      fetching: true,
      loading: null,
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
      server: {
        name: "",
      },
      drawer: false,
    };
  },
  created() {
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
        .get("apikeys")
        .then(function (response) {
          console.log(response);
          self.items = response.data.items;
          document.title = "Api";
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.data.label = '';
      this.drawer = true;
    },
    saveItem() {
      var self = this;
      this.details = "";
      this.error = "";

      api
        .post("apikeys", this.data)
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.dialog = true;
            self.details = response.data.api_key;

            self.drawer = false;
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    deleteItem: async function (id) {
      if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
        return;
      }

      var self = this;
      this.error = "";
      this.loading = id;

      api
        .post("apikeys", { delete: 1, api_key: id })
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
          self.loading = null;
        });
    },
  },
};
</script>