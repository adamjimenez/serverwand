<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-container>
        <v-row>
          <v-switch
            v-model="pma_restrictions"
            label="PHPMyAdmin restrictions"
            @change="toggle()"
            class="mx-3"
          ></v-switch>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="primary" v-bind="attrs" v-on="on">
                mdi-information
              </v-icon>
            </template>
            <span>
              Enforce access restrictions for PHPMYAdmin. We recommend this is
              enabled.</span
            >
          </v-tooltip>
        </v-row>
      </v-container>
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in items">
            <v-list-item :key="`item-${i}`" :value="item">
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.ip }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.label }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
                    @click="deleteItem(item.line)"
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
          <v-btn @click="addItem()" :disabled="!pma_restrictions">
            Add IP
          </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-form ref="form">
          <v-card-title> IP </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="item.label"
              label="Label"
              required
            ></v-text-field>

            <v-text-field
              v-model="item.ip"
              label="IP address"
              required
              :rules="[rules.ip]"
            ></v-text-field>

            <v-btn
              :disabled="fetching"
              :loading="fetching"
              color="success"
              @click="saveItem"
            >
              Save
            </v-btn>
          </v-card-text>
        </v-form>
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
      loading: false,
      error: "",
      pma_restrictions: false,
      items: {},
      item: {},
      details: "",
      fetching: false,
      drawer: false,
      serverId: 0,
      rules: {
        required: (value) => !!value || "Required.",
        ip: (v) =>
          !v ||
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            v
          ) ||
          "Invalid IP address",
      },
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.serverId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("servers/" + this.serverId + "/database")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.pma_restrictions = response.data.pma_restrictions;
          self.items = response.data.ips;
          self.data = response.data.item;
          document.title = "Database" + " | " + self.data.name;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    toggle() {
      var self = this;
      this.fetching = true;
      this.error = "";

      api
        .post("servers/" + this.serverId + "/database", {
          pma_restrictions: this.pma_restrictions,
        })
        .then(function (response) {
          console.log(response);

          if (!response.data.success) {
            self.error = response.data.error;
          } else {
            self.fetchData();
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addItem() {
      this.item = {};
      this.drawer = true;
    },
    deleteItem(line) {
      this.$confirm("Delete IP?").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;
          this.error = "";

          api
            .post("servers/" + this.serverId + "/database", { line: line })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.error = response.data.error;
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              console.log(error);
            })
            .finally(function () {
              self.fetching = false;
            });
        }
      });
    },
    saveItem() {
      var self = this;
      this.error = "";

      if (this.$refs.form.validate()) {
        this.fetching = true;

        api
          .post("servers/" + this.serverId + "/database", this.item)
          .then(function (response) {
            console.log(response);
            if (response.data.error) {
              self.error = response.data.error;
            } else {
              self.drawer = false;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(function () {
            self.fetchData();
          });
      }
    },
  },
};
</script>
