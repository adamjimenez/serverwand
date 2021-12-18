<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="fetching" />

    <v-card class="mx-auto">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in items">
            <v-list-item :key="`item-${i}`" :value="item">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.label }}<br />
                    {{ item.api_key }}
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    :disabled="dialog"
                    :loading="dialog"
                    @click="deleteItem(item.id)"
                  >
                    <v-icon small>delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </template>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add API key </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" absolute temporary right>
      <v-card>
        <v-card-title> API key </v-card-title>

        <v-card-text>
          <v-text-field v-model="data.label" label="Label"></v-text-field>

          <v-btn
            :disabled="dialog"
            :loading="dialog"
            color="success"
            @click="saveItem"
          >
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-dialog v-model="dialog" width="630">
      <v-card color="primary" dark>
        <v-card-text>
          <div>
            Api key: {{ details }}
            <Copy :val="details" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";

export default {
  components: {
    Loading,
    Copy,
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
    deleteItem(id) {
      var self = this;
      this.error = "";

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