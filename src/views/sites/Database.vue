<template>
  <div>
    <v-alert v-if="error" type="error" :text="error"></v-alert>

    <Loading :value="loading" />

    <v-card class="pa-3" :loading="fetching">
      <div v-if="data.db_name == false">
        <v-btn :disabled="loading != ''" :loading="loading == 'database'" @click="addDatabase" icon="mdi:mdi-plus"></v-btn>
      </div>

      <v-card max-width="300" v-else>

        <v-list lines="two">
          <v-list-item title="PhpMyAdmin" v-if="data.server.ip">
            <template v-slot:append>
              <form :action="'http://' + data.server.ip + '/phpmyadmin/'" method="post" target="_blank">
                <input type="hidden" name="pma_username" :value="data.db_name" />
                <input type="hidden" name="pma_password" :value="data.db_password" />
                <v-btn type="submit" icon>
                  <v-icon right>mdi:mdi-open-in-new</v-icon>
                </v-btn>
              </form>
            </template>
          </v-list-item>

          <v-list-item title="DB Name" :subtitle="data.db_name">
            <template v-slot:subtitle>
              <Copy :val="data.db_name" text />
            </template>
          </v-list-item>

          <v-list-item title="DB Username" :subtitle="data.db_name">
            <template v-slot:subtitle>
              <Copy :val="data.db_name" text />
            </template>
          </v-list-item>

          <v-list-item title="DB Password" subtitle="******">
            <template v-slot:subtitle>
              <Copy :val="data.db_password" text label="******" />
            </template>
            <template v-slot:append>
              <Edit :val="data.db_password" label="DB Password" name="password" password hideText
                :path="'sites/' + this.domainId + '/database'" />
            </template>
          </v-list-item>
        </v-list>

      </v-card>

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
      this.error = "";
      this.fetching = true;
      this.domainId = this.$route.params.id;

      api
        .get("sites/" + this.domainId + "/database")
        .then((response) => {
          console.log(response);

          this.data = response.data.item;
          document.title = "Database" + " | " + this.data.domain;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
        });
    },
    addDatabase() {
      this.error = "";
      this.loading = true;

      api
        .post("sites/" + this.domainId + "/database", { save: 1 })
        .then((response) => {
          console.log(response);

          if (response.data.error) {
            this.error = response.data.error;
          } else {
            this.fetchData();
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.fetching = false;
          this.loading = false;
        });
    },
  },
};
</script>