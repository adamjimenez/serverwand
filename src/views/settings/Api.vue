<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="fetching" />

    <v-card class="mx-auto">
      <v-list group max-width="600">
        <template v-for="(item, i) in items" :key="`item-${i}`">
          <v-list-item :value="item" :title="item.label" :subtitle="item.api_key">
            <template v-slot:append>
              <v-btn :disabled="dialog" :loading="dialog" @click.stop="deleteItem(item.id)">
                <v-icon size="small">mdi:mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-card>
      <v-card-title primary-title>
        <v-btn @click="addItem()"> Add API key </v-btn>
      </v-card-title>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card title="API Key">
        <v-card-text>
          <v-text-field v-model="data.label" label="Label"></v-text-field>

          <v-btn :disabled="data.label.length === 0" :loading="dialog" color="success" @click="saveItem">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" width="630">
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
        label: "",
      },
      items: [],
      dialog: false,
      details: "",
      fetching: true,
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
      this.data.label = "";
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
      var self = this;
      this.error = "";

      if (!await this.$refs.confirm.open("Are you sure you want to delete this item?")) {
        return;
      }

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
        });
    },
  },
};
</script>