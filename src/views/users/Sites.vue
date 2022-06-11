<template>
  <div>
    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in user_sites">
            <v-list-item :key="`item-${i}`" :value="item">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.domain }}
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
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
          <v-btn @click="addItem()"> Add site </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-card-title> Domain </v-card-title>

        <v-card-text>
          <v-select v-model="data.domain" :items="sites" label="Site">
            <template slot="item" slot-scope="data">
              <v-list-item-content>
                <v-list-item-title>
                  {{ data.item.text }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ servers[data.item.server] }}
                </v-list-item-subtitle>
              </v-list-item-content> </template
            >>
          </v-select>

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
              text: element.domain,
              value: element.id,
              server: element.server,
            });
          });

          api.get("servers/").then(function (response) {
            response.data.items.forEach((element) => {
              self.$set(self.servers, element.id, element.name);
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
    deleteItem(id) {
      this.$confirm("Delete domain?").then((res) => {
        if (!res) {
          return;
        }

        var self = this;
        this.error = "";
        this.dialog = true;
        this.loading = true;

        api
          .post("users/" + this.id + "/sites", { delete: 1, domain: id })
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