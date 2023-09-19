<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <v-dialog v-model="authRequired" max-width="240">
        <v-card tile flat>
          <v-card-text>
            <strong>DNS auth required</strong>
            <v-btn @click="authPrompt()">Fix</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-data-table :headers="headers" :items="data.records" class="results">
        <template v-slot:body="prop">
          <tbody>
            <tr v-for="item in prop.items" :key="item.id" @click="editItem(item)">
              <td class="text-start">
                {{ item.type }}
              </td>
              <td class="text-start">
                {{ item.name }}
              </td>
              <td class="text-start">
                {{ item.target }}
              </td>
              <td class="text-start">
                <div v-if="item.type === 'MX'">
                  {{ item.priority }}
                </div>
              </td>
              <td class="text-start">
                <v-icon small @click.stop="deleteItem(item)">
                  delete
                </v-icon>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <div>
        <v-card-title primary-title>
          <v-btn @click="addItem()"> Add a DNS Record </v-btn>
        </v-card-title>
      </div>
    </v-card>

    <v-navigation-drawer v-model="drawer" temporary right app>
      <v-card>
        <v-card-title> DNS Record </v-card-title>

        <v-card-text>
          <v-select :items="recordType" label="Type" v-model="record.type"></v-select>

          <v-text-field v-model="record.name" label="Hostname" required></v-text-field>

          <v-text-field v-model="record.target" label="Target" required></v-text-field>

          <v-text-field v-if="record.type === 'MX'" v-model="record.priority" label="Priority" required></v-text-field>

          <v-btn :disabled="fetching" :loading="fetching" color="success" @click="submitItem">
            Save
          </v-btn>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
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
      domainId: null,
      post: null,
      error: null,
      data: {
        records: [],
      },
      details: "",
      loading: false,
      fetching: false,
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      record: {},
      recordType: ["A", "CNAME", "MX", "TXT", "SRV", "NS"],
      drawer: false,
      timer: null,
      authRequired: false,
      headers: [
        {
          title: "Type ",
          key: "type",
        },
        {
          title: "Name ",
          key: "name",
        },
        {
          title: "Target ",
          key: "target",
        },
        {
          title: "Priority ",
          key: "priority",
        },
        {
          title: "",
          key: "actions",
          sortable: false,
        },
      ],
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
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
      this.domainId = this.$route.params.id;
      clearTimeout(self.timer);

      this.fetching = true;

      api
        .get("domains/" + this.domainId + "/records")
        .then(function (response) {
          console.log(response);

          self.data = response.data;

          //self.data = response.data.item
          document.title = "DNS" + " | " + self.data.item.domain;

          if (response.data.error == "auth") {
            self.authRequired = true;
            setTimeout(self.fetchData, 5000);
          } else {
            self.error = response.data.error;
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
      this.record = {};
      this.drawer = true;
    },
    submitItem() {
      this.saveItem();
    },
    saveItem(noAuthPrompt) {
      var self = this;

      if (this.record.type) {
        this.details = "";
        this.fetching = true;
        this.error = "";

        var url = "domains/" + this.domainId + "/records";

        if (this.record.id) {
          url += "/" + this.record.id;
        }

        api
          .post(url, this.record)
          .then(function (response) {
            console.log(response);

            if (!response.data.success) {
              if (response.data.error == "auth" && !noAuthPrompt) {
                self.authRequired = true;
                setTimeout(self.fetchData, 5000);
              } else {
                self.error = response.data.error;
              }
            } else {
              self.drawer = false;
              self.fetchData();
            }
          })
          .catch(function (error) {
            console.log(error);
            self.fetching = false;
          })
          .finally(function () {
            self.fetching = false;
          });
      }
    },
    editItem(item) {
      this.record = JSON.parse(JSON.stringify(item));
      this.drawer = true;
    },
    deleteItem: async function (item) {
      if (
        await this.$refs.confirm.open(
          "Confirm",
          'Delete record?'
        )
      ) {
        this.fetching = true;
        this.error = "";

        var self = this;
        api
          .post("domains/" + this.domainId + "/records/" + item.id, {
            delete: 1,
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
            self.fetching = false;
          });
      }
    },
    authPrompt() {
      this.authRequired = false;
      window.open(
        "https://serverwand.com/account/services/" + this.data.server.dns
      );
    },
  },
};
</script>
