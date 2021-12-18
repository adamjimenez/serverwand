<template>
  <v-layout row>
    <v-flex>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>

      <Loading :value="loading" />

      <v-card flat :loading="fetching">
        <v-card-title primary-title>
          <div class="headline">Sites</div>
        </v-card-title>

        <v-card flat>
          <v-card-text>
            <v-select
              v-model="server"
              :items="server_opts"
              label="Server"
            ></v-select>
          </v-card-text>
        </v-card>

        <v-data-table :headers="headers" :items="filtered" class="results">
          <template v-slot:item.domain="{ item }">
            <v-list-item>
              <v-icon class="mr-3">fas fa-sitemap</v-icon>

              <router-link :to="'/sites/' + item.id + '/summary'">
                <v-list-item-title v-html="item.domain"></v-list-item-title>
                <v-list-item-subtitle>{{
                  servers[item.server]
                }}</v-list-item-subtitle>
              </router-link>
            </v-list-item>
          </template>
          <template v-slot:item.usage="{ item }">
            <div v-if="item.usage > 0">
              {{ (item.usage * 1024) | prettyBytes }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import api from "../services/api";
import Loading from "../components/Loading";

export default {
  components: {
    Loading,
  },
  data() {
    return {
      fetching: false,
      loading: false,
      error: "",
      filtered: [],
      items: [],
      servers: {},
      server: "*",
      server_opts: [
        {
          text: "All",
          value: "*",
        },
      ],
      searchPanel: [false],
      search: "",
      selected: [],
      headers: [
        {
          text: "Domain ",
          value: "domain",
        },
        {
          text: "IP ",
          value: "ip",
        },
        {
          text: "MX ",
          value: "mx",
        },
        {
          text: "Usage ",
          value: "usage",
        },
      ],
    };
  },
  created() {
    document.title = "Sites";
    this.fetchData();
  },
  watch: {
    server: function () {
      this.filtered = [];

      this.items.forEach((element) => {
        if (this.server === "*" || element.server == this.server) {
          this.filtered.push(element);
        }
      });

      localStorage.server = this.server;
    },
  },
  methods: {
    fetchData() {
      var self = this;
      this.error = "";
      this.fetching = true;

      api
        .get("sites/")
        .then(function (response) {
          console.log(response);

          if (response.data.error) {
            self.error = response.data.error;
            return false;
          }

          self.items = response.data.items;

          response.data.items.forEach((element) => {
            self.filtered.push(element);
          });

          api.get("servers/").then(function (response) {
            response.data.items.forEach((element) => {
              self.$set(self.servers, element.id, element.name);

              self.server_opts.push({
                text: element.name,
                value: element.id,
              });
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          self.fetching = false;

          if (localStorage.server) self.server = localStorage.server;
        });
    },
  },
};
</script>

<style>
.results a {
  color: inherit !important;
}
.results .v-list__tile__sub-title {
  opacity: 0.7;
}
</style>