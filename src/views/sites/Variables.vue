<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list>
        <v-list-item-group>
          <template v-for="(item, i) in data.variables">
            <v-list-item
              :key="`item-${i}`"
              :value="item"
              @click="editItem(item)"
            >
              <template v-slot:default>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-icon v-if="item.active === false">block</v-icon>
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.value }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn
                    icon
                    :disabled="fetching"
                    :loading="fetching"
                    @click="deleteItem(item.line)"
                    @click.stop
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
          <v-btn @click="addItem()"> Add variable </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer app v-model="drawer" temporary right>
      <v-card>
        <v-form ref="form">
          <v-card-title> Variable </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="item.line"
              label="Line"
              v-show="false"
            ></v-text-field>

            <v-text-field
              v-model="item.name"
              label="Name"
              required
              :rules="[rules.required, rules.alphanumeric]"
            ></v-text-field>

            <v-text-field
              v-model="item.value"
              label="Value"
              required
              :rules="[rules.required, rules.alphanumeric]"
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
      error: "",
      fetching: false,
      loading: false,
      drawer: false,
      data: {
        users: {},
      },
      item: {
        name: "",
        value: "",
      },
      variables: [],
      rules: {
        required: (value) => !!value || "Required.",
        alphanumeric: (v) =>
          /^[a-zA-Z0-9-_]+$/g.test(v) || "Must contain a-z characters only",
      },
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.siteId = this.$route.params.id;
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("sites/" + this.siteId + "/variables")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.data = response.data.item;
          document.title = "Variables" + " | " + self.data.name;
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
    editItem(item) {
      this.item = JSON.parse(JSON.stringify(item));
      this.drawer = true;
    },
    deleteItem(line) {
      this.$confirm("Delete variaable").then((res) => {
        if (res) {
          var self = this;
          this.fetching = true;
          this.error = "";

          api
            .post("sites/" + this.siteId + "/variables", { line: line })
            .then(function (response) {
              console.log(response);

              if (!response.data.success) {
                self.fetching = false;
                self.error = response.data.error;
              } else {
                self.fetchData();
              }
            })
            .catch(function (error) {
              self.fetching = false;
              console.log(error);
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
          .post("sites/" + this.siteId + "/variables", this.item)
          .then(function (response) {
            console.log(response);
            if (response.data.error) {
              self.fetching = false;
              self.error = response.data.error;
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            self.fetching = false;
            console.log(error);
          });
      }
    },
  },
};
</script>
