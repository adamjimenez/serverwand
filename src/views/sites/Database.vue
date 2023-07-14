<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <div v-if="data.db_name == false">
        <v-btn :disabled="loading != ''" :loading="loading == 'database'" @click="addDatabase">
          Add Database
        </v-btn>
      </div>

      <div v-else>

        <v-list lines="two">
          <v-list-item>
            <v-list-item-title>
              <form :action="'http://' + data.server.ip + '/phpmyadmin/'" method="post" target="_blank">
                <input type="hidden" name="pma_username" :value="data.db_name" />
                <button type="submit">
                  PhpMyAdmin
                  <v-icon right>mdi:mdi-open-in-new</v-icon>
                </button>
              </form>
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>DB Name</v-list-item-title>
            <v-list-item-subtitle>
              {{ data.db_name }}
              <Copy :val="data.db_name" />
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>DB Username</v-list-item-title>
            <v-list-item-subtitle>
              {{ data.db_name }}
              <Copy :val="data.db_name" />
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>DB Password</v-list-item-title>
            <v-list-item-subtitle>
              {{ data.db_password }}
              <Edit :val="data.db_password" label="DB Password" name="password" password
                :path="'sites/' + this.domainId + '/database'" />
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

      </div>
    </v-card>
  </div>
</template>

<script>
import api from "../../services/api";
import Loading from "../../components/Loading";
import Copy from "../../components/Copy";
import Edit from "../../components/Edit";

export default {
  components: {
    Loading,
    Copy,
    Edit,
  },
  data() {
    return {
      domainId: null,
      post: null,
      error: null,
      data: {
        disk_usage: 0,
        server: {},
        app: {},
      },
      details: "",
      loading: false,
      fetching: false,
      dbPasswordPanel: [false],
      dbPasswordFormValid: true,
      showDbPassword: false,
      password: "",
      dbPassword: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match",
      },
      copyText: "Copy",
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;
      this.domainId = this.$route.params.id;

      api
        .get("sites/" + this.domainId + "/database")
        .then(function (response) {
          console.log(response);

          self.data = response.data.item;
          document.title = "Database" + " | " + self.data.domain;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;
        });
    },
    addDatabase() {
      var self = this;
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.domainId + "/database", { save: 1 })
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
          self.fetching = false;
          self.loading = false;
        });
    },
  },
};
</script>