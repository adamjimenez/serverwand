<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-list>
        <v-list group>

          <v-list-item v-for="(item, i) in data.variables" :key="`item-${i}`" :title="item.name" :subtitle="item.value" @click="editItem(item)">
            <template v-slot:append>
              <v-btn icon :disabled="fetching" :loading="fetching" @click="deleteItem(item.line)" @click.stop>
                <v-icon size="small">mdi:mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>

        </v-list>
      </v-list>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add variable </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-dialog v-model="drawer">
      <v-card>
        <v-form v-model="valid">
          <v-card-title> Variable </v-card-title>

          <v-card-text>
            <v-text-field v-model="item.line" label="Line" v-show="false"></v-text-field>

            <v-text-field v-model="item.name" label="Name" required
              :rules="[rules.required, rules.alphanumeric]"></v-text-field>

            <v-text-field v-model="item.value" label="Value" required
              :rules="[rules.required, rules.alphanumeric]"></v-text-field>

            <v-btn :disabled="!valid" :loading="fetching" color="success" @click="saveItem">
              Save
            </v-btn>
          </v-card-text>
        </v-form>
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
      valid: false,
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
    deleteItem: async function (line) {
      if (
        await this.$refs.confirm.open(
          "Confirm",
          "Delete Variable?"
        )
      ) {
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
      };
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
